import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BookingStatus,
  DayType,
  FieldStatus,
  InvoiceStatus,
  Prisma,
  Role,
} from "@prisma/client";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma.service";
import {
  AvailabilityQueryDto,
  BookingLookupDto,
  BookingQueryDto,
  CancelBookingDto,
  CreateBookingDto,
} from "./bookings.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
];

function makeCode(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function parseVietnamDateTime(dateStr: string, timeStr: string): Date {
  const iso = `${dateStr}T${timeStr}:00+07:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("Thời gian không hợp lệ");
  }
  return parsed;
}

function getVietnamDayType(dateStr: string): DayType {
  const d = new Date(`${dateStr}T12:00:00+07:00`);
  const day = d.getDay();
  return day === 0 || day === 6 ? DayType.WEEKEND : DayType.WEEKDAY;
}

function timeToMinutes(timeStr: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeStr);
  if (!match) throw new BadRequestException("Giờ phải có định dạng HH:mm");
  return Number(match[1]) * 60 + Number(match[2]);
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async availableSchedule(query: AvailabilityQueryDto) {
    const dayType = getVietnamDayType(query.date);
    const dayStart = parseVietnamDateTime(query.date, "00:00");
    const dayEnd = parseVietnamDateTime(query.date, "23:59");

    const [fields, timeSlots, activeBookings, priceRules] = await Promise.all([
      this.prisma.field.findMany({
        where: {
          status: FieldStatus.ACTIVE,
          ...(query.fieldType ? { fieldType: query.fieldType } : {}),
          ...(query.fieldId ? { id: query.fieldId } : {}),
          ...(query.ward ? { ward: { contains: query.ward, mode: "insensitive" } } : {}),
        },
        orderBy: { id: "asc" },
      }),
      this.prisma.timeSlot.findMany({
        orderBy: { startTime: "asc" },
      }),
      this.prisma.booking.findMany({
        where: {
          startAt: { gte: dayStart, lte: dayEnd },
          status: { in: ACTIVE_BOOKING_STATUSES },
        },
        select: { fieldId: true, timeSlotId: true, startAt: true, endAt: true },
      }),
      this.prisma.priceRule.findMany({
        where: { dayType },
      }),
    ]);

    const nowVietnam = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const todayStr = nowVietnam.toISOString().slice(0, 10);
    const isToday = query.date === todayStr;
    const currentMinutes = nowVietnam.getUTCHours() * 60 + nowVietnam.getUTCMinutes();

    return {
      date: query.date,
      dayType,
      fields: fields.map((field) => ({
        id: field.id,
        name: field.name,
        ward: field.ward,
        address: field.address,
        phone: field.phone,
        fieldType: field.fieldType,
        description: field.description,
        imageUrl: field.imageUrl,
        slots: timeSlots.map((slot) => {
          const rule = priceRules.find(
            (p) => p.fieldId === field.id && p.timeSlotId === slot.id,
          );
          const slotStart = parseVietnamDateTime(query.date, slot.startTime);
          const slotEnd = parseVietnamDateTime(query.date, slot.endTime);

          const isBooked = activeBookings.some(
            (b) =>
              b.fieldId === field.id &&
              b.startAt < slotEnd &&
              b.endAt > slotStart,
          );

          const isPast = isToday && timeToMinutes(slot.startTime) <= currentMinutes;
          const isAvailable = !isBooked && Boolean(rule) && !isPast;

          return {
            timeSlot: slot,
            price: rule ? Number(rule.price) : null,
            isAvailable,
            status: isBooked ? "BOOKED" : !rule || isPast ? "UNAVAILABLE" : "AVAILABLE",
          };
        }),
      })),
    };
  }

  async createBooking(
    dto: CreateBookingDto,
    currentUser?: AuthenticatedUser,
    ip?: string,
  ) {
    const todayVietnam = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (dto.bookingDate < todayVietnam) {
      throw new BadRequestException("Không thể đặt sân cho ngày trong quá khứ");
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Transaction Lock to prevent race conditions
      const lockKey = `booking:${dto.fieldId}:${dto.bookingDate}`;
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      // 2. Validate field status
      const field = await tx.field.findUnique({ where: { id: dto.fieldId } });
      if (!field) {
        throw new NotFoundException("Không tìm thấy sân bóng");
      }
      if (field.status !== FieldStatus.ACTIVE) {
        throw new BadRequestException("Sân đang trong trạng thái bảo trì hoặc ngưng hoạt động");
      }

      // 3. Validate time slot
      const timeSlot = await tx.timeSlot.findUnique({ where: { id: dto.timeSlotId } });
      if (!timeSlot) {
        throw new NotFoundException("Không tìm thấy khung giờ");
      }

      const startAt = parseVietnamDateTime(dto.bookingDate, timeSlot.startTime);
      const endAt = parseVietnamDateTime(dto.bookingDate, timeSlot.endTime);

      // 4. Overlap Conflict Detection
      const conflict = await tx.booking.findFirst({
        where: {
          fieldId: dto.fieldId,
          status: { in: ACTIVE_BOOKING_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (conflict) {
        throw new ConflictException("Khung giờ này đã có người đặt, vui lòng chọn khung giờ khác");
      }

      // 5. Price Snapshotting from price_rules (Frontend cannot set price)
      const dayType = getVietnamDayType(dto.bookingDate);
      const priceRule = await tx.priceRule.findUnique({
        where: {
          fieldId_timeSlotId_dayType: {
            fieldId: dto.fieldId,
            timeSlotId: dto.timeSlotId,
            dayType,
          },
        },
      });

      if (!priceRule) {
        throw new BadRequestException("Chưa thiết lập bảng giá cho sân và khung giờ này");
      }

      const bookingCode = makeCode("SAN");
      const customerId = currentUser?.sub ?? null;

      // 6. Create Booking with snapshot price
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          customerId,
          customerName: dto.customerName.trim(),
          customerPhone: dto.customerPhone.trim(),
          fieldId: dto.fieldId,
          timeSlotId: dto.timeSlotId,
          startAt,
          endAt,
          unitPrice: priceRule.price,
          totalPrice: priceRule.price,
          status: BookingStatus.PENDING,
        },
        include: {
          field: true,
          timeSlot: true,
        },
      });

      await this.auditLogs.log({
        userId: customerId ?? undefined,
        action: "CREATE_BOOKING",
        resource: "bookings",
        resourceId: booking.id,
        details: {
          bookingCode: booking.bookingCode,
          fieldId: booking.fieldId,
          totalPrice: Number(booking.totalPrice),
        },
        ipAddress: ip,
      });

      return booking;
    });
  }

  async lookupBooking(dto: BookingLookupDto) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        bookingCode: { equals: dto.bookingCode.trim(), mode: "insensitive" },
        customerPhone: dto.customerPhone.trim(),
      },
      include: {
        field: true,
        timeSlot: true,
        invoice: {
          include: { payments: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Không tìm thấy đơn đặt sân với mã và số điện thoại này");
    }

    return booking;
  }

  async listBookings(query: BookingQueryDto, currentUser?: AuthenticatedUser) {
    let customerFilter: Prisma.BookingWhereInput = {};
    if (currentUser?.role === Role.CUSTOMER) {
      customerFilter = {
        OR: [
          { customerId: currentUser.sub },
          { customerPhone: currentUser.email ?? "" },
        ],
      };
    }

    let dateFilter: Prisma.BookingWhereInput = {};
    if (query.date) {
      const dayStart = parseVietnamDateTime(query.date, "00:00");
      const dayEnd = parseVietnamDateTime(query.date, "23:59");
      dateFilter = { startAt: { gte: dayStart, lte: dayEnd } };
    }

    return this.prisma.booking.findMany({
      where: {
        ...customerFilter,
        ...dateFilter,
        ...(query.fieldId ? { fieldId: query.fieldId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.customerPhone ? { customerPhone: query.customerPhone.trim() } : {}),
        ...(query.bookingCode ? { bookingCode: { equals: query.bookingCode.trim(), mode: "insensitive" } } : {}),
      },
      include: {
        field: true,
        timeSlot: true,
        invoice: {
          include: { payments: true },
        },
      },
      orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
  }

  async confirmBooking(id: number, currentUser?: AuthenticatedUser, ip?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(${id})`;
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { invoice: true },
      });

      if (!booking) {
        throw new NotFoundException("Không tìm thấy đơn đặt sân");
      }
      if (booking.status !== BookingStatus.PENDING) {
        throw new ConflictException("Chỉ đơn đặt sân ở trạng thái Chờ xác nhận (PENDING) mới có thể xác nhận");
      }

      const updated = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CONFIRMED },
        include: { field: true, timeSlot: true },
      });

      if (!booking.invoice) {
        await tx.invoice.create({
          data: {
            invoiceCode: makeCode("HD"),
            bookingId: id,
            discount: new Prisma.Decimal(0),
            totalAmount: booking.totalPrice,
            status: InvoiceStatus.UNPAID,
          },
        });
      }

      await this.auditLogs.log({
        userId: currentUser?.sub,
        action: "CONFIRM_BOOKING",
        resource: "bookings",
        resourceId: id,
        details: { bookingCode: booking.bookingCode },
        ipAddress: ip,
      });

      return updated;
    });
  }

  async cancelBooking(
    id: number,
    dto: CancelBookingDto,
    currentUser?: AuthenticatedUser,
    ip?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!booking) {
      throw new NotFoundException("Không tìm thấy đơn đặt sân");
    }

    const isStaffOrAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.STAFF;
    if (!isStaffOrAdmin) {
      const matchPhone = dto.customerPhone && booking.customerPhone === dto.customerPhone.trim();
      const matchUserId = currentUser && booking.customerId === currentUser.sub;
      if (!matchPhone && !matchUserId) {
        throw new BadRequestException("Số điện thoại hoặc tài khoản không khớp với người đặt sân");
      }
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("Đơn đặt sân đã được hủy trước đó");
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException("Không thể hủy đơn đặt sân đã hoàn tất/thanh toán");
    }

    const cancelled = await this.prisma.$transaction(async (tx) => {
      if (booking.invoice && booking.invoice.status !== InvoiceStatus.CANCELLED) {
        await tx.invoice.update({
          where: { id: booking.invoice.id },
          data: { status: InvoiceStatus.CANCELLED },
        });
      }

      return tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelReason: dto.cancelReason?.trim() || "Khách yêu cầu hủy",
        },
        include: { field: true, timeSlot: true },
      });
    });

    await this.auditLogs.log({
      userId: currentUser?.sub,
      action: "CANCEL_BOOKING",
      resource: "bookings",
      resourceId: id,
      details: {
        bookingCode: booking.bookingCode,
        cancelReason: cancelled.cancelReason,
      },
      ipAddress: ip,
    });

    return cancelled;
  }
}

