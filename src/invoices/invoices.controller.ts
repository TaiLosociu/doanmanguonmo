import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { InvoicesService } from "./invoices.service";
import { InvoiceQueryDto } from "./invoices.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Hóa đơn thanh toán")
@Controller("invoices")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách hóa đơn (ADMIN, STAFF)" })
  @ApiResponse({ status: 200, description: "Danh sách hóa đơn" })
  list(@Query() query: InvoiceQueryDto) {
    return this.invoices.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết hóa đơn và lịch sử giao dịch thanh toán" })
  @ApiResponse({ status: 200, description: "Chi tiết hóa đơn" })
  @ApiResponse({ status: 404, description: "Không tìm thấy hóa đơn" })
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.invoices.getById(id);
  }
}

