import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { InvoiceQueryDto } from "./invoices.dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: InvoiceQueryDto) {
    let dateFilter = {};
    if (query.date) {
      const dayStart = new Date(`${query.date}T00:00:00+07:00`);
      const dayEnd = new Date(`${query.date}T23:59:59+07:00`);
      dateFilter = {
        booking: {
          startAt: { gte: dayStart, lte: dayEnd },
        },
      };
    }

    return this.prisma.invoice.findMany({
      where: {
        ...dateFilter,
        ...(query.status ? { status: query.status } : {}),
        ...(query.invoiceCode ? { invoiceCode: { equals: query.invoiceCode.trim(), mode: "insensitive" } } : {}),
      },
      include: {
        booking: {
          include: { field: true, timeSlot: true },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async getById(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: { field: true, timeSlot: true },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException("Không tìm thấy hóa đơn");
    }

    return invoice;
  }
}

