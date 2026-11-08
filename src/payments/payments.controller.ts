import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto, PaymentQueryDto } from "./payments.dto";
import { JwtAuthGuard, RequestWithUser } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Giao dịch thanh toán")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách các giao dịch thanh toán (ADMIN, STAFF)" })
  @ApiResponse({ status: 200, description: "Danh sách giao dịch" })
  list(@Query() query: PaymentQueryDto) {
    return this.payments.list(query);
  }

  @Post()
  @ApiOperation({
    summary: "Ghi nhận giao dịch thanh toán (CASH / TRANSFER), cập nhật hóa đơn PAID và phiếu đặt COMPLETED",
  })
  @ApiResponse({ status: 201, description: "Thanh toán thành công" })
  @ApiResponse({ status: 400, description: "Hóa đơn đã thanh toán hoặc bị hủy" })
  @ApiResponse({ status: 404, description: "Không tìm thấy hóa đơn" })
  create(
    @Body() body: CreatePaymentDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.payments.recordPayment(body, req.user, ip);
  }
}

