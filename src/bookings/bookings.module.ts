import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { AuthModule } from "../auth/auth.module";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [BookingsController],
  providers: [PrismaService, BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

