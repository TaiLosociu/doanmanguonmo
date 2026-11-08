import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateTimeSlotDto } from "./time-slots.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class TimeSlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async list() {
    return this.prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" },
    });
  }

  async create(dto: CreateTimeSlotDto, userId?: number, ip?: string) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException("Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
    }

    const label = dto.label?.trim() || `${dto.startTime} - ${dto.endTime}`;
    const duplicate = await this.prisma.timeSlot.findFirst({
      where: {
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });

    if (duplicate) {
      throw new ConflictException("Khung giờ này đã tồn tại trong hệ thống");
    }

    const slot = await this.prisma.timeSlot.create({
      data: {
        label,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isPeakHour: dto.isPeakHour ?? (dto.startTime >= "17:00" && dto.startTime < "21:00"),
      },
    });

    await this.auditLogs.log({
      userId,
      action: "CREATE_TIME_SLOT",
      resource: "time_slots",
      resourceId: slot.id,
      details: { label: slot.label, startTime: slot.startTime, endTime: slot.endTime },
      ipAddress: ip,
    });

    return slot;
  }

  async delete(id: number, userId?: number, ip?: string) {
    const slot = await this.prisma.timeSlot.findUnique({ where: { id } });
    if (!slot) {
      throw new NotFoundException("Không tìm thấy khung giờ");
    }

    const bookingCount = await this.prisma.booking.count({ where: { timeSlotId: id } });
    if (bookingCount > 0) {
      throw new ConflictException("Không thể xóa khung giờ đã có phiếu đặt");
    }

    const deleted = await this.prisma.timeSlot.delete({ where: { id } });

    await this.auditLogs.log({
      userId,
      action: "DELETE_TIME_SLOT",
      resource: "time_slots",
      resourceId: id,
      details: { label: slot.label },
      ipAddress: ip,
    });

    return deleted;
  }
}

