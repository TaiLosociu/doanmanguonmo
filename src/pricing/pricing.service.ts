import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DayType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreatePriceRuleDto } from "./pricing.dto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async list(fieldId?: number, dayType?: DayType) {
    return this.prisma.priceRule.findMany({
      where: {
        ...(fieldId ? { fieldId } : {}),
        ...(dayType ? { dayType } : {}),
      },
      include: {
        field: true,
        timeSlot: true,
      },
      orderBy: [
        { fieldId: "asc" },
        { timeSlot: { startTime: "asc" } },
      ],
    });
  }

  async upsert(dto: CreatePriceRuleDto, userId?: number, ip?: string) {
    const [field, timeSlot] = await Promise.all([
      this.prisma.field.findUnique({ where: { id: dto.fieldId } }),
      this.prisma.timeSlot.findUnique({ where: { id: dto.timeSlotId } }),
    ]);

    if (!field) throw new NotFoundException("Không tìm thấy sân bóng");
    if (!timeSlot) throw new NotFoundException("Không tìm thấy khung giờ");

    const rule = await this.prisma.priceRule.upsert({
      where: {
        fieldId_timeSlotId_dayType: {
          fieldId: dto.fieldId,
          timeSlotId: dto.timeSlotId,
          dayType: dto.dayType,
        },
      },
      update: {
        price: new Prisma.Decimal(dto.price),
      },
      create: {
        fieldId: dto.fieldId,
        timeSlotId: dto.timeSlotId,
        dayType: dto.dayType,
        price: new Prisma.Decimal(dto.price),
      },
      include: {
        field: true,
        timeSlot: true,
      },
    });

    await this.auditLogs.log({
      userId,
      action: "SET_PRICE_RULE",
      resource: "price_rules",
      resourceId: rule.id,
      details: {
        fieldId: dto.fieldId,
        timeSlotId: dto.timeSlotId,
        dayType: dto.dayType,
        price: dto.price,
      },
      ipAddress: ip,
    });

    return rule;
  }
}

