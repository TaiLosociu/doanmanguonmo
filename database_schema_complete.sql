-- ==============================================================================
-- CƠ SỞ DỮ LIỆU CHUẨN NEON SERVERLESS POSTGRESQL (12 BẢNG QUAN HỆ TOÀN DIỆN)
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ & ĐẶT SÂN BÓNG ĐÁ BUÔN MA THUỘT (SAN NHA BMT)
-- SINH VIÊN THỰC HIỆN: LÊ DUY TÀI (IT24M) & KPA TRẦN QUANG THỊNH
-- GIẢNG VIÊN HƯỚNG DẪN: ThS. HOÀNG QUỐC TUẤN
-- PHIÊN BẢN CƠ SỞ DỮ LIỆU: 2.5 (TÍCH HỢP SÂN 5-7-11, FC LEO RANK ELO & CÁP KÈO)
-- ==============================================================================

-- ==============================================================================
-- PHẦN 1: TẠO CÁC KIỂU DỮ LIỆU ENUM
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "FieldType" AS ENUM ('SAN_5', 'SAN_7', 'SAN_11');
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

-- ==============================================================================
-- PHẦN 2: TẠO CẤU TRÚC 12 BẢNG QUAN HỆ (DDL)
-- ==============================================================================

-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN (users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role "Role" DEFAULT 'CUSTOMER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG CỤM SÂN BÓNG ĐÁ BUÔN MA THUỘT (fields)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG KHUNG GIỜ THI ĐẤU (time_slots)
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  is_peak_hour BOOLEAN DEFAULT FALSE
);

-- 4. BẢNG QUY TẮC GIÁ THEO SÂN & CA (price_rules)
CREATE TABLE IF NOT EXISTS price_rules (
  id SERIAL PRIMARY KEY,
  field_id INT REFERENCES fields(id) ON DELETE CASCADE,
  time_slot_id INT REFERENCES time_slots(id) ON DELETE CASCADE,
  day_type "DayType" DEFAULT 'WEEKDAY',
  price DECIMAL(12, 2) NOT NULL,
  UNIQUE(field_id, time_slot_id, day_type)
);

-- 5. BẢNG ĐƠN ĐẶT SÂN & SNAPSHOT GIÁ (bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(100) UNIQUE NOT NULL,
  customer_id INT REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  field_id INT REFERENCES fields(id) ON DELETE CASCADE,
  time_slot_id INT REFERENCES time_slots(id) ON DELETE SET NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  status "BookingStatus" DEFAULT 'PENDING',
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG HÓA ĐƠN ĐẶT SÂN (invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_code VARCHAR(100) UNIQUE NOT NULL,
  booking_id INT UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  discount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status "InvoiceStatus" DEFAULT 'UNPAID',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG GIAO DỊCH THANH TOÁN (payments)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  method "PaymentMethod" DEFAULT 'TRANSFER',
  status "PaymentStatus" DEFAULT 'PENDING',
  paid_at TIMESTAMP WITH TIME ZONE,
  reference_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. BẢNG NHẬT KÝ KIỂM TOÁN HỆ THỐNG (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG CÂU LẠC BỘ BÓNG ĐÁ / FC (football_clubs)
CREATE TABLE IF NOT EXISTS football_clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  captain_name VARCHAR(150) NOT NULL,
  captain_phone VARCHAR(20) NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  elo INT DEFAULT 1000,
  tier VARCHAR(50) DEFAULT 'ĐỒNG',
  matches_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  losses INT DEFAULT 0,
  members_count INT DEFAULT 1,
  max_members INT DEFAULT 15,
  logo_url TEXT,
  home_pitch VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG THÀNH VIÊN ĐỘI BÓNG (club_members - Tối đa 15 thành viên)
CREATE TABLE IF NOT EXISTS club_members (
  id SERIAL PRIMARY KEY,
  club_id INT NOT NULL REFERENCES football_clubs(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  member_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  position VARCHAR(50) DEFAULT 'Tiền vệ',
  number INT DEFAULT 10,
  role VARCHAR(50) DEFAULT 'MEMBER',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. BẢNG ĐĂNG BÀI BẮT ĐỐI / CÁP KÈO (matchmaking_posts)
CREATE TABLE IF NOT EXISTS matchmaking_posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150) NOT NULL,
  team_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  play_date VARCHAR(20) NOT NULL,
  play_time VARCHAR(20) NOT NULL,
  pitch_name VARCHAR(255) NOT NULL,
  pitch_id INT REFERENCES fields(id) ON DELETE SET NULL,
  format VARCHAR(50) DEFAULT 'Sân 5',
  bet_type VARCHAR(100) DEFAULT 'Giao lưu vui vẻ (50/50 tiền sân)',
  level VARCHAR(50) DEFAULT 'Trung bình - Văn phòng',
  note TEXT,
  status VARCHAR(50) DEFAULT 'OPEN',
  challenger_id INT REFERENCES users(id) ON DELETE SET NULL,
  challenger_name VARCHAR(150),
  challenger_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. BẢNG KẾT QUẢ TRẬN ĐẤU & TÍNH ĐIỂM ELO LEO RANK (match_results)
CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES matchmaking_posts(id) ON DELETE SET NULL,
  team_a_id INT REFERENCES football_clubs(id) ON DELETE SET NULL,
  team_a_name VARCHAR(150) NOT NULL,
  score_a INT NOT NULL,
  team_b_id INT REFERENCES football_clubs(id) ON DELETE SET NULL,
  team_b_name VARCHAR(150) NOT NULL,
  score_b INT NOT NULL,
  elo_change_a INT DEFAULT 0,
  elo_change_b INT DEFAULT 0,
  match_date VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- PHẦN 3: TẠO INDEXES TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings (field_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings (booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_fields_ward ON fields (ward);
CREATE INDEX IF NOT EXISTS idx_fields_type ON fields (field_type);
CREATE INDEX IF NOT EXISTS idx_clubs_elo ON football_clubs (elo DESC);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members (club_id);
CREATE INDEX IF NOT EXISTS idx_match_posts_status ON matchmaking_posts (status, play_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);

-- ==============================================================================
-- HẾT FILE SCHEMA
-- ==============================================================================
