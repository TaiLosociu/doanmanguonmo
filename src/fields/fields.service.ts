import { ConflictException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { FieldStatus, FieldType } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreateFieldDto, FieldQueryDto, UpdateFieldDto } from "./fields.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { BookingsService } from "../bookings/bookings.service";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";

@Injectable()
export class FieldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
  ) {}

  async list(query: FieldQueryDto) {
    return this.prisma.field.findMany({
      where: {
        ...(query.fieldType ? { fieldType: query.fieldType } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.ward ? { ward: { contains: query.ward, mode: "insensitive" } } : {}),
      },
      orderBy: { id: "asc" },
    });
  }

  async listBmt(ward?: string, fieldType?: FieldType) {
    const where: any = {
      ward: { not: null },
      ...(fieldType ? { fieldType } : {}),
    };
    if (ward) {
      where.ward = { contains: ward, mode: "insensitive" };
    }

    const pitches = await this.prisma.field.findMany({
      where,
      orderBy: [{ ward: "asc" }, { id: "asc" }],
    });

    const wardMap = new Map<string, typeof pitches>();
    for (const p of pitches) {
      const w = p.ward || "Khác";
      if (!wardMap.has(w)) {
        wardMap.set(w, []);
      }
      wardMap.get(w)!.push(p);
    }

    const wards = Array.from(wardMap.entries()).map(([name, items]) => ({
      name,
      count: items.length,
      fields: items.map((f) => ({
        id: f.id,
        name: f.name,
        ward: f.ward,
        address: f.address,
        phone: f.phone,
        fieldType: f.fieldType,
        status: f.status,
        description: f.description,
        imageUrl: f.imageUrl,
        api: {
          detail: `/api/v1/fields/${f.id}`,
          schedule: `/api/v1/fields/${f.id}/schedule`,
          book: `/api/v1/fields/${f.id}/bookings`,
        },
      })),
    }));

    return {
      city: "Buôn Ma Thuột",
      province: "Đắk Lắk",
      total: pitches.length,
      filter: { ward: ward || null, fieldType: fieldType || null },
      wards,
      allFields: pitches.map((f) => ({
        id: f.id,
        name: f.name,
        ward: f.ward,
        address: f.address,
        phone: f.phone,
        fieldType: f.fieldType,
        status: f.status,
        description: f.description,
        imageUrl: f.imageUrl,
        api: {
          detail: `/api/v1/fields/${f.id}`,
          schedule: `/api/v1/fields/${f.id}/schedule`,
          book: `/api/v1/fields/${f.id}/bookings`,
        },
      })),
    };
  }

  async getFieldSchedule(id: number, date?: string) {
    const field = await this.getById(id);
    const dateStr = date || new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const schedule = await this.bookingsService.availableSchedule({
      date: dateStr,
      fieldId: id,
    });

    const fieldSchedule = schedule.fields.find((f) => f.id === id);
    return {
      field: {
        id: field.id,
        name: field.name,
        ward: field.ward,
        address: field.address,
        phone: field.phone,
        fieldType: field.fieldType,
        status: field.status,
        description: field.description,
        imageUrl: field.imageUrl,
      },
      date: schedule.date,
      dayType: schedule.dayType,
      slots: fieldSchedule?.slots || [],
    };
  }

  async createBookingForField(
    fieldId: number,
    dto: { timeSlotId: number; bookingDate: string; customerName: string; customerPhone: string },
    user?: AuthenticatedUser,
    ip?: string,
  ) {
    await this.getById(fieldId);
    return this.bookingsService.createBooking(
      {
        fieldId,
        timeSlotId: Number(dto.timeSlotId),
        bookingDate: dto.bookingDate,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
      },
      user,
      ip,
    );
  }

  async getById(id: number) {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: {
        priceRules: {
          include: { timeSlot: true },
        },
      },
    });
    if (!field) {
      throw new NotFoundException("Không tìm thấy sân bóng");
    }
    return field;
  }

  async create(dto: CreateFieldDto, userId?: number, ip?: string) {
    const field = await this.prisma.field.create({
      data: {
        name: dto.name.trim(),
        fieldType: dto.fieldType,
        status: dto.status ?? "ACTIVE",
        description: dto.description?.trim() || null,
        imageUrl: dto.imageUrl?.trim() || null,
        ward: dto.ward?.trim() || null,
        address: dto.address?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
    });

    await this.auditLogs.log({
      userId,
      action: "CREATE_FIELD",
      resource: "fields",
      resourceId: field.id,
      details: { name: field.name, fieldType: field.fieldType, ward: field.ward },
      ipAddress: ip,
    });

    return field;
  }

  async update(id: number, dto: UpdateFieldDto, userId?: number, ip?: string) {
    await this.getById(id);
    const updated = await this.prisma.field.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.fieldType ? { fieldType: dto.fieldType } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl?.trim() || null } : {}),
        ...(dto.ward !== undefined ? { ward: dto.ward?.trim() || null } : {}),
        ...(dto.address !== undefined ? { address: dto.address?.trim() || null } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone?.trim() || null } : {}),
      },
    });

    await this.auditLogs.log({
      userId,
      action: "UPDATE_FIELD",
      resource: "fields",
      resourceId: id,
      details: { ...dto },
      ipAddress: ip,
    });

    return updated;
  }

  async delete(id: number, userId?: number, ip?: string) {
    await this.getById(id);
    const bookingCount = await this.prisma.booking.count({
      where: { fieldId: id },
    });
    if (bookingCount > 0) {
      throw new ConflictException("Không thể xóa sân đã có lịch sử đặt; hãy chuyển sang trạng thái bảo trì hoặc ngưng hoạt động");
    }

    const deleted = await this.prisma.field.delete({
      where: { id },
    });

    await this.auditLogs.log({
      userId,
      action: "DELETE_FIELD",
      resource: "fields",
      resourceId: id,
      details: { name: deleted.name },
      ipAddress: ip,
    });

    return deleted;
  }
}
