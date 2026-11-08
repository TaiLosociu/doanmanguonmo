import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TimeSlotsController } from "./time-slots.controller";
import { TimeSlotsService } from "./time-slots.service";
import { AuthModule } from "../auth/auth.module";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [TimeSlotsController],
  providers: [PrismaService, TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}

