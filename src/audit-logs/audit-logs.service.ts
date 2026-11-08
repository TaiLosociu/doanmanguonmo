import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    userId?: number;
    action: string;
    resource: string;
    resourceId?: string | number;
    details?: Record<string, unknown> | string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId ?? null,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId ? String(data.resourceId) : null,
          details: data.details
            ? typeof data.details === "string"
              ? data.details
              : JSON.stringify(data.details)
            : null,
          ipAddress: data.ipAddress ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to write audit log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async list(take = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });
  }
}

