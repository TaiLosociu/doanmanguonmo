import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { BookingsService } from "./bookings.service";
import {
  AvailabilityQueryDto,
  BookingLookupDto,
  BookingQueryDto,
  CancelBookingDto,
  CreateBookingDto,
} from "./bookings.dto";
import { JwtAuthGuard, RequestWithUser } from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Đặt sân & Lịch thi đấu")
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get("available-schedule")
  @ApiOperation({ summary: "Ma trận lịch sân trống và giá tạm tính theo ngày" })
  @ApiResponse({ status: 200, description: "Lịch trống theo ngày" })
  available(@Query() query: AvailabilityQueryDto) {
    return this.bookings.availableSchedule(query);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: "Đặt sân mới; kiểm tra chống trùng lịch trong Transaction và tự động snapshot giá",
  })
  @ApiResponse({ status: 201, description: "Tạo phiếu đặt sân thành công (PENDING)" })
  @ApiResponse({ status: 400, description: "Sân bảo trì, dữ liệu không hợp lệ hoặc chưa có giá" })
  @ApiResponse({ status: 409, description: "Xung đột lịch - Khung giờ đã có người đặt" })
  create(
    @Body() body: CreateBookingDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.bookings.createBooking(body, req.user, ip);
  }

  @Get("lookup")
  @ApiOperation({ summary: "Khách tra cứu trạng thái đơn đặt sân bằng mã và số điện thoại" })
  @ApiResponse({ status: 200, description: "Thông tin chi tiết đơn đặt" })
  @ApiResponse({ status: 404, description: "Không tìm thấy đơn đặt sân" })
  lookup(@Query() query: BookingLookupDto) {
    return this.bookings.lookupBooking(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Danh sách đơn đặt sân (ADMIN/STAFF xem tất cả; CUSTOMER xem đơn của mình)" })
  @ApiResponse({ status: 200, description: "Danh sách đơn" })
  list(@Query() query: BookingQueryDto, @Req() req: RequestWithUser) {
    return this.bookings.listBookings(query, req.user);
  }

  @Patch(":id/confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xác nhận đơn PENDING sang CONFIRMED và tạo hóa đơn UNPAID (ADMIN/STAFF)" })
  @ApiResponse({ status: 200, description: "Xác nhận đơn thành công" })
  @ApiResponse({ status: 409, description: "Đơn không ở trạng thái PENDING" })
  confirm(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.bookings.confirmBooking(id, req.user, ip);
  }

  @Patch(":id/cancel")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Hủy phiếu đặt sân (Khách hủy bằng SĐT; Quản trị viên/Nhân viên hủy bằng Token)" })
  @ApiResponse({ status: 200, description: "Hủy đơn thành công" })
  @ApiResponse({ status: 400, description: "Đơn đã hoàn tất hoặc số điện thoại không khớp" })
  cancel(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: CancelBookingDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.bookings.cancelBooking(id, body, req.user, ip);
  }
}

