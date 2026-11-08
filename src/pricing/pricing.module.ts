import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PricingController } from "./pricing.controller";
import { PricingService } from "./pricing.service";
import { AuthModule } from "../auth/auth.module";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [PricingController],
  providers: [PrismaService, PricingService],
  exports: [PricingService],
})
export class PricingModule {}

