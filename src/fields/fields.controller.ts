import {
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FieldType, Role } from "@prisma/client";
import { FieldsService } from "./fields.service";
import { CreateFieldBookingDto, CreateFieldDto, FieldQueryDto, UpdateFieldDto } from "./fields.dto";
import { JwtAuthGuard, RequestWithUser } from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("Danh mục sân bóng")
@Controller("fields")
export class FieldsController {
  constructor(private readonly fields: FieldsService) {}

  @Get()
  @ApiOperation({ summary: "Lấy danh sách sân bóng (lọc theo loại SAN_5/SAN_7, trạng thái, phường xã)" })
  @ApiResponse({ status: 200, description: "Danh sách sân" })
  list(@Query() query: FieldQueryDto) {
    return this.fields.list(query);
  }

  @Get("bmt")
  @ApiOperation({
    summary: "API riêng biệt: Lấy toàn bộ 21 sân bóng Buôn Ma Thuột phân theo Phường/Xã với API đặt lịch từng sân",
  })
  @ApiQuery({ name: "ward", required: false, description: "Tên Phường/Xã (Tân Tiến, Tân Lập, Ea Tam...)" })
  @ApiQuery({ name: "fieldType", required: false, enum: FieldType })
  @ApiResponse({ status: 200, description: "Danh sách sân BMT theo khu vực và thông tin chi tiết từng sân" })
  listBmt(@Query("ward") ward?: string, @Query("fieldType") fieldType?: FieldType) {
    return this.fields.listBmt(ward, fieldType);
  }

  @Get(":id/schedule")
  @ApiOperation({ summary: "API riêng biệt từng sân: Xem lịch trống và giá theo ngày của sân cụ thể" })
  @ApiQuery({ name: "date", required: false, description: "Ngày kiểm tra YYYY-MM-DD (mặc định hôm nay)" })
  @ApiResponse({ status: 200, description: "Bảng giờ, giá và tình trạng trống của riêng sân này" })
  getSchedule(
    @Param("id", ParseIntPipe) id: number,
    @Query("date") date?: string,
  ) {
    return this.fields.getFieldSchedule(id, date);
  }

  @Post(":id/bookings")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "API riêng biệt từng sân: Đặt lịch trực tiếp cho sân cụ thể này" })
  @ApiResponse({ status: 201, description: "Đặt sân thành công (PENDING)" })
  @ApiResponse({ status: 409, description: "Khung giờ đã có người đặt" })
  bookSpecificField(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: CreateFieldBookingDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.fields.createBookingForField(id, body, req.user, ip);
  }

  @Get(":id")
  @ApiOperation({ summary: "Xem chi tiết thông tin sân bóng" })
  @ApiResponse({ status: 200, description: "Chi tiết sân bóng" })
  @ApiResponse({ status: 404, description: "Không tìm thấy sân" })
  getById(@Param("id", ParseIntPipe) id: number) {
    return this.fields.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thêm sân bóng mới (Yêu cầu quyền ADMIN hoặc STAFF)" })
  @ApiResponse({ status: 201, description: "Tạo sân thành công" })
  @ApiResponse({ status: 401, description: "Chưa xác thực" })
  @ApiResponse({ status: 403, description: "Không đủ quyền hạn" })
  create(
    @Body() body: CreateFieldDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.fields.create(body, req.user?.sub, ip);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cập nhật thông tin sân hoặc trạng thái bảo trì/ngưng hoạt động" })
  @ApiResponse({ status: 200, description: "Cập nhật thành công" })
  @ApiResponse({ status: 404, description: "Không tìm thấy sân" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateFieldDto,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.fields.update(id, body, req.user?.sub, ip);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xóa sân bóng nếu chưa từng phát sinh đơn đặt (Chỉ ADMIN)" })
  @ApiResponse({ status: 200, description: "Xóa sân thành công" })
  @ApiResponse({ status: 409, description: "Sân đã có lịch sử đặt, không được xóa" })
  delete(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Ip() ip: string,
  ) {
    return this.fields.delete(id, req.user?.sub, ip);
  }
}

