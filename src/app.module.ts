import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { AuthModule } from "./auth/auth.module";
import { FieldsModule } from "./fields/fields.module";
import { TimeSlotsModule } from "./time-slots/time-slots.module";
import { PricingModule } from "./pricing/pricing.module";
import { BookingsModule } from "./bookings/bookings.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { PaymentsModule } from "./payments/payments.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuditLogsModule,
    AuthModule,
    FieldsModule,
    TimeSlotsModule,
    PricingModule,
    BookingsModule,
    InvoicesModule,
    PaymentsModule,
    ReportsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
