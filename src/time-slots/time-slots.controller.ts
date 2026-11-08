import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { TimeSlotsService } from "./time-slots.service";
import { CreateTimeSlotDto } from "./time-slots.dto";
import { JwtAuthGuard, RequestWithUser } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Khung giờ hoạt động")
@Controller("time-slots")
export class TimeSlotsController {
  constructor(private readonly timeSlots: TimeSlotsService) {}

  @Get()
  @ApiOperation({ summary: "Lấy danh sách các khung giờ mở cửa trong ngày" })
  @ApiResponse({ status: 200, description: "Danh sách khung giờ" })
  list() {
    return this.timeSlots.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thêm khung giờ hoạt động (ADMIN, STAFF)" })
  @ApiResponse({ status: 201, description: "Tạo khung giờ thành công" })
  @ApiResponse({ status: 409, description: "Khung giờ đã tồn tại" })
  create(
    @Body() body: CreateTimeSlotDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.timeSlots.create(body, req.user?.sub, ip);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xóa khung giờ chưa có lịch sử đặt (Chỉ ADMIN)" })
  @ApiResponse({ status: 200, description: "Xóa thành công" })
  @ApiResponse({ status: 409, description: "Khung giờ đã có lịch sử đặt" })
  delete(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.timeSlots.delete(id, req.user?.sub, ip);
  }
}

