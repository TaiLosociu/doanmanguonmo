import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Request, Response, NextFunction } from "express";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS configuration supporting both FRONTEND_ORIGIN and CORS_ORIGINS
  const rawOrigins = [
    process.env.FRONTEND_ORIGIN,
    process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001",
  ]
    .filter(Boolean)
    .join(",");

  const allowedOrigins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Backward-compatibility rewrite: /api/* -> /api/v1/*
  const server = app.getHttpAdapter().getInstance();
  server.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.url.startsWith("/api/") && !req.url.startsWith("/api/v1/")) {
      req.url = req.url.replace(/^\/api\//, "/api/v1/");
    }
    next();
  });

  // Global prefix /api/v1
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Documentation (Swagger UI at GET /)
  const docConfig = new DocumentBuilder()
    .setTitle("Hệ Thống Đặt Sân Bóng Đá Mini - REST API v1")
    .setDescription(`
### Tài liệu hướng dẫn REST API Quản lý đặt sân bóng mini

Hệ thống cung cấp đầy đủ các API nghiệp vụ cốt lõi theo chuẩn RESTful:
- **Tiền tố API**: \`/api/v1\`
- **Xác thực**: Gửi header \`Authorization: Bearer <access_token>\` cho các endpoint yêu cầu quyền hạn.
- **Phân quyền người dùng**:
  - \`ADMIN\`: Toàn quyền hệ thống (quản lý sân, khung giờ, bảng giá, doanh thu, tài khoản).
  - \`STAFF\`: Nhân viên xác nhận đặt sân, lập hóa đơn, thu tiền, xem báo cáo doanh thu.
  - \`CUSTOMER\`: Khách hàng xem lịch trống, đặt sân, tra cứu và hủy đơn của chính mình.
- **Mã lỗi thường gặp (HTTP Status Codes)**:
  - **200 OK / 201 Created**: Xử lý yêu cầu thành công.
  - **400 Bad Request**: Dữ liệu gửi lên sai định dạng, đặt sân đang bảo trì, hoặc hủy đơn đã thanh toán.
  - **401 Unauthorized**: Thiếu hoặc sai JWT Bearer token xác thực.
  - **403 Forbidden**: Tài khoản không đủ quyền (ví dụ: CUSTOMER cố truy cập API báo cáo).
  - **404 Not Found**: Không tìm thấy sân, khung giờ, phiếu đặt hoặc hóa đơn.
  - **409 Conflict**: Xung đột lịch đặt (khung giờ đã có người đặt trước trong cùng khoảng thời gian).
  - **500 Internal Server Error**: Lỗi máy chủ hoặc lỗi cơ sở dữ liệu.
    `)
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Nhập JWT Token nhận được từ POST /api/v1/auth/login",
      },
      "BearerAuth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup("", app, document, {
    jsonDocumentUrl: "/openapi.json",
    customSiteTitle: "Hướng dẫn REST API - Đặt Sân Bóng Đá Mini",
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  const port = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  console.log(`Server listening on http://0.0.0.0:${port}`);
  console.log(`API Docs available at http://0.0.0.0:${port}/`);
}

void bootstrap();
