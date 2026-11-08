import { BookingStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { PrismaService } from "../prisma.service";

describe("ReportsService - Revenue Calculations", () => {
  let service: ReportsService;
  let mockPrisma: any;

  // TC-12: Revenue must aggregate only successful payments, and exclude cancelled bookings
  it("TC-12: correctly aggregates total revenue from valid payments and excludes cancelled bookings", async () => {
    const field1 = { id: 1, name: "Sân 5A" };
    const field2 = { id: 2, name: "Sân 7A" };

    const validPayment1 = {
      id: 1,
      amount: new Prisma.Decimal(300000),
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.CASH,
      paidAt: new Date("2026-11-15T10:00:00+07:00"),
      invoice: {
        id: 10,
        booking: {
          id: 101,
          status: BookingStatus.COMPLETED,
          field: field1,
        },
      },
    };

    const validPayment2 = {
      id: 2,
      amount: new Prisma.Decimal(500000),
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.TRANSFER,
      paidAt: new Date("2026-11-15T15:30:00+07:00"),
      invoice: {
        id: 11,
        booking: {
          id: 102,
          status: BookingStatus.COMPLETED,
          field: field2,
        },
      },
    };

    const cancelledPayment = {
      id: 3,
      amount: new Prisma.Decimal(350000),
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.CASH,
      paidAt: new Date("2026-11-15T16:00:00+07:00"),
      invoice: {
        id: 12,
        booking: {
          id: 103,
          status: BookingStatus.CANCELLED, // CANCELLED BOOKING: Should NOT be added to revenue
          field: field1,
        },
      },
    };

    mockPrisma = {
      payment: {
        findMany: jest.fn().mockResolvedValue([validPayment1, validPayment2, cancelledPayment]),
      },
      booking: {
        count: jest
          .fn()
          .mockResolvedValueOnce(2) // 2 completed
          .mockResolvedValueOnce(1), // 1 cancelled
      },
    } as unknown as PrismaService;

    service = new ReportsService(mockPrisma);

    const report = await service.dailyRevenue({ date: "2026-11-15" });

    // Expect revenue = 300,000 + 500,000 = 800,000 (350,000 cancelled booking is omitted)
    expect(report.revenue).toBe(800000);
    expect(report.completedBookingCount).toBe(2);
    expect(report.cancelledBookingCount).toBe(1);

    // Breakdown by pitch
    expect(report.byField).toHaveLength(2);
    expect(report.byField.find((f) => f.fieldId === 1)?.revenue).toBe(300000);
    expect(report.byField.find((f) => f.fieldId === 2)?.revenue).toBe(500000);
  });
});

