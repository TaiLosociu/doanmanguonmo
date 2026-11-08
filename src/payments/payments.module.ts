import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { AuthModule } from "../auth/auth.module";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [PaymentsController],
  providers: [PrismaService, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

