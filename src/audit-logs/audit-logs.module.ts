import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AuditLogsService } from "./audit-logs.service";

@Module({
  providers: [PrismaService, AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}

