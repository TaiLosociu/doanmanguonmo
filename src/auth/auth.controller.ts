import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { JwtAuthGuard, RequestWithUser } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { Roles } from "./roles.decorator";
import { ApiKeyGuard } from "./api-key.guard";

@ApiTags("Xác thực & Tài khoản")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Đăng nhập hệ thống (ADMIN, STAFF, CUSTOMER) và nhận JWT Bearer Token" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Sai email/số điện thoại hoặc mật khẩu" })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post("register")
  @ApiOperation({ summary: "Đăng ký tài khoản khách hàng mới lưu trực tiếp vào Neon" })
  @ApiResponse({ status: 201, description: "Đăng ký thành công" })
  @ApiResponse({ status: 409, description: "Số điện thoại hoặc email đã tồn tại" })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lấy thông tin tài khoản hiện tại từ Token" })
  @ApiResponse({ status: 200, description: "Thông tin cá nhân" })
  @ApiResponse({ status: 401, description: "Chưa đăng nhập hoặc token không hợp lệ" })
  getProfile(@Req() req: RequestWithUser) {
    return this.auth.getProfile(req.user!.sub);
  }

  @Get("users")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Danh sách toàn bộ người dùng đã lưu trong Neon (Yêu cầu ADMIN/STAFF)" })
  @ApiResponse({ status: 200, description: "Danh sách tài khoản" })
  getUsers() {
    return this.auth.listUsers();
  }

  @Get("verify-api-key")
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: "Kiểm tra xác thực hệ thống qua Header x-api-key (Bảo vệ API Key)" })
  @ApiResponse({ status: 200, description: "API Key hợp lệ" })
  @ApiResponse({ status: 401, description: "API Key không hợp lệ hoặc thiếu header x-api-key" })
  verifyApiKey() {
    return {
      success: true,
      message: "API Key hợp lệ! Đã xác thực thành công qua ApiKeyGuard.",
      timestamp: new Date().toISOString(),
    };
  }
}
