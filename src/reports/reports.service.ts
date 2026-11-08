import { BadRequestException, Injectable } from "@nestjs/common";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { RevenueQueryDto } from "./reports.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dailyRevenue(query: RevenueQueryDto) {
    const fromText = query.date ?? query.from;
    const toText = query.date ?? query.to ?? fromText;

    if (!fromText || !toText) {
      throw new BadRequestException("Cần truyền date hoặc cả from và to");
    }

    if (fromText > toText) {
      throw new BadRequestException("Từ ngày (from) không được lớn hơn đến ngày (to)");
    }

    const start = new Date(`${fromText}T00:00:00+07:00`);
    const end = new Date(`${toText}T23:59:59.999+07:00`);

    const [payments, completedCount, cancelledCount] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.SUCCESS,
          paidAt: { gte: start, lte: end },
        },
        include: {
          invoice: {
            include: {
              booking: {
                include: { field: true },
              },
            },
          },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.COMPLETED,
          startAt: { gte: start, lte: end },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.CANCELLED,
          startAt: { gte: start, lte: end },
        },
      }),
    ]);

    const perField = new Map<
      number,
      { fieldId: number; fieldName: string; revenue: number; count: number }
    >();

    let totalRevenue = 0;

    for (const payment of payments) {
      // TC-12: Revenue must only sum successful payments, ignoring any cancelled bookings
      if (payment.invoice.booking.status === BookingStatus.CANCELLED) {
        continue;
      }

      const amount = Number(payment.amount);
      totalRevenue += amount;

      const field = payment.invoice.booking.field;
      const current = perField.get(field.id) ?? {
        fieldId: field.id,
        fieldName: field.name,
        revenue: 0,
        count: 0,
      };
      current.revenue += amount;
      current.count += 1;
      perField.set(field.id, current);
    }

    return {
      from: fromText,
      to: toText,
      revenue: totalRevenue,
      paidTransactionCount: payments.length,
      completedBookingCount: completedCount,
      cancelledBookingCount: cancelledCount,
      byField: [...perField.values()].sort((a, b) => a.fieldId - b.fieldId),
      // Alias byPitch for backward compatibility
      byPitch: [...perField.values()].map((f) => ({
        pitchId: f.fieldId,
        pitchName: f.fieldName,
        revenue: f.revenue,
        invoiceCount: f.count,
      })),
    };
  }
}

