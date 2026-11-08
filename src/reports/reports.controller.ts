import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { RevenueQueryDto } from "./reports.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Báo cáo & Thống kê doanh thu")
@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get("daily-revenue")
  @ApiOperation({
    summary: "Báo cáo doanh thu thực thu theo ngày/khoảng ngày, lượt hoàn thành, lượt hủy và doanh thu theo sân",
  })
  @ApiResponse({ status: 200, description: "Báo cáo doanh thu" })
  @ApiResponse({ status: 400, description: "Khoảng ngày không hợp lệ" })
  dailyRevenue(@Query() query: RevenueQueryDto) {
    return this.reports.dailyRevenue(query);
  }
}

