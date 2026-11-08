import { Module, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { FieldsController } from "./fields.controller";
import { FieldsService } from "./fields.service";
import { AuthModule } from "../auth/auth.module";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";
import { BookingsModule } from "../bookings/bookings.module";

@Module({
  imports: [AuthModule, AuditLogsModule, forwardRef(() => BookingsModule)],
  controllers: [FieldsController],
  providers: [PrismaService, FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}

