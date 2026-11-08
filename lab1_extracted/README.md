# NextJS Landing Page Cá Nhân — Sử Dụng NESTJS API & CSDL NEON CLOUD

> **Môn học:** Lập trình mã nguồn mở 2 (Trường Cao đẳng Đắk Lắk - `dak.edu.vn`)  
> **Sinh viên:** Lê Duy Tài — **Lớp:** IT24M  
> **Ngày sinh:** 23/04/2006 (20 tuổi)  
> **Hotline/Zalo:** 0896890399 | **Email:** huavanhen456@gmail.com  
> **Đường dẫn bài nộp online:** [https://it24m.dak.edu.vn/leduytai/baitap1/](https://it24m.dak.edu.vn/leduytai/baitap1/)

---

## 📦 1. Hướng Dẫn Nộp Lên Hosting Của Thầy (`it24m.dak.edu.vn`)

Dự án đã được đóng gói thành file **`baitap1.zip`** (dung lượng siêu nhẹ ~445 KB), cấu hình sẵn Apache `.htaccess`, PHP Fallback và toàn bộ asset đường dẫn chuẩn:

1. Đăng nhập vào DirectAdmin / Hosting trường (`it24m.dak.edu.vn`).
2. Vào thư mục: `public_html` ➜ `leduytai` ➜ `baitap1`.
3. Tải file **`baitap1.zip`** lên thư mục `baitap1/`.
4. Nhấp chuột phải vào `baitap1.zip` ➜ Chọn **Extract** (Giải nén ngay tại đó).
5. Mở trình duyệt truy cập:
   👉 **https://it24m.dak.edu.vn/leduytai/baitap1/** (nhấn `Ctrl + F5` để làm mới).

---

## 💻 2. Dành Cho Thầy Chấm Bài Offline Trên Máy Tính

Khi thầy tải file zip về máy cá nhân (chỉ cần giải nén ra bất kỳ thư mục nào):

* **Cách 1: Xem ngay giao diện (Không cần cài Node.js):**
  * Nhấp đúp vào file **`XEM_PORTFOLIO.bat`** (hoặc mở trực tiếp file `index.html`).
  * Trình duyệt sẽ mở ngay lập tức với đầy đủ giao diện, hình ảnh, hiệu ứng gõ chữ và kết nối Neon Cloud.

* **Cách 2: Chạy full stack chế độ Development (NestJS API + Next.js):**
  * Nhấp đúp vào file **`start.bat`** ở thư mục gốc.
  * Script tự động khởi chạy Backend NestJS (Port 3000) và Frontend Next.js (Port 3001), tự động mở trình duyệt `http://localhost:3001`.

---

## 🗄️ 3. Cơ Sở Dữ Liệu Neon Serverless PostgreSQL

* **Chuỗi kết nối trực tiếp:**
  ```text
  postgresql://neondb_owner:npg_YUtqghBP38Zf@ep-wispy-hall-b4rtt92m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```
* **Bảng dữ liệu đã lưu:**
  * `profiles`: Thông tin cá nhân Lê Duy Tài (Lớp IT24M, SĐT: 0896890399, Email: huavanhen456@gmail.com, DOB: 23/04/2006).
  * `skills`: Danh mục kỹ năng Frontend, Backend, Database, Cloud & DevOps, Testing & Tools.
  * `projects`: Dự án tiêu biểu (Hệ thống sân bóng đá, Portfolio cá nhân...).
  * `experiences`: Quá trình học tập và thực hành tại trường.
  * `contact_messages`: Tin nhắn gửi từ form trên web được lưu tức thời vào Neon DB.
