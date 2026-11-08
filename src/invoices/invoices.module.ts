import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [InvoicesController],
  providers: [PrismaService, InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

