-- ==========================================================================
-- ĐỒ ÁN MÃ NGUỒN MỞ 2 - HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ BUÔN MA THUỘT
-- TÁC GIẢ: LÊ DUY TÀI (IT24M) & KPA TRẦN QUANG THỊNH
-- GIẢNG VIÊN HƯỚNG DẪN: ThS. HOÀNG QUỐC TUẤN
-- CƠ SỞ DỮ LIỆU: NEON CLOUD SERVERLESS POSTGRESQL (8 BẢNG QUAN HỆ)
-- THỜI GIAN SAO LƯU: 2026-11-07T07:16:27.145Z
-- ==========================================================================

-- 1. TẠO CÁC ENUM LOẠI DỮ LIỆU
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "FieldType" AS ENUM ('SAN_5', 'SAN_7');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "FieldStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "DayType" AS ENUM ('WEEKDAY', 'WEEKEND');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. CẤU TRÚC 8 BẢNG QUAN HỆ
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role "Role" DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fields (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  field_type "FieldType" DEFAULT 'SAN_5',
  status "FieldStatus" DEFAULT 'ACTIVE',
  description TEXT,
  image_url TEXT,
  ward VARCHAR(100),
  address VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  is_peak_hour BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS price_rules (
  id SERIAL PRIMARY KEY,
  field_id INT REFERENCES fields(id) ON DELETE CASCADE,
  time_slot_id INT REFERENCES time_slots(id) ON DELETE CASCADE,
  day_type "DayType" DEFAULT 'WEEKDAY',
  price DECIMAL(12, 2) NOT NULL,
  UNIQUE(field_id, time_slot_id, day_type)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  field_id INT REFERENCES fields(id) ON DELETE CASCADE,
  time_slot_id INT REFERENCES time_slots(id) ON DELETE SET NULL,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  status "BookingStatus" DEFAULT 'PENDING',
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_code VARCHAR(50) UNIQUE NOT NULL,
  booking_id INT UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  discount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status "InvoiceStatus" DEFAULT 'UNPAID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  method "PaymentMethod" DEFAULT 'CASH',
  status "PaymentStatus" DEFAULT 'PENDING',
  paid_at TIMESTAMP,
  reference_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DỮ LIỆU THỰC TẾ CHI TIẾT (INSERT DATA)

-- Bảng users (4 bản ghi)
INSERT INTO users ("id", "full_name", "phone", "email", "password_hash", "role", "created_at") VALUES (1, 'Quản trị viên hệ thống', '0999999999', 'admin@example.com', '$2b$12$hwJ6Km2qQQLgX2wbmuZIEOubM/91oPb0WZy0lkFTj2VGEPJ7aphi2', 'ADMIN', '2026-10-30 15:20:15.22') ON CONFLICT DO NOTHING;
INSERT INTO users ("id", "full_name", "phone", "email", "password_hash", "role", "created_at") VALUES (2, 'Nhân viên trực sân', '0988888888', 'staff@example.com', '$2b$12$UHIpV3N0/m4uSjlt2TRFmulS97R1.waMFWbeAY0erRzwqOU.Fj8rK', 'STAFF', '2026-10-30 15:20:16.007') ON CONFLICT DO NOTHING;
INSERT INTO users ("id", "full_name", "phone", "email", "password_hash", "role", "created_at") VALUES (3, 'Nguyễn Văn Khách', '0901234567', 'customer@example.com', '$2b$12$te3rDnSEJlpM2fDEZ1HsT.3vnAnDhUFzJJwqNjrYvuu8i.yjC/Ws.', 'CUSTOMER', '2026-10-30 15:20:16.475') ON CONFLICT DO NOTHING;
INSERT INTO users ("id", "full_name", "phone", "email", "password_hash", "role", "created_at") VALUES (4, 'L� Ho�ng Nam', '0912345678', 'hoangnam@example.com', '$2b$12$cROfxPBh4YeOzNWC.zEkRODaF8lbVyd..h.owbHpAR2p11XIMS3wG', 'CUSTOMER', '2026-10-31 06:21:44.82') ON CONFLICT DO NOTHING;

-- Bảng fields (21 bản ghi)
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (5, 'SVĐ Buôn Ma Thuột', 'SAN_7', 'ACTIVE', 'Sân vận động trung tâm Buôn Ma Thuột, mặt sân chất lượng cao, dàn đèn chuẩn thi đấu giải.', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:58:59.553', '2 Nguyễn Công Trứ, Phường Tân Tiến, Buôn Ma Thuột', '0262 3857 805', 'Phường Tân Tiến') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (6, 'Sân bóng C1', 'SAN_5', 'ACTIVE', 'Sân cỏ nhân tạo 5 người, không gian thoáng đãng, phục vụ nước uống và trang phục.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:02.117', '1B Y Ngông, Phường Tân Tiến, Buôn Ma Thuột', '098 383 0955', 'Phường Tân Tiến') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (7, 'Sân Manchester', 'SAN_5', 'ACTIVE', 'Sân bóng mini phong cách hiện đại, dàn đèn chiếu sáng tốt, khu để xe rộng rãi.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:03.875', '130 Y Ngông, Phường Tân Tiến, Buôn Ma Thuột', '0914 123 456', 'Phường Tân Tiến') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (8, 'Sân T&H', 'SAN_5', 'ACTIVE', 'Cụm sân cỏ mini chất lượng cao, mặt cỏ êm, tổ chức giải đấu phong trào thường xuyên.', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:05.513', '110/10 Hoàng Hoa Thám, Phường Tân Tiến, Buôn Ma Thuột', '0906 448 004', 'Phường Tân Tiến') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (9, 'Sân mini Hoài Ân', 'SAN_5', 'ACTIVE', 'Sân mini thoáng mát, nằm ngay trung tâm Tân Lập, có căn tin phục vụ giải khát.', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:07.103', 'Hẻm 119 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột', '0963 747 477', 'Phường Tân Lập') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (10, 'Sân Ngọc Anh', 'SAN_5', 'ACTIVE', 'Sân bóng nhân tạo chất lượng tốt, giá cả học sinh - sinh viên, đặt sân dễ dàng.', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:08.99', 'Hẻm 44 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột', '0782 559 909', 'Phường Tân Lập') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (11, 'Sân Công Thành', 'SAN_5', 'ACTIVE', 'Mặt cỏ mới bảo dưỡng, hệ thống lưới chắn an toàn, bãi giữ xe máy và ô tô tiện lợi.', 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:10.841', 'Hẻm 44/11 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột', '0935 221 889', 'Phường Tân Lập') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (12, 'Sân Tân Thái Long', 'SAN_7', 'ACTIVE', 'Tổ hợp sân 7 và sân 5 hiện đại hàng đầu khu Y Moan, có khán đài mini cổ vũ.', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:12.459', '56 Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột', '0262 3601 888', 'Phường Tân Lợi') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (13, 'Sân Lập Nguyễn', 'SAN_5', 'ACTIVE', 'Sân bóng mini cỏ nhân tạo chất lượng cao, thoát nước tốt, hoạt động từ 6h đến 22h.', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:14.506', '128/7 Giải Phóng, Phường Tân Lợi, Buôn Ma Thuột', '0905 889 123', 'Phường Tân Lợi') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (14, 'Sân KenVin', 'SAN_5', 'ACTIVE', 'Sân mini sinh viên Ea Tam, không khí thể thao sôi động, giá ưu đãi cho học sinh sinh viên.', 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:16.248', 'Hẻm 4 Nguyễn Trường Tộ, Phường Ea Tam, Buôn Ma Thuột', '0918 776 543', 'Phường Ea Tam') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (15, 'Sân Đại Thành', 'SAN_7', 'ACTIVE', 'Sân 7 người rộng rãi, tổ chức các giải đấu cơ quan và giao lưu câu lạc bộ tại Buôn Ma Thuột.', 'https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:18.089', 'Đường Phùng Hưng, Phường Ea Tam, Buôn Ma Thuột', '0944 556 778', 'Phường Ea Tam') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (16, 'Sân Hoàng Gia', 'SAN_5', 'ACTIVE', 'Mặt cỏ cao cấp, đèn led sáng rõ, phục vụ nước ngọt đá lạnh miễn phí cho đội đặt sân.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:19.848', '22 Mai Thị Lựu, Phường Ea Tam, Buôn Ma Thuột', '0977 443 219', 'Phường Ea Tam') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (17, 'Sân ĐH Tây Nguyên', 'SAN_7', 'ACTIVE', 'Sân bóng đá trong khuôn viên trường ĐH Tây Nguyên, kích thước chuẩn, không gian rợp bóng mát.', 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:21.568', '567 Lê Duẩn, Phường Ea Tam, Buôn Ma Thuột', '0262 3825 555', 'Phường Ea Tam') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (18, 'Sân CĐ Sư Phạm', 'SAN_5', 'ACTIVE', 'Sân mini khu vực CĐ Sư Phạm Đắk Lắk, môi trường thể thao thân thiện, tiện ích đầy đủ.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:23.321', 'Hẻm 33 Lê Thị Riêng, Phường Ea Tam, Buôn Ma Thuột', '0932 110 889', 'Phường Ea Tam') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (19, 'Sân Ban Mê Sport', 'SAN_7', 'ACTIVE', 'Trung tâm thể thao Ban Mê Sport hiện đại bậc nhất phố núi, cỏ nhân tạo cao cấp, phòng thay đồ VIP.', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:25.051', '121 Hùng Vương, Phường Tự An, Buôn Ma Thuột', '0947 959 578', 'Phường Tự An') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (20, 'Sân mini Hiệp Long', 'SAN_5', 'ACTIVE', 'Sân bóng mini 5 người mặt cỏ êm, dàn đèn hiện đại, phục vụ đồ uống giải khát.', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:26.899', '87 Giải Phóng, Phường Tân Thành, Buôn Ma Thuột', '0908 667 334', 'Phường Tân Thành') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (21, 'Sân Thành Nhất', 'SAN_5', 'ACTIVE', 'Sân bóng cỏ nhân tạo chất lượng tốt, giá thành hợp lý, phong trào bóng đá sôi nổi.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:28.642', '113/44/17 Nguyễn Cơ Thạch, Phường Thành Nhất, Buôn Ma Thuột', '0982 456 781', 'Phường Thành Nhất') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (22, 'Sân An Dương Vương', 'SAN_5', 'ACTIVE', 'Sân mini gia đình tiện lợi, trang thiết bị mới, hỗ trợ mượn bóng và áo bib tập.', 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:30.688', '68 An Dương Vương, Phường Thành Nhất, Buôn Ma Thuột', '0973 889 002', 'Phường Thành Nhất') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (23, 'Sân thể thao Đức Thịnh', 'SAN_7', 'ACTIVE', 'Khu liên hợp thể thao Đức Thịnh với cụm sân 7 và sân 5, hệ thống chiếu sáng chuẩn thi đấu đêm.', 'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:32.529', 'Hẻm 174 Phan Huy Chú, Phường Khánh Xuân, Buôn Ma Thuột', '0768 447 887', 'Phường Khánh Xuân') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (24, 'Sân Tiến Thy', 'SAN_5', 'ACTIVE', 'Sân bóng mini khu vực Hòa Khánh, mặt cỏ xanh mượt, phù hợp giao lưu bóng đá địa phương.', 'https://images.unsplash.com/photo-1570498839593-e565b3d4f6fe?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:34.271', 'ĐT682, Xã Hòa Khánh, Buôn Ma Thuột', '0915 678 910', 'Xã Hòa Khánh') ON CONFLICT DO NOTHING;
INSERT INTO fields ("id", "name", "field_type", "status", "description", "image_url", "created_at", "address", "phone", "ward") VALUES (25, 'Sân Quốc Định', 'SAN_5', 'ACTIVE', 'Sân cỏ nhân tạo Hòa Thuận, phục vụ đam mê bóng đá bà con nông thôn mới và thanh thiếu niên.', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80', '2026-11-02 07:59:36.032', 'Thôn 8, Xã Hòa Thuận, Buôn Ma Thuột', '0934 890 123', 'Xã Hòa Thuận') ON CONFLICT DO NOTHING;

-- Bảng time_slots (11 bản ghi)
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (1, '06:00 - 07:30', '06:00', '07:30', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (2, '07:30 - 09:00', '07:30', '09:00', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (3, '09:00 - 10:30', '09:00', '10:30', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (4, '10:30 - 12:00', '10:30', '12:00', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (5, '12:00 - 13:30', '12:00', '13:30', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (6, '13:30 - 15:00', '13:30', '15:00', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (7, '15:00 - 16:30', '15:00', '16:30', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (8, '16:30 - 18:00', '16:30', '18:00', false) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (9, '18:00 - 19:30', '18:00', '19:30', true) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (10, '19:30 - 21:00', '19:30', '21:00', true) ON CONFLICT DO NOTHING;
INSERT INTO time_slots ("id", "label", "start_time", "end_time", "is_peak_hour") VALUES (11, '21:00 - 22:30', '21:00', '22:30', false) ON CONFLICT DO NOTHING;

-- Bảng price_rules (462 bản ghi)
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (89, 5, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (90, 5, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (91, 5, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (92, 5, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (93, 5, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (94, 5, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (95, 5, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (96, 5, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (97, 5, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (98, 5, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (99, 5, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (100, 5, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (101, 5, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (102, 5, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (103, 5, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (104, 5, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (105, 5, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (106, 5, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (107, 5, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (108, 5, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (109, 5, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (110, 5, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (111, 6, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (112, 6, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (113, 6, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (114, 6, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (115, 6, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (116, 6, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (117, 6, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (118, 6, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (119, 6, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (120, 6, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (121, 6, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (122, 6, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (123, 6, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (124, 6, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (125, 6, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (126, 6, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (127, 6, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (128, 6, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (129, 6, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (130, 6, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (131, 6, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (132, 6, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (133, 7, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (134, 7, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (135, 7, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (136, 7, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (137, 7, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (138, 7, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (139, 7, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (140, 7, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (141, 7, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (142, 7, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (143, 7, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (144, 7, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (145, 7, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (146, 7, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (147, 7, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (148, 7, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (149, 7, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (150, 7, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (151, 7, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (152, 7, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (153, 7, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (154, 7, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (155, 8, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (156, 8, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (157, 8, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (158, 8, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (159, 8, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (160, 8, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (161, 8, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (162, 8, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (163, 8, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (164, 8, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (165, 8, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (166, 8, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (167, 8, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (168, 8, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (169, 8, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (170, 8, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (171, 8, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (172, 8, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (173, 8, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (174, 8, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (175, 8, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (176, 8, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (177, 9, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (178, 9, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (179, 9, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (180, 9, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (181, 9, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (182, 9, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (183, 9, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (184, 9, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (185, 9, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (186, 9, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (187, 9, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (188, 9, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (189, 9, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (190, 9, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (191, 9, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (192, 9, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (193, 9, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (194, 9, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (195, 9, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (196, 9, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (197, 9, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (198, 9, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (199, 10, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (200, 10, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (201, 10, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (202, 10, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (203, 10, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (204, 10, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (205, 10, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (206, 10, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (207, 10, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (208, 10, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (209, 10, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (210, 10, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (211, 10, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (212, 10, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (213, 10, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (214, 10, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (215, 10, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (216, 10, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (217, 10, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (218, 10, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (219, 10, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (220, 10, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (221, 11, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (222, 11, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (223, 11, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (224, 11, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (225, 11, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (226, 11, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (227, 11, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (228, 11, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (229, 11, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (230, 11, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (231, 11, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (232, 11, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (233, 11, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (234, 11, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (235, 11, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (236, 11, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (237, 11, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (238, 11, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (239, 11, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (240, 11, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (241, 11, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (242, 11, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (243, 12, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (244, 12, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (245, 12, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (246, 12, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (247, 12, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (248, 12, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (249, 12, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (250, 12, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (251, 12, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (252, 12, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (253, 12, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (254, 12, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (255, 12, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (256, 12, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (257, 12, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (258, 12, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (259, 12, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (260, 12, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (261, 12, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (262, 12, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (263, 12, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (264, 12, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (265, 13, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (266, 13, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (267, 13, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (268, 13, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (269, 13, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (270, 13, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (271, 13, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (272, 13, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (273, 13, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (274, 13, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (275, 13, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (276, 13, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (277, 13, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (278, 13, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (279, 13, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (280, 13, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (281, 13, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (282, 13, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (283, 13, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (284, 13, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (285, 13, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (286, 13, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (287, 14, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (288, 14, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (289, 14, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (290, 14, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (291, 14, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (292, 14, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (293, 14, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (294, 14, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (295, 14, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (296, 14, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (297, 14, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (298, 14, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (299, 14, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (300, 14, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (301, 14, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (302, 14, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (303, 14, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (304, 14, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (305, 14, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (306, 14, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (307, 14, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (308, 14, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (309, 15, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (310, 15, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (311, 15, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (312, 15, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (313, 15, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (314, 15, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (315, 15, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (316, 15, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (317, 15, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (318, 15, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (319, 15, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (320, 15, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (321, 15, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (322, 15, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (323, 15, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (324, 15, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (325, 15, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (326, 15, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (327, 15, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (328, 15, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (329, 15, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (330, 15, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (331, 16, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (332, 16, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (333, 16, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (334, 16, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (335, 16, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (336, 16, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (337, 16, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (338, 16, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (339, 16, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (340, 16, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (341, 16, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (342, 16, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (343, 16, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (344, 16, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (345, 16, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (346, 16, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (347, 16, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (348, 16, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (349, 16, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (350, 16, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (351, 16, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (352, 16, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (353, 17, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (354, 17, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (355, 17, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (356, 17, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (357, 17, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (358, 17, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (359, 17, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (360, 17, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (361, 17, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (362, 17, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (363, 17, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (364, 17, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (365, 17, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (366, 17, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (367, 17, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (368, 17, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (369, 17, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (370, 17, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (371, 17, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (372, 17, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (373, 17, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (374, 17, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (375, 18, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (376, 18, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (377, 18, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (378, 18, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (379, 18, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (380, 18, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (381, 18, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (382, 18, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (383, 18, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (384, 18, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (385, 18, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (386, 18, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (387, 18, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (388, 18, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (389, 18, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (390, 18, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (391, 18, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (392, 18, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (393, 18, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (394, 18, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (395, 18, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (396, 18, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (397, 19, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (398, 19, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (399, 19, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (400, 19, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (401, 19, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (402, 19, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (403, 19, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (404, 19, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (405, 19, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (406, 19, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (407, 19, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (408, 19, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (409, 19, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (410, 19, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (411, 19, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (412, 19, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (413, 19, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (414, 19, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (415, 19, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (416, 19, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (417, 19, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (418, 19, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (419, 20, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (420, 20, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (421, 20, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (422, 20, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (423, 20, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (424, 20, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (425, 20, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (426, 20, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (427, 20, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (428, 20, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (429, 20, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (430, 20, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (431, 20, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (432, 20, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (433, 20, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (434, 20, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (435, 20, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (436, 20, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (437, 20, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (438, 20, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (439, 20, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (440, 20, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (441, 21, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (442, 21, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (443, 21, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (444, 21, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (445, 21, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (446, 21, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (447, 21, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (448, 21, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (449, 21, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (450, 21, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (451, 21, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (452, 21, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (453, 21, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (454, 21, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (455, 21, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (456, 21, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (457, 21, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (458, 21, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (459, 21, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (460, 21, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (461, 21, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (462, 21, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (463, 22, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (464, 22, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (465, 22, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (466, 22, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (467, 22, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (468, 22, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (469, 22, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (470, 22, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (471, 22, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (472, 22, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (473, 22, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (474, 22, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (475, 22, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (476, 22, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (477, 22, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (478, 22, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (479, 22, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (480, 22, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (481, 22, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (482, 22, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (483, 22, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (484, 22, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (485, 23, 1, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (486, 23, 1, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (487, 23, 2, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (488, 23, 2, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (489, 23, 3, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (490, 23, 3, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (491, 23, 4, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (492, 23, 4, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (493, 23, 5, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (494, 23, 5, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (495, 23, 6, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (496, 23, 6, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (497, 23, 7, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (498, 23, 7, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (499, 23, 8, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (500, 23, 8, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (501, 23, 9, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (502, 23, 9, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (503, 23, 10, 'WEEKDAY', '520000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (504, 23, 10, 'WEEKEND', '624000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (505, 23, 11, 'WEEKDAY', '400000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (506, 23, 11, 'WEEKEND', '480000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (507, 24, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (508, 24, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (509, 24, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (510, 24, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (511, 24, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (512, 24, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (513, 24, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (514, 24, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (515, 24, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (516, 24, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (517, 24, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (518, 24, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (519, 24, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (520, 24, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (521, 24, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (522, 24, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (523, 24, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (524, 24, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (525, 24, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (526, 24, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (527, 24, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (528, 24, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (529, 25, 1, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (530, 25, 1, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (531, 25, 2, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (532, 25, 2, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (533, 25, 3, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (534, 25, 3, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (535, 25, 4, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (536, 25, 4, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (537, 25, 5, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (538, 25, 5, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (539, 25, 6, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (540, 25, 6, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (541, 25, 7, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (542, 25, 7, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (543, 25, 8, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (544, 25, 8, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (545, 25, 9, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (546, 25, 9, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (547, 25, 10, 'WEEKDAY', '325000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (548, 25, 10, 'WEEKEND', '390000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (549, 25, 11, 'WEEKDAY', '250000.00') ON CONFLICT DO NOTHING;
INSERT INTO price_rules ("id", "field_id", "time_slot_id", "day_type", "price") VALUES (550, 25, 11, 'WEEKEND', '300000.00') ON CONFLICT DO NOTHING;

-- Bảng bookings (5 bản ghi)
INSERT INTO bookings ("id", "booking_code", "customer_id", "customer_name", "customer_phone", "field_id", "time_slot_id", "start_at", "end_at", "unit_price", "total_price", "status", "cancel_reason", "created_at") VALUES (1, 'SAN-MVZ3NCVK-F8A1', NULL, '[Sân con 5 - Số 1] Le Duy Tai', '0905123456', 5, 1, '2026-11-02 06:00:00', '2026-11-02 07:30:00', '250000.00', '250000.00', 'CANCELLED', 'Tự động hủy: Quá hạn 30 phút chưa thanh toán tiền cọc', '2026-11-02 10:11:47.434') ON CONFLICT DO NOTHING;
INSERT INTO bookings ("id", "booking_code", "customer_id", "customer_name", "customer_phone", "field_id", "time_slot_id", "start_at", "end_at", "unit_price", "total_price", "status", "cancel_reason", "created_at") VALUES (2, 'SAN-MVZ40CB6-BD42', NULL, '[Sân con 5 - Số 2] thinh', '0255556522', 14, 4, '2026-11-02 10:30:00', '2026-11-02 12:00:00', '250000.00', '250000.00', 'CANCELLED', 'Tự động hủy: Quá hạn 30 phút chưa thanh toán tiền cọc', '2026-11-02 10:21:53.234') ON CONFLICT DO NOTHING;
INSERT INTO bookings ("id", "booking_code", "customer_id", "customer_name", "customer_phone", "field_id", "time_slot_id", "start_at", "end_at", "unit_price", "total_price", "status", "cancel_reason", "created_at") VALUES (3, 'SAN-MVZFSCV3-0676', NULL, '[Sân con 11 - Tiêu chuẩn] tai', '0896890399', 18, 4, '2026-11-03 10:30:00', '2026-11-03 12:00:00', '800000.00', '800000.00', 'CANCELLED', 'Quá hạn 30 phút chưa thanh toán cọc', '2026-11-02 15:51:37.146') ON CONFLICT DO NOTHING;
INSERT INTO bookings ("id", "booking_code", "customer_id", "customer_name", "customer_phone", "field_id", "time_slot_id", "start_at", "end_at", "unit_price", "total_price", "status", "cancel_reason", "created_at") VALUES (4, 'SAN-MVZGTOGN-EE05', NULL, '[Sân con 5 - Số 2] tai', '0896890399', 16, 4, '2026-11-02 10:30:00', '2026-11-02 12:00:00', '250000.00', '250000.00', 'CANCELLED', 'Tự động hủy: Quá hạn 30 phút chưa thanh toán tiền cọc', '2026-11-02 16:20:38.466') ON CONFLICT DO NOTHING;
INSERT INTO bookings ("id", "booking_code", "customer_id", "customer_name", "customer_phone", "field_id", "time_slot_id", "start_at", "end_at", "unit_price", "total_price", "status", "cancel_reason", "created_at") VALUES (5, 'SAN-MVZHCMT9-2DB2', NULL, '[Sân con 5 - Số 1] tai', '0896890399', 5, 10, '2026-11-02 19:30:00', '2026-11-02 21:00:00', '325000.00', '325000.00', 'CANCELLED', 'Tự động hủy: Quá hạn 30 phút chưa thanh toán tiền cọc', '2026-11-02 16:35:22.817') ON CONFLICT DO NOTHING;

