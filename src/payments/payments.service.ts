import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, InvoiceStatus, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreatePaymentDto, PaymentQueryDto } from "./payments.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async list(query: PaymentQueryDto) {
    let dateFilter = {};
    if (query.date) {
      const dayStart = new Date(`${query.date}T00:00:00+07:00`);
      const dayEnd = new Date(`${query.date}T23:59:59+07:00`);
      dateFilter = { paidAt: { gte: dayStart, lte: dayEnd } };
    }

    return this.prisma.payment.findMany({
      where: {
        ...dateFilter,
        ...(query.method ? { method: query.method } : {}),
      },
      include: {
        invoice: {
          include: {
            booking: {
              include: { field: true, timeSlot: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async recordPayment(dto: CreatePaymentDto, currentUser?: AuthenticatedUser, ip?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(${dto.invoiceId})`;

      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
        include: { booking: true },
      });

      if (!invoice) {
        throw new NotFoundException("Không tìm thấy hóa đơn cần thanh toán");
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestException("Hóa đơn này đã được thanh toán hoàn tất");
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException("Hóa đơn này đã bị hủy, không thể thanh toán");
      }

      const now = new Date();

      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId: dto.invoiceId,
          amount: new Prisma.Decimal(dto.amount),
          method: dto.method,
          status: PaymentStatus.SUCCESS,
          paidAt: now,
          referenceCode: dto.referenceCode?.trim() || null,
        },
      });

      // 2. Mark Invoice as PAID
      const updatedInvoice = await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: InvoiceStatus.PAID },
      });

      // 3. Mark linked Booking as COMPLETED
      await tx.booking.update({
        where: { id: invoice.bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      // 4. Audit Log
      await this.auditLogs.log({
        userId: currentUser?.sub,
        action: "RECORD_PAYMENT",
        resource: "payments",
        resourceId: payment.id,
        details: {
          invoiceId: invoice.id,
          invoiceCode: invoice.invoiceCode,
          amount: dto.amount,
          method: dto.method,
        },
        ipAddress: ip,
      });

      return {
        payment,
        invoice: updatedInvoice,
      };
    });
  }
}

