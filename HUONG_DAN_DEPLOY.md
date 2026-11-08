# 🚀 HƯỚNG DẪN TRIỂN KHAI (DEPLOY) LÊN HOSTING & MÁY CHỦ
## HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ MINI (NESTJS + NEXT.JS + NEON POSTGRESQL)

Tài liệu này hướng dẫn chi tiết từng bước để đưa toàn bộ hệ thống lên Internet với đầy đủ 100% chức năng (Đặt sân, Chống trùng lịch qua Transaction, Đăng ký/Đăng nhập, Lưu Neon DB, Quản trị Admin, Thu tiền, Xuất vé VietQR).

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

| Thành phần | Công nghệ | Nơi Deploy phù hợp nhất |
| :--- | :--- | :--- |
| **Cơ sở dữ liệu (Database)** | PostgreSQL (Neon Cloud) | **Neon.tech** *(Đã kết nối và lưu trữ sẵn trên đám mây AWS)* |
| **Backend REST API** | NestJS 11 + Prisma ORM | **Wispbyte Cloud Node** / **Render** / **Railway** / **VPS** |
| **Frontend Website** | Next.js 15 (App Router) | **Vercel** *(Khuyên dùng)* / **Render** / **Wispbyte** / **VPS** |

---

## 2. BIẾN MÔI TRƯỜNG CẦN THIẾT (ENVIRONMENT VARIABLES)

### A. Dành cho Backend:
Khai báo trên trang quản trị Hosting (Wispbyte / Render / Railway):
```env
PORT=3000
DATABASE_URL="postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="do-an-chuyen-nganh-cntt-football-pitch-jwt-secret-key-2026-super-secure"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
FRONTEND_ORIGIN="*"
CORS_ORIGINS="*"
```
*(Lưu ý: Sau khi có domain Frontend, thay `FRONTEND_ORIGIN` bằng URL domain Frontend để tăng tính bảo mật)*.

### B. Dành cho Frontend (Next.js):
Khai báo trên trang quản trị Vercel / Hosting Frontend:
```env
NEXT_PUBLIC_API_BASE_URL="https://your-backend-domain.com/api/v1"
```
*(Nếu triển khai theo đường dẫn con của trường học, thêm: `NEXT_PUBLIC_BASE_PATH="/ten-sinh-vien/doan"`)*.

---

## 3. HƯỚNG DẪN TRIỂN KHAI BACKEND LÊN WISPBYTE CLOUD NODE (YÊU CẦU ĐỒ ÁN)

1. **Đăng nhập Wispbyte Cloud Dashboard**, tạo một **Node.js Cloud Service**.
2. **Tải mã nguồn lên**:
   - Chọn tải lên file nén `DO_AN_SAN_BONG_DA.zip` (hoặc kết nối qua GitHub Repository).
3. **Cấu hình thông số trên Wispbyte**:
   - **Node.js Version**: Chọn `18.x`, `20.x` hoặc `22.x`.
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Environment Variables**: Dán các biến môi trường của Backend ở mục 2.A vào.
4. Bấm **Deploy**. Sau khi hoàn tất, bạn sẽ nhận được một địa chỉ URL Backend (Ví dụ: `https://football-api.wispbyte.app`).
5. **Kiểm tra**:
   - Truy cập `https://football-api.wispbyte.app/` để xem tài liệu Swagger API trực quan.
   - Truy cập `https://football-api.wispbyte.app/api/v1/fields` để xem danh sách sân từ Neon.

---

## 4. HƯỚNG DẪN TRIỂN KHAI FRONTEND LÊN VERCEL (1-CLICK, MIỄN PHÍ, SIÊU MƯỢT)

Vercel là nền tảng do chính đội ngũ phát triển Next.js xây dựng, tối ưu nhất cho Next.js 15:
1. Đăng nhập [vercel.com](https://vercel.com) (bằng GitHub).
2. Bấm **Add New** → **Project**.
3. Import thư mục mã nguồn.
4. Tại mục **Root Directory**: Bấm Edit và chọn thư mục `web`.
5. Tại mục **Environment Variables**:
   - Thêm biến `NEXT_PUBLIC_API_BASE_URL` = `https://football-api.wispbyte.app/api/v1` (URL Backend của bạn).
6. Bấm **Deploy**.
7. Chỉ sau 1 phút, trang web của bạn sẽ hoạt động chính thức với domain toàn cầu (Ví dụ: `https://mini-football.vercel.app`)!

---

## 5. HƯỚNG DẪN TRIỂN KHAI TRÊN VPS / MÁY CHỦ RIÊNG (UBUNTU / LINUX)

Nếu bạn thuê VPS (DigitalOcean, Linode, Vietnix, v.v.):
1. Cài đặt Node.js và PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```
2. Tải và giải nén mã nguồn vào `/var/www/football`:
   ```bash
   cd /var/www/football
   npm install
   npm run build
   cd web
   npm install
   npm run build
   cd ..
   ```
3. Chạy cả 2 dịch vụ bằng PM2:
   ```bash
   # Chạy Backend (Port 3000)
   pm2 start dist/main.js --name "football-backend"

   # Chạy Frontend (Port 3001)
   pm2 start "npm --prefix web run start" --name "football-frontend"

   # Lưu cấu hình tự chạy lại khi khởi động lại VPS
   pm2 save
   pm2 startup
   ```
4. Cấu hình Nginx làm Reverse Proxy để trỏ domain vào cổng 3001 (Web) và cổng 3000 (API).

---

## 6. DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP SẴN TRÊN NEON DB

Hệ thống đã lưu sẵn 3 tài khoản mẫu được mã hóa Bcrypt trên Neon:
- 👑 **Admin Quản trị:** `admin@example.com` / Mật khẩu: `Admin@123456` (hoặc đăng nhập bằng SĐT: `0999999999`)
- 👔 **Nhân viên trực sân:** `staff@example.com` / Mật khẩu: `Staff@123456` (hoặc SĐT: `0988888888`)
- ⚽ **Khách hàng:** `customer@example.com` / Mật khẩu: `Customer@123456` (hoặc SĐT: `0901234567`)
- Ngoài ra, bất kỳ người dùng mới nào bấm **"Đăng ký"** trên giao diện web đều được ghi nhận trực tiếp vào Neon Cloud!
