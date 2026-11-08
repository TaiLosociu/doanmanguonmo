# Hệ Thống Quản Lý & Đặt Sân Bóng Đá Mini Trực Tuyến

Đồ án xây dựng hệ thống đặt sân bóng đá mini toàn diện, tích hợp cơ chế chống đặt trùng lịch bằng Database Transaction, snapshot đơn giá và tính tiền tự động, bảo mật phân quyền JWT theo vai trò (ADMIN, STAFF, CUSTOMER) và cổng giao diện khách hàng - quản trị viên.

---

## Mục Lục
1. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
2. [Thiết Kế Cơ Sở Dữ Liệu Trên Neon PostgreSQL](#1-thiết-kế-cơ-sở-dữ-liệu-trên-neon-postgresql)
3. [Xây Dựng Backend REST API Với NestJS](#2-xây-dựng-backend-rest-api-với-nestjs)
4. [Phát Triển Frontend Với Next.js](#3-phát-triển-frontend-với-nextjs)
5. [Kịch Bản Kiểm Thử Trọng Tâm (Test Cases)](#4-kịch-bản-kiểm-thử-trọng-tâm-test-cases)
6. [Hướng Dẫn Triển Khai Máy Chủ (Wispbyte / Neon / Vercel)](#5-hướng-dẫn-triển-khai-máy-chủ)
7. [Thu Thập Minh Chứng Báo Cáo](#6-thu-thập-minh-chứng-báo-cáo)

---

## Kiến Trúc Tổng Thể

```
                       ┌───────────────────────────────────────────┐
                       │           Next.js 15 App Router           │
                       │   (Client: UI-01 -> 06 | Admin: UI-07 -> 09) │
                       └─────────────────────┬─────────────────────┘
                                             │ HTTP REST / JSON
                                             │ (NEXT_PUBLIC_API_BASE_URL)
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │          NestJS 11 REST API Engine        │
                       │           (Tiền tố: /api/v1)              │
                       │    - AuthGuard & RolesGuard (JWT)         │
                       │    - Advisory Lock / DB Transaction       │
                       │    - Swagger Docs tại GET /               │
                       └─────────────────────┬─────────────────────┘
                                             │ Prisma ORM
                                             │ (Connection Pooling + SSL)
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │            Neon PostgreSQL Cloud          │
                       │   (8 core tables, NUMERIC, Indices)       │
                       └───────────────────────────────────────────┘
```

---

## 1. Thiết Kế Cơ Sở Dữ Liệu Trên Neon PostgreSQL

Hệ thống sử dụng **PostgreSQL** lưu trữ trên đám mây **Neon**, kết nối qua chuỗi `DATABASE_URL` (hỗ trợ SSL mode) và quản trị bằng **Prisma ORM**.

### 8 Bảng Nghiệp Vụ Cốt Lõi:
1. **`users`**: Lưu tài khoản đăng nhập, băm mật khẩu `password_hash` với bcrypt, phân vai trò qua enum `Role`: `ADMIN`, `STAFF`, `CUSTOMER`.
2. **`fields`**: Danh mục sân bóng (loại sân `SAN_5`, `SAN_7`), trạng thái hoạt động (`ACTIVE`, `MAINTENANCE`, `INACTIVE`), mô tả và URL hình ảnh.
3. **`time_slots`**: Danh sách khung giờ mở/đóng cửa cố định trong ngày (`start_time`, `end_time`, cờ `is_peak_hour` đánh dấu giờ vàng).
4. **`price_rules`**: Quy tắc giá thuê sân dựa trên bộ 3 `(field_id, time_slot_id, day_type)`: sân, khung giờ và loại ngày (`WEEKDAY` / `WEEKEND`).
5. **`bookings`**: Phiếu đặt sân gồm `booking_code`, `customer_id`, `customer_name`, `customer_phone`, `field_id`, `time_slot_id`, mốc thời gian `start_at`, `end_at`, trạng thái (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), snapshot đơn giá `unit_price` và tổng tiền `total_price`.
6. **`invoices`**: Hóa đơn liên kết 1-1 với phiếu đặt (`booking_id`), mã hóa đơn `invoice_code`, tiền giảm giá `discount`, tổng tiền `total_amount` và trạng thái `status` (`UNPAID`, `PAID`, `CANCELLED`).
7. **`payments`**: Ghi nhận giao dịch thanh toán (`invoice_id`, `amount`, `method`: `CASH` / `TRANSFER`, `status`: `PENDING` / `SUCCESS` / `FAILED`, `paid_at`, mã tham chiếu ngân hàng `reference_code`).
8. **`audit_logs`**: Lưu vết lịch sử thao tác nhạy cảm của ban quản trị và nhân viên (`user_id`, `action`, `resource`, `resource_id`, `details`, `ip_address`, `created_at`).

### Ràng Buộc & Chỉ Mục (Index):
- **Chỉ mục kép `@@index([fieldId, startAt, endAt])`** trên bảng `bookings`: Tối ưu hóa truy vấn kiểm tra chồng lấn thời gian.
- **Chỉ mục `@@index([status])`** trên `bookings`: Lọc nhanh danh sách đơn theo trạng thái (chờ duyệt, đã duyệt, đã hoàn thành, đã hủy).
- **Chỉ mục `@@index([paidAt, status])`** trên `payments`: Tối ưu hóa truy vấn báo cáo doanh thu theo khoảng thời gian thực thu.
- **Kiểu dữ liệu tiền tệ**: Sử dụng kiểu dữ liệu chuẩn `NUMERIC(12, 2)` (Prisma `Decimal`) nhằm tránh sai số dấu phẩy động.
- **Mốc thời gian**: Lưu trữ chuẩn UTC ISO-8601, chuyển đổi đồng bộ theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` - UTC+7).

---

## 2. Xây Dựng Backend REST API Với NestJS

Mã nguồn backend được tổ chức theo kiến trúc module hóa độc lập, cung cấp API tiền tố `/api/v1` (tương thích backward `/api`):

### Cấu Trúc Module:
- `src/auth/`: Đăng nhập, đăng ký, cấp phát JWT Bearer Token, `JwtAuthGuard`, `RolesGuard`, decorator `@Roles()`.
- `src/fields/`: Thêm, sửa, xóa, chuyển trạng thái bảo trì (`ACTIVE` / `MAINTENANCE` / `INACTIVE`).
- `src/time-slots/`: Quản lý danh sách khung giờ mở cửa cố định.
- `src/pricing/`: Thiết lập bảng giá thuê theo sân, khung giờ và ngày thường/cuối tuần.
- `src/bookings/`: Nghiệp vụ đặt sân, kiểm tra lịch trống, tra cứu và hủy đơn.
- `src/invoices/`: Quản lý hóa đơn tạo từ phiếu đặt sân.
- `src/payments/`: Ghi nhận giao dịch thanh toán tiền mặt / chuyển khoản.
- `src/reports/`: Báo cáo doanh thu thực thu theo ngày, thống kê ca hoàn thành/hủy.
- `src/audit-logs/`: Ghi nhận nhật ký kiểm toán cho các thao tác nhạy cảm.

### Nghiệp Vụ Chống Đặt Trùng Lịch (Conflict Detection):
Khi tiếp nhận yêu cầu đặt sân (`POST /api/v1/bookings`):
1. Mở một **Database Transaction** (`prisma.$transaction`).
2. Kích hoạt **Advisory Lock** theo khóa sân và ngày `hashtext('booking:fieldId:bookingDate')` để tuần tự hóa các request đồng thời.
3. Kiểm tra trạng thái sân: Sân phải ở trạng thái `ACTIVE` (nếu đang `MAINTENANCE` hoặc `INACTIVE`, trả về mã lỗi `400 Bad Request`).
4. Truy vấn chồng lấn khoảng thời gian:
   $$\text{start\_at} < \text{new\_end\_at} \quad\text{và}\quad \text{end\_at} > \text{new\_start\_at}$$
   trên các đơn đang có hiệu lực (`PENDING`, `CONFIRMED`, `COMPLETED`).
5. Nếu phát hiện trùng lặp, backend từ chối và trả về mã lỗi **`409 Conflict`**: `"Khung giờ này đã có người đặt, vui lòng chọn khung giờ khác"`.

### Nguyên Tắc Snapshot Giá Và Tính Tiền:
- **Backend toàn quyền xác định giá**: Backend không nhận giá do client gửi lên; tự động xác định ngày thường hay cuối tuần, tra cứu bảng `price_rules` để tính tổng tiền.
- **Cố định giá thời điểm đặt**: Lưu giá vào `unit_price` và `total_price` của `bookings` và `total_amount` của `invoices`. Việc thay đổi biểu giá sau này không làm biến động lịch sử giao dịch.

### Trang Hướng Dẫn API (Swagger Docs tại `GET /`):
Trang gốc `http://localhost:3000/` tự động hiển thị Swagger UI đầy đủ mô tả danh sách endpoint, phương thức (GET, POST, PATCH, DELETE), body mẫu, cấu trúc header xác thực Bearer Token và các mã lỗi thường gặp (400, 401, 403, 404, 409, 500).

---

## 3. Phát Triển Frontend Với Next.js

Ứng dụng frontend được xây dựng bằng **Next.js 15 (App Router)** với TypeScript, thiết kế hiện đại, giao diện trực quan và phản hồi mượt mà:

### Khu Vực Khách Hàng:
- **UI-01 & UI-03 (Trang chủ & Danh mục sân)**: Hiển thị danh sách sân bóng với hình ảnh thực tế, loại sân 5/7, trạng thái và bảng giá tham khảo chi tiết ngày thường / cuối tuần / giờ vàng.
- **UI-04 (Lịch sân trống theo ngày)**: Lưới trực quan theo thời gian thực; mã màu trực quan: **Xanh lá (Trống)**, **Đỏ (Đã có người đặt)**, **Xám (Đã qua giờ / Chưa mở)**.
- **UI-05 (Form đặt sân)**: Chọn sân, ngày, ca đá, hiển thị **giá tạm tính snapshot** trước khi xác nhận gửi thông tin người đặt.
- **UI-06 (Lịch sử đặt & Tra cứu `/lookup`)**: Nhập mã đặt sân và số điện thoại để tra cứu trạng thái đơn (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`), xem thông tin hóa đơn và gửi yêu cầu hủy theo chính sách.

### Khu Vực Quản Trị (Admin & Staff Portal `/admin`):
- **UI-07 (Quản lý danh mục)**:
  - Bảng dữ liệu thêm/sửa/xóa sân, chuyển đổi trạng thái `ACTIVE` / `MAINTENANCE` / `INACTIVE`.
  - Quản lý khung giờ cố định và đánh dấu giờ vàng cao điểm.
  - Thiết lập bảng giá linh hoạt theo sân, ca đá và loại ngày.
- **UI-08 (Xử lý hóa đơn & thanh toán)**:
  - Duyệt đơn đặt sân (`PENDING` $\rightarrow$ `CONFIRMED`), tự động lập hóa đơn `UNPAID`.
  - Modal ghi nhận thanh toán: Chọn phương thức (Tiền mặt `CASH` / Chuyển khoản `TRANSFER`), nhập mã tham chiếu giao dịch ngân hàng $\rightarrow$ Cập nhật hóa đơn `PAID` và chuyển đơn sang `COMPLETED`.
- **UI-09 (Báo cáo doanh thu)**:
  - Lọc doanh thu theo ngày hoặc khoảng ngày.
  - Thẻ thống kê: **Tổng doanh thu thực thu**, **Ca đá hoàn thành**, **Lượt đặt đã hủy**.
  - Bảng phân tích doanh thu chi tiết theo từng sân bóng.

### Cấu Hình Môi Trường & Routing:
- Gọi API linh hoạt qua biến môi trường `NEXT_PUBLIC_API_BASE_URL` (fallback `NEXT_PUBLIC_API_URL`).
- Thiết lập cấu hình `basePath` trong `web/next.config.ts` để tương thích khi triển khai trên đường dẫn con của trường (`/{ten-sinh-vien}/doan/`).

---

## 4. Kịch Bản Kiểm Thử Trọng Tâm (Test Cases)

Hệ thống tích hợp bộ kiểm thử tự động toàn diện viết bằng **Jest** trong thư mục `src/bookings/bookings.service.spec.ts` và `src/reports/reports.service.spec.ts`:

| Mã Test Case | Tên Kịch Bản | Mục Tiêu & Dữ Liệu Kiểm Thử | Kết Quả Mong Đợi | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC-06** | Đặt sân khung giờ trống | Chọn sân 5A, khung giờ 07:30-09:00, ngày còn trống, gửi request đặt sân | Thành công (201 Created), tạo đơn PENDING kèm snapshot đơn giá | **PASS** |
| **TC-07** | Chống đặt trùng lịch | Giả lập 2 yêu cầu đặt cùng một sân trong cùng khoảng thời gian chồng lấn | Request thứ 2 bị từ chối với HTTP **409 Conflict** | **PASS** |
| **TC-08** | Ràng buộc bảo trì | Gửi yêu cầu đặt sân đang ở trạng thái `MAINTENANCE` | Bị từ chối với HTTP **400 Bad Request**: "Sân đang bảo trì" | **PASS** |
| **TC-10** | Ràng buộc hủy đơn | Thử hủy một phiếu đặt sân đã hoàn tất/thanh toán (`COMPLETED`) | Bị chặn từ chối với HTTP **400 Bad Request**: "Không thể hủy đơn đã hoàn tất" | **PASS** |
| **TC-12** | Đối chiếu doanh thu | Tổng hợp doanh thu có lẫn đơn thanh toán thành công và đơn đã hủy | Tổng doanh thu **chỉ cộng dồn các giao dịch hợp lệ**, loại trừ đơn hủy | **PASS** |

### Chạy Kiểm Thử Tự Động:
```powershell
npm test
```
*Kết quả:* 5/5 bài kiểm thử PASS 100%.

---

## 5. Hướng Dẫn Triển Khai Máy Chủ

### Triển Khai Backend Lên Wispbyte Cloud Node:
1. **Thiết lập mã nguồn**: Ứng dụng cấu hình lắng nghe trên `0.0.0.0` và cổng `process.env.PORT`.
2. **Khai báo các biến môi trường trên panel Wispbyte**:
   - `DATABASE_URL`: Chuỗi kết nối Neon PostgreSQL (`postgresql://...sslmode=require`).
   - `JWT_SECRET`: Khóa bí mật ký token JWT ngẫu nhiên.
   - `FRONTEND_ORIGIN`: Danh sách domain frontend được phép truy cập CORS.
   - `PORT`: Cổng máy chủ Wispbyte gán (ví dụ: `3000`).
   - `ADMIN_EMAIL`: Email tài khoản quản trị (`admin@example.com`).
   - `ADMIN_PASSWORD`: Mật khẩu tài khoản quản trị.
3. **Lệnh build và khởi chạy sản phẩm**:
   - Build: `npm run build`
   - Start: `npm start` (thực thi mã JS đã biên dịch trong thư mục `dist/`)

### Khởi Chạy Local (Môi Trường Phát Triển):
```powershell
# 1. Cài đặt thư viện
npm install
npm --prefix web install

# 2. Khởi tạo Prisma & Dữ liệu mẫu (Seed)
npm run db:push
npm run db:seed

# 3. Chạy Backend API (Cổng 3000)
npm run build
npm start

# 4. Chạy Frontend Next.js (Cổng 3001)
npm run web:dev
```

---

## 6. Thu Thập Minh Chứng Báo Cáo

Khi làm tài liệu thuyết minh và nộp bài báo cáo đồ án, sinh viên thực hiện các bước sau:
1. **Trang tài liệu API (Swagger UI)**: Mở trình duyệt tại `http://localhost:3000/` (hoặc domain Wispbyte), chụp ảnh màn hình tổng quan API, header Authorize Bearer Token và danh sách các module `/api/v1`.
2. **Cơ sở dữ liệu Neon**: Đăng nhập trang quản trị Neon Console, chụp ảnh sơ đồ quan hệ 8 bảng, danh sách bảng và chỉ mục Index đã thiết lập.
3. **Luồng nghiệp vụ khách hàng**:
   - Chụp ảnh UI-01 & UI-03: Danh sách sân bóng và bảng giá tham khảo.
   - Chụp ảnh UI-04: Lịch sân trống dạng lưới theo ngày.
   - Chụp ảnh UI-05: Form xác nhận đặt sân kèm giá tạm tính snapshot.
   - Chụp ảnh UI-06: Màn hình tra cứu mã đặt sân và thao tác hủy.
4. **Luồng nghiệp vụ quản trị**:
   - Chụp ảnh UI-07: Bảng quản lý sân bóng, khung giờ và bảng giá.
   - Chụp ảnh UI-08: Thao tác duyệt đơn, xuất hóa đơn và modal ghi nhận thanh toán tiền mặt/chuyển khoản.
   - Chụp ảnh UI-09: Báo cáo thống kê doanh thu thực thu theo ngày.
5. **Minh chứng kiểm thử**: Chụp màn hình terminal chạy lệnh `npm test` với kết quả PASS toàn bộ 5 test cases TC-06, TC-07, TC-08, TC-10, TC-12.
6. **Video Demo hoàn chỉnh**: Quay video màn hình (thời lượng 5 - 10 phút) thực hiện trọn vẹn luồng từ đặt sân, kiểm tra chống trùng 409, duyệt đơn, thanh toán đến báo cáo doanh thu để nộp kèm mã nguồn.
