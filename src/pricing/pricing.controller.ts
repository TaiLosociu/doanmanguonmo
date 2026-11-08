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
import { PricingService } from "./pricing.service";
import { CreatePriceRuleDto, PriceRuleQueryDto } from "./pricing.dto";
import { JwtAuthGuard, RequestWithUser } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Bảng giá & Quy tắc tính tiền")
@Controller("pricing")
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get()
  @ApiOperation({ summary: "Xem danh sách quy tắc giá thuê (lọc theo sân, loại ngày)" })
  @ApiResponse({ status: 200, description: "Danh sách quy tắc giá" })
  list(@Query() query: PriceRuleQueryDto) {
    return this.pricing.list(query.fieldId, query.dayType);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thiết lập hoặc cập nhật bảng giá (ADMIN, STAFF)" })
  @ApiResponse({ status: 200, description: "Thiết lập giá thành công" })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ" })
  @ApiResponse({ status: 404, description: "Không tìm thấy sân hoặc khung giờ" })
  upsert(
    @Body() body: CreatePriceRuleDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.pricing.upsert(body, req.user?.sub, ip);
  }
}

