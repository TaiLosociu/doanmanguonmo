import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [PrismaService, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

