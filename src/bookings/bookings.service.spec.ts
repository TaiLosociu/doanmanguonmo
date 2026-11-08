import { BadRequestException, ConflictException } from "@nestjs/common";
import { BookingStatus, DayType, FieldStatus, FieldType, Prisma } from "@prisma/client";
import { BookingsService } from "./bookings.service";
import { PrismaService } from "../prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

describe("BookingsService - Core Business Logic & Conflict Detection", () => {
  let service: BookingsService;
  let mockPrisma: any;
  let mockAuditLogs: any;

  beforeEach(() => {
    mockAuditLogs = {
      log: jest.fn().mockResolvedValue(undefined),
    };
  });

  // TC-06: Booking an available slot succeeds (returns 201/created booking with snapshot price)
  it("TC-06: creates a booking successfully for an available slot with snapshot price", async () => {
    const bookingDate = "2026-11-15";
    const field = {
      id: 1,
      name: "Sân 5A",
      fieldType: FieldType.SAN_5,
      status: FieldStatus.ACTIVE,
    };
    const timeSlot = {
      id: 2,
      label: "07:30 - 09:00",
      startTime: "07:30",
      endTime: "09:00",
      isPeakHour: false,
    };
    const priceRule = {
      id: 10,
      fieldId: 1,
      timeSlotId: 2,
      dayType: DayType.WEEKEND,
      price: new Prisma.Decimal(345000),
    };

    const createdBooking = {
      id: 101,
      bookingCode: "SAN-TEST-001",
      customerId: null,
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      fieldId: 1,
      timeSlotId: 2,
      startAt: new Date("2026-11-15T07:30:00+07:00"),
      endAt: new Date("2026-11-15T09:00:00+07:00"),
      unitPrice: new Prisma.Decimal(345000),
      totalPrice: new Prisma.Decimal(345000),
      status: BookingStatus.PENDING,
      field,
      timeSlot,
    };

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      field: { findUnique: jest.fn().mockResolvedValue(field) },
      timeSlot: { findUnique: jest.fn().mockResolvedValue(timeSlot) },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null), // No conflict
        create: jest.fn().mockResolvedValue(createdBooking),
      },
      priceRule: { findUnique: jest.fn().mockResolvedValue(priceRule) },
    };

    mockPrisma = {
      $transaction: jest.fn((callback: any) => callback(tx)),
    } as unknown as PrismaService;

    service = new BookingsService(mockPrisma, mockAuditLogs);

    const result = await service.createBooking({
      fieldId: 1,
      timeSlotId: 2,
      bookingDate,
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(101);
    expect(result.status).toBe(BookingStatus.PENDING);
    expect(result.totalPrice).toEqual(new Prisma.Decimal(345000));
    expect(tx.booking.findFirst).toHaveBeenCalled();
    expect(tx.booking.create).toHaveBeenCalled();
  });

  // TC-07: Anti-conflict detection - rejects overlapping slot with 409 Conflict
  it("TC-07: rejects booking with 409 Conflict when overlapping slot is already booked", async () => {
    const bookingDate = "2026-11-15";
    const field = {
      id: 1,
      name: "Sân 5A",
      fieldType: FieldType.SAN_5,
      status: FieldStatus.ACTIVE,
    };
    const timeSlot = {
      id: 2,
      label: "07:30 - 09:00",
      startTime: "07:30",
      endTime: "09:00",
      isPeakHour: false,
    };

    const existingConflictBooking = {
      id: 99,
      fieldId: 1,
      status: BookingStatus.CONFIRMED,
    };

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      field: { findUnique: jest.fn().mockResolvedValue(field) },
      timeSlot: { findUnique: jest.fn().mockResolvedValue(timeSlot) },
      booking: {
        findFirst: jest.fn().mockResolvedValue(existingConflictBooking), // Overlap detected!
        create: jest.fn(),
      },
      priceRule: { findUnique: jest.fn() },
    };

    mockPrisma = {
      $transaction: jest.fn((callback: any) => callback(tx)),
    } as unknown as PrismaService;

    service = new BookingsService(mockPrisma, mockAuditLogs);

    await expect(
      service.createBooking({
        fieldId: 1,
        timeSlotId: 2,
        bookingDate,
        customerName: "Trần Văn B",
        customerPhone: "0909888777",
      }),
    ).rejects.toThrow(ConflictException);

    expect(tx.booking.create).not.toHaveBeenCalled();
  });

  // TC-08: Business constraint - rejects booking on field in MAINTENANCE or INACTIVE status
  it("TC-08: rejects booking with 400 Bad Request when field is in MAINTENANCE status", async () => {
    const bookingDate = "2026-11-15";
    const maintenanceField = {
      id: 4,
      name: "Sân 5C (Bảo trì)",
      fieldType: FieldType.SAN_5,
      status: FieldStatus.MAINTENANCE,
    };

    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      field: { findUnique: jest.fn().mockResolvedValue(maintenanceField) },
      timeSlot: { findUnique: jest.fn() },
      booking: { findFirst: jest.fn() },
    };

    mockPrisma = {
      $transaction: jest.fn((callback: any) => callback(tx)),
    } as unknown as PrismaService;

    service = new BookingsService(mockPrisma, mockAuditLogs);

    await expect(
      service.createBooking({
        fieldId: 4,
        timeSlotId: 1,
        bookingDate,
        customerName: "Lê Văn C",
        customerPhone: "0912345678",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // TC-10: Business constraint - rejects cancellation of COMPLETED/paid booking
  it("TC-10: rejects cancellation with 400 Bad Request when booking is already COMPLETED", async () => {
    const completedBooking = {
      id: 50,
      customerPhone: "0901234567",
      status: BookingStatus.COMPLETED,
      invoice: { id: 20, status: "PAID" },
    };

    mockPrisma = {
      booking: {
        findUnique: jest.fn().mockResolvedValue(completedBooking),
      },
    } as unknown as PrismaService;

    service = new BookingsService(mockPrisma, mockAuditLogs);

    await expect(
      service.cancelBooking(50, { customerPhone: "0901234567", cancelReason: "Muốn hủy" }),
    ).rejects.toThrow(BadRequestException);
  });
});

