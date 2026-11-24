
// ==========================================
// KẾT NỐI TRỰC TIẾP NEON POSTGRESQL CLOUD 24/7
// ==========================================
const NEON_SQL_ENDPOINT = "https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql";
const NEON_DB_CONNECTION = "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function queryNeonDirect(sql) {
  try {
    const res = await fetch(NEON_SQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": NEON_DB_CONNECTION
      },
      body: JSON.stringify({ query: sql })
    });
    const data = await res.json();
    if (data.message && !data.rows) throw new Error(data.message);
    return data.rows || [];
  } catch (err) {
    console.warn("[Neon Direct Warning]", err.message);
    return [];
  }
}

function escapeSqlString(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

/**
 * HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ MINI - LÊ DUY TÀI
 * MSSV/Slug: leduytai/doan
 * Core JavaScript Engine: Quản lý lịch sân, đặt ca, snapshot giá, VietQR, và Auth
 */

const API_BASE_URL = (typeof window !== "undefined" && window.localStorage && localStorage.getItem("football_api_url")) 
  ? localStorage.getItem("football_api_url") 
  : "https://doanthinhvatai.wispbyte.app/api/v1";

// 21 Sân bóng đá Buôn Ma Thuột (Đắk Lắk) phân theo Phường/Xã
const DEFAULT_FIELDS = [
  {
    "id": 5,
    "lat": 12.6784,
    "lng": 108.0428,
    "name": "SVĐ Buôn Ma Thuột",
    "ward": "Phường Tân Tiến",
    "address": "2 Nguyễn Công Trứ, Phường Tân Tiến, Buôn Ma Thuột",
    "phone": "0262 3857 805",
    "ownerName": "Anh Tuấn (Chủ nhiệm SVĐ)",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "1 sân 11 - Sân cỏ tự nhiên chuẩn thi đấu (sân nhà CLB Đắk Lắk, sức chứa 20.000 chỗ).",
    "imageUrl": "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-chuan-va-dep_101638538.jpg",
    "capacity": "11 người / đội",
    "turf": "Cỏ tự nhiên FIFA",
    "size": "68m x 105m"
  },
  {
    "id": 6,
    "lat": 12.6935,
    "lng": 108.0312,
    "name": "Sân bóng đá C1",
    "ward": "Phường Tân Tiến",
    "address": "1B Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    "phone": "098 383 0955",
    "ownerName": "Anh Hải (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "2 sân 5 (có thể ghép đá giải sân 7) - Quy mô 2 sân 5 ngoài trời (nguồn Tuấn Việt). Từng tổ chức Giải sân 7 Đắk Lắk D-League 2025.",
    "imageUrl": "https://atsport.vn/wp-content/uploads/2021/08/kich-thuoc-san-bong-da-7-nguoi-co-nhan-tao-1-1-960x960.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm",
    "size": "20m x 40m (Ghép 40m x 50m)"
  },
  {
    "id": 7,
    "lat": 12.6865,
    "lng": 108.058,
    "name": "Sân bóng đá Manchester",
    "ward": "Phường Tân Tiến",
    "address": "130 Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    "phone": "0914 123 456",
    "ownerName": "Anh Dũng (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "3 sân 5 - Gồm 2 sân 36m × 19m và 1 sân rộng 41m × 36m (nguồn Tuấn Việt).",
    "imageUrl": "https://image.made-in-china.com/202f0j00QIzeVHbmrscn/Football-Artificial-Grass-Carpets-Astro-Turf-for-Football-Stadium.webp",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo cao cấp",
    "size": "36m x 19m & 41m x 36m"
  },
  {
    "id": 8,
    "lat": 12.6812,
    "lng": 108.045,
    "name": "Sân cỏ nhân tạo T&H",
    "ward": "Phường Tân Tiến",
    "address": "110/10 Hoàng Hoa Thám, Phường Tân Tiến, Buôn Ma Thuột",
    "phone": "0906 448 004",
    "ownerName": "Chị Thảo (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "4–6 sân thể thao/cầu lông kết hợp sân bóng đá mini (nguồn Alobo & Siêu Thị Cầu Lông).",
    "imageUrl": "https://image.made-in-china.com/2f0j00IRUGJVdyrFgM/Mini-Football-Field-Artificial-Grass-Carpet-Grass-G-4001-.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ FIFA giảm chấn",
    "size": "20m x 40m"
  },
  {
    "id": 9,
    "lat": 12.679,
    "lng": 108.0515,
    "name": "Trung tâm TDTT Hoài Ân",
    "ward": "Phường Tân Lập",
    "address": "Hẻm 119 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    "phone": "0963 747 477",
    "ownerName": "Anh Ân (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân bóng đá mini trong nhà / có mái che thoáng mát trung tâm Tân Lập.",
    "imageUrl": "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo trong nhà có mái che",
    "size": "20m x 40m"
  },
  {
    "id": 10,
    "lat": 12.684,
    "lng": 108.039,
    "name": "Sân Bóng Đá Ngọc Anh",
    "ward": "Phường Thành Nhất",
    "address": "Hẻm 46 Nguyễn Thị Định, Phường Thành Nhất, Buôn Ma Thuột",
    "phone": "0943 567 890",
    "ownerName": "Anh Ngọc (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "3 sân 5 - Xác thực từ Tuấn Việt & Google Maps (Có 3 sân 5 người); gồm 2 sân 36m × 19m và 1 sân 41m × 36m.",
    "imageUrl": "https://5.imimg.com/data5/SELLER/Default/2023/8/335821545/AO/WO/DU/19508713/football-artificial-grass-1000x1000.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm mới",
    "size": "36m x 19m & 41m x 36m"
  },
  {
    "id": 11,
    "lat": 12.708,
    "lng": 108.062,
    "name": "Sân vận động ĐTL (Hà Huy Tập)",
    "ward": "Phường Tân An",
    "address": "300 Hà Huy Tập, Phường Tân An, Buôn Ma Thuột",
    "phone": "0913 456 789",
    "ownerName": "Ban quản lý Sân ĐTL",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "6 sân 5, 2 sân 7, 1 sân 11 - Cụm sân thật lớn tại Buôn Ma Thuột: 6 sân 5 (40m × 18m), 2 sân 7 (58m × 40m), 1 sân 11 (83m × 58m) (thay thế cho sân Công Thành đã đóng cửa).",
    "imageUrl": "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-rong-rai_101640962.jpg",
    "capacity": "5 - 7 - 11 người",
    "turf": "Cỏ nhân tạo Pro FIFA",
    "size": "Đa kích thước (40x18m, 58x40m, 83x58m)"
  },
  {
    "id": 12,
    "lat": 12.691,
    "lng": 108.067,
    "name": "Sân bóng đá Tân Thái Long",
    "ward": "Phường Tân Lập",
    "address": "Hẻm 303 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    "phone": "0905 998 877",
    "ownerName": "Anh Long (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "2 sân (cỏ nhân tạo có mái che) - Nguồn DakLak360 xác nhận 2 sân cỏ nhân tạo có mái che (mở 06:00–23:00).",
    "imageUrl": "https://5.imimg.com/data5/SELLER/Default/2024/4/410627380/PG/HQ/JD/1329433/artificial-football-turf-1000x1000.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo có mái che",
    "size": "20m x 40m"
  },
  {
    "id": 13,
    "lat": 12.702,
    "lng": 108.055,
    "name": "Sân Lập Nguyễn",
    "ward": "Phường Tân An",
    "address": "Hẻm Nguyễn Chí Thanh, Phường Tân An, Buôn Ma Thuột",
    "phone": "0905 889 900",
    "ownerName": "Anh Lập (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân mini cụm Tân An, phục vụ thi đấu giao lưu phong trào BMT.",
    "imageUrl": "https://bizweb.dktcdn.net/100/017/070/files/kich-thuoc-san-bong-da-1-jpeg.jpg?v=1671246300021",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo tiêu chuẩn",
    "size": "20m x 40m"
  },
  {
    "id": 14,
    "lat": 12.6955,
    "lng": 108.028,
    "name": "Sân KenVin",
    "ward": "Phường Tân Lợi",
    "address": "Hẻm Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột",
    "phone": "0935 123 789",
    "ownerName": "Anh Vinh (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân cỏ nhân tạo khu vực Y Moan, không gian thoáng đãng.",
    "imageUrl": "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm",
    "size": "20m x 40m"
  },
  {
    "id": 15,
    "lat": 12.698,
    "lng": 108.025,
    "name": "Sân Đại Thành",
    "ward": "Phường Tân Lợi",
    "address": "Đường Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột",
    "phone": "0903 556 778",
    "ownerName": "Anh Thành (Chủ cụm sân)",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "Sân bóng cụm Tân Lợi, đèn LED thi đấu ban đêm.",
    "imageUrl": "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=900&auto=format&fit=crop&q=80",
    "capacity": "7 người / đội",
    "turf": "Cỏ nhân tạo Pro",
    "size": "30m x 50m"
  },
  {
    "id": 16,
    "lat": 12.688,
    "lng": 108.035,
    "name": "Sân Hoàng Gia",
    "ward": "Phường Tân Lợi",
    "address": "Hẻm Phan Chu Trinh, Phường Tân Lợi, Buôn Ma Thuột",
    "phone": "0918 334 455",
    "ownerName": "Anh Hoàng (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Cụm sân cỏ mini phong trào, đầy đủ tiện ích và giải khát.",
    "imageUrl": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo tiêu chuẩn",
    "size": "20m x 40m"
  },
  {
    "id": 17,
    "lat": 12.6515,
    "lng": 108.031,
    "name": "SVĐ Trường ĐH Tây Nguyên",
    "ward": "Phường Ea Tam",
    "address": "567 Lê Duẩn, Phường Ea Tam, Buôn Ma Thuột",
    "phone": "0262 3825 212",
    "ownerName": "Trung tâm GDTC ĐH Tây Nguyên",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "1 sân 11 - Sân vận động chính trong khuôn viên trường (từng tổ chức vòng chung kết Giải sân 7 VĐQG theo Báo Gia Lai).",
    "imageUrl": "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-dep-nhin-tu-tren-cao_101639111.jpg",
    "capacity": "7 - 11 người",
    "turf": "Cỏ tự nhiên & nhân tạo SVĐ",
    "size": "65m x 100m"
  },
  {
    "id": 18,
    "lat": 12.658,
    "lng": 108.036,
    "name": "Sân CĐ Sư Phạm",
    "ward": "Phường Ea Tam",
    "address": "Hẻm 33 Lê Thị Riêng, Phường Ea Tam, Buôn Ma Thuột",
    "phone": "0932 110 889",
    "ownerName": "Anh Trí (Quản lý cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân bóng mini khu vực CĐ Sư Phạm Đắk Lắk, môi trường thể thao thân thiện.",
    "imageUrl": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm",
    "size": "20m x 40m"
  },
  {
    "id": 19,
    "lat": 12.694,
    "lng": 108.071,
    "name": "Sân bóng đá Ban Mê Sport",
    "ward": "Phường Tân Lập",
    "address": "Hẻm 403 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    "phone": "0935 444 777",
    "ownerName": "Anh Sơn (Chủ cụm sân)",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "3 sân 5, 1 sân 7 - Tổng 4 sân: 3 sân 5 (38m × 18m) và 1 sân 7 (53m × 38m) (xác thực kép từ Tuấn Việt & DakLak360).",
    "imageUrl": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo FIFA Pro",
    "size": "38m x 18m & 53m x 38m"
  },
  {
    "id": 20,
    "lat": 12.682,
    "lng": 108.056,
    "name": "Sân mini Hiệp Long",
    "ward": "Phường Tân Lập",
    "address": "Hẻm 175 Hùng Vương, Phường Tân Lập, Buôn Ma Thuột",
    "phone": "0905 112 233",
    "ownerName": "Anh Long (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân mini cỏ nhân tạo khu vực Hùng Vương - Tân Lập.",
    "imageUrl": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo tiêu chuẩn",
    "size": "20m x 40m"
  },
  {
    "id": 21,
    "lat": 12.677,
    "lng": 108.04,
    "name": "Sân Thành Nhất",
    "ward": "Phường Thắng Lợi",
    "address": "Đường Phan Bội Châu, Phường Thắng Lợi, Buôn Ma Thuột",
    "phone": "0905 778 899",
    "ownerName": "Anh Nhất (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Cụm sân phong trào trung tâm Buôn Ma Thuột.",
    "imageUrl": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&auto=format&fit=crop&q=80",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm",
    "size": "20m x 40m"
  },
  {
    "id": 23,
    "lat": 12.641,
    "lng": 108.019,
    "name": "Sân thể thao Đức Thịnh",
    "ward": "Phường Khánh Xuân",
    "address": "Đường Võ Văn Kiệt, Phường Khánh Xuân, Buôn Ma Thuột",
    "phone": "0905 667 788",
    "ownerName": "Anh Thịnh (Chủ cụm sân)",
    "fieldType": "SAN_7",
    "status": "ACTIVE",
    "description": "4 sân thể thao đa năng & bóng đá mini (nguồn tổng hợp Alobo/Siêu Thị Cầu Lông).",
    "imageUrl": "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&auto=format&fit=crop&q=80",
    "capacity": "7 người / đội",
    "turf": "Cỏ nhân tạo đa năng",
    "size": "30m x 50m"
  },
  {
    "id": 24,
    "lat": 12.628,
    "lng": 108.012,
    "name": "Sân Tiến Thy",
    "ward": "Xã Hòa Khánh",
    "address": "Quốc lộ 14, Xã Hòa Khánh, Buôn Ma Thuột",
    "phone": "0905 334 455",
    "ownerName": "Anh Tiến (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân cỏ nhân tạo khu vực Hòa Khánh, mặt sân rộng rãi.",
    "imageUrl": "https://luoinhua.net/uploads/tin-tuc-luoi-nhua/2016_01/luoi-san-co-nhan-tao.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo 50mm",
    "size": "20m x 40m"
  },
  {
    "id": 25,
    "lat": 12.721,
    "lng": 108.069,
    "name": "Sân Quốc Định",
    "ward": "Xã Hòa Thuận",
    "address": "Đường Đinh Núp, Xã Hòa Thuận, Buôn Ma Thuột",
    "phone": "0905 445 566",
    "ownerName": "Anh Định (Chủ cụm sân)",
    "fieldType": "SAN_5",
    "status": "ACTIVE",
    "description": "Sân bóng giao lưu khu vực Hòa Thuận, mở cửa 06:00 - 22:30.",
    "imageUrl": "https://pos.nvncdn.com/b0b717-26181/art/artCT/20240812_0rmC0gAF.jpg",
    "capacity": "5 - 7 người / đội",
    "turf": "Cỏ nhân tạo tiêu chuẩn",
    "size": "20m x 40m"
  }
];

// 11 Khung giờ mở cửa trong ngày
const DEFAULT_TIME_SLOTS = [
  { id: 1, label: "06:00 - 07:30", startTime: "06:00", endTime: "07:30", isPeakHour: false },
  { id: 2, label: "07:30 - 09:00", startTime: "07:30", endTime: "09:00", isPeakHour: false },
  { id: 3, label: "09:00 - 10:30", startTime: "09:00", endTime: "10:30", isPeakHour: false },
  { id: 4, label: "10:30 - 12:00", startTime: "10:30", endTime: "12:00", isPeakHour: false },
  { id: 5, label: "12:00 - 13:30", startTime: "12:00", endTime: "13:30", isPeakHour: false },
  { id: 6, label: "13:30 - 15:00", startTime: "13:30", endTime: "15:00", isPeakHour: false },
  { id: 7, label: "15:00 - 16:30", startTime: "15:00", endTime: "16:30", isPeakHour: false },
  { id: 8, label: "16:30 - 18:00", startTime: "16:30", endTime: "18:00", isPeakHour: false },
  { id: 9, label: "18:00 - 19:30", startTime: "18:00", endTime: "19:30", isPeakHour: true },
  { id: 10, label: "19:30 - 21:00", startTime: "19:30", endTime: "21:00", isPeakHour: true },
  { id: 11, label: "21:00 - 22:30", startTime: "21:00", endTime: "22:30", isPeakHour: false }
];

// Định dạng tiền tệ VNĐ
function formatMoney(amount) {
  return new Intl.NumberFormat("vi-VN").format(Number(amount)) + "đ";
}

// Lấy ngày hiện tại theo giờ Việt Nam YYYY-MM-DD
function getTodayString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

// Phân bổ sân con thực tế chuẩn xác từng cụm sân Buôn Ma Thuột
function getFieldSubPitches(field) {
  if (!field) return [];
  const id = typeof field === "number" ? field : (field.id || 0);
  switch (id) {
    case 5: // SVĐ Buôn Ma Thuột: DUY NHẤT 1 SÂN 11
      return [
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân 11 - SVĐ Buôn Ma Thuột",
          tag: "Sân 11 SVĐ",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Cỏ tự nhiên chuẩn thi đấu quốc gia (CLB Đắk Lắk, 20.000 chỗ)",
          basePrice: 1000000,
          highlight: "Sân vận động chính tỉnh Đắk Lắk, mặt cỏ tự nhiên chuẩn quốc gia",
          desc: "Sân cỏ tự nhiên chuẩn thi đấu, sân nhà CLB Đắk Lắk sức chứa 20.000 chỗ."
        }
      ];

    case 6: // Sân bóng đá C1: 2 sân 5, ghép giải sân 7 (KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ngoài trời (nguồn Tuấn Việt)",
          basePrice: 250000,
          highlight: "Quy mô 2 sân 5 người ngoài trời, mặt cỏ bám giày",
          desc: "Mặt cỏ êm chân, vạch kẻ thi đấu rõ nét ngoài trời."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ngoài trời (nguồn Tuấn Việt)",
          basePrice: 250000,
          highlight: "Dàn đèn LED chiếu sáng ban đêm",
          desc: "Dàn đèn LED 400W siêu sáng không chói mắt."
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Ghép giải D-League",
          tag: "Sân 7 Ghép",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Ghép 2 sân 5 đá giải sân 7",
          basePrice: 400000,
          highlight: "Từng tổ chức Giải sân 7 Đắk Lắk D-League 2025 (Báo Tuổi Trẻ & Văn Hóa)",
          desc: "Ghép 2 sân 5 thành sân 7 thi đấu giải phong trào."
        }
      ];

    case 7: // Sân bóng đá Manchester: 3 sân 5 (KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (36m × 19m)",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m chuẩn Tuấn Việt",
          desc: "Kích thước 36m × 19m chuẩn Tuấn Việt."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (36m × 19m)",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m, mặt cỏ mới",
          desc: "Kích thước 36m × 19m, mặt cỏ mới."
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 Rộng (41m × 36m)",
          tag: "Sân 5 Số 3 (Rộng)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Rộng)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ô rộng 41m × 36m",
          basePrice: 300000,
          highlight: "Sân rộng 41m × 36m đá 5-6 người cực kỳ thoáng",
          desc: "Ô sân rộng 41m × 36m cực kỳ thoáng mát."
        }
      ];

    case 10: // Sân Bóng Đá Ngọc Anh: 3 sân 5 (KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (36m × 19m)",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 36m × 19m",
          basePrice: 250000,
          highlight: "Xác thực kép từ Tuấn Việt & Review Google Maps (3 sân 5)",
          desc: "Kích thước 36m × 19m."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (36m × 19m)",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m, dàn đèn tốt",
          desc: "Kích thước 36m × 19m, dàn đèn tốt."
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 Rộng (41m × 36m)",
          tag: "Sân 5 Số 3 (Rộng)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Rộng)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ô rộng 41m × 36m",
          basePrice: 300000,
          highlight: "Sân rộng 41m × 36m thoải mái ban bật phối hợp",
          desc: "Sân rộng 41m × 36m thoải mái ban bật phối hợp."
        }
      ];

    case 11: // Sân vận động ĐTL (300 Hà Huy Tập): 6 sân 5, 2 sân 7, 1 sân 11 - Cụm sân lớn
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (40m × 18m)",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m tại 300 Hà Huy Tập",
          desc: "Sân 5 quy chuẩn 40m × 18m."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (40m × 18m)",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
          desc: "Sân 5 quy chuẩn 40m × 18m."
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 (40m × 18m)",
          tag: "Sân 5 Số 3",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
          desc: "Sân 5 quy chuẩn 40m × 18m."
        },
        {
          id: "SAN_5_4",
          code: "5-4",
          name: "Sân con 5 - Số 4 (40m × 18m)",
          tag: "Sân 5 Số 4",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
          desc: "Sân 5 quy chuẩn 40m × 18m."
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Số 1 (58m × 40m)",
          tag: "Sân 7 Số 1",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 58m × 40m",
          basePrice: 400000,
          highlight: "Kích thước 58m × 40m chuẩn giải phong trào",
          desc: "Kích thước 58m × 40m chuẩn giải phong trào."
        },
        {
          id: "SAN_7_2",
          code: "7-2",
          name: "Sân con 7 - Số 2 (58m × 40m)",
          tag: "Sân 7 Số 2",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 58m × 40m",
          basePrice: 400000,
          highlight: "Kích thước 58m × 40m chuẩn giải",
          desc: "Kích thước 58m × 40m chuẩn giải."
        },
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân con 11 - Tiêu chuẩn ĐTL (83m × 58m)",
          tag: "Sân 11 ĐTL",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Mặt sân 83m × 58m chuẩn thi đấu",
          basePrice: 800000,
          highlight: "Kích thước lớn 83m × 58m tổ chức giải đấu",
          desc: "Kích thước lớn 83m × 58m tổ chức giải đấu."
        }
      ];

    case 12: // Sân bóng đá Tân Thái Long: 2 sân có mái che (KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Mái che Số 1",
          tag: "Sân 5 Mái che 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Có mái che)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo có mái che, mở 06:00 - 23:00",
          basePrice: 280000,
          highlight: "Nguồn DakLak360: Sân cỏ nhân tạo có mái che, mở 06:00–23:00",
          desc: "Sân có mái che mát mẻ, mở đến 23:00."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Mái che Số 2",
          tag: "Sân 5 Mái che 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Có mái che)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo có mái che, mở 06:00 - 23:00",
          basePrice: 280000,
          highlight: "Mặt cỏ khô ráo trong mọi điều kiện thời tiết",
          desc: "Mặt cỏ khô ráo trong mọi điều kiện thời tiết."
        }
      ];

    case 17: // SVĐ Trường ĐH Tây Nguyên: DUY NHẤT 1 SÂN 11
      return [
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân 11 - SVĐ ĐH Tây Nguyên",
          tag: "Sân 11 ĐHTN",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Sân vận động chính trong khuôn viên trường",
          basePrice: 800000,
          highlight: "Từng tổ chức VCK Giải sân 7 VĐQG trên mặt sân theo Báo Gia Lai",
          desc: "Sân vận động chính trường ĐH Tây Nguyên."
        }
      ];

    case 19: // Sân Ban Mê Sport: 3 sân 5, 1 sân 7 (KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (38m × 18m)",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m (Tuấn Việt & DakLak360)",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
          desc: "Kích thước thực tế 38m × 18m."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (38m × 18m)",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
          desc: "Kích thước thực tế 38m × 18m."
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 (38m × 18m)",
          tag: "Sân 5 Số 3",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
          desc: "Kích thước thực tế 38m × 18m."
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Chuẩn (53m × 38m)",
          tag: "Sân 7 Chuẩn",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 53m × 38m",
          basePrice: 400000,
          highlight: "Kích thước thực tế 53m × 38m đá 7 người cực chuẩn",
          desc: "Kích thước thực tế 53m × 38m chuẩn thi đấu."
        }
      ];

    default: // 9 sân phong trào còn lại (ID 8, 9, 13, 14, 15, 16, 18, 20, 21, 23, 24, 25): CHỈ CÓ 2 SÂN 5 MINI (BỎ SÂN 7, BỎ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1",
          tag: "Sân 5 Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 50mm chống trượt",
          basePrice: 250000,
          highlight: "Mặt cỏ êm ái, bám giày phong trào",
          desc: "Mặt cỏ êm ái, bám giày phong trào."
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2",
          tag: "Sân 5 Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo tiêu chuẩn",
          basePrice: 250000,
          highlight: "Dàn đèn LED chiếu sáng ban đêm",
          desc: "Dàn đèn LED chiếu sáng ban đêm."
        }
      ];
  }
}

// Khởi tạo Database giả lập trên localStorage nếu chưa có

// ==========================================
// 1. SÀN CÁP KÈO BÓNG ĐÁ PHONG TRÀO BMT (MATCHMAKING)
// ==========================================
const DEFAULT_MATCHMAKING_POSTS = [
  {
    id: 1,
    teamName: "FC Ban Mê Phủi",
    captainName: "Anh Tuấn",
    phone: "0905123456",
    fieldId: 6,
    fieldName: "Sân bóng đá C1",
    fieldType: "SAN_5",
    matchDate: "2026-11-24",
    timeSlot: "17:30 - 19:00",
    level: "TRUNG_BINH",
    levelLabel: "Trung bình (Phong trào)",
    betRule: "CHIA_DOI",
    betLabel: "Tiền sân 5-5",
    status: "OPEN",
    avatar: "🦁",
    description: "Đội gồm anh em công sở, đá vui vẻ cọ xát sau giờ làm, không va chạm mạnh.",
    createdAt: "10 phút trước"
  },
  {
    id: 2,
    teamName: "FC Ea Kao Trẻ",
    captainName: "Hoàng Long",
    phone: "0914888999",
    fieldId: 19,
    fieldName: "Sân bóng đá Ban Mê Sport",
    fieldType: "SAN_7",
    matchDate: "2026-11-24",
    timeSlot: "19:00 - 20:30",
    level: "BAN_CHUYEN",
    levelLabel: "Khá - Chiến (Cọ xát)",
    betRule: "THUA_BAO",
    betLabel: "Đội thua trả sân",
    status: "OPEN",
    avatar: "⚡",
    description: "Cần tìm đối sân 7 cứng chân, thể lực tốt để tập dượt trước giải D-League Đắk Lắk.",
    createdAt: "1 giờ trước"
  },
  {
    id: 3,
    teamName: "FC Bác Sĩ Đắk Lắk",
    captainName: "Bác sĩ Minh",
    phone: "0935112233",
    fieldId: 10,
    fieldName: "Sân Bóng Đá Ngọc Anh",
    fieldType: "SAN_5",
    matchDate: "2026-11-25",
    timeSlot: "06:30 - 08:00",
    level: "VUI_VE",
    levelLabel: "Dưỡng sinh (Vui vẻ)",
    betRule: "KEO_NUOC",
    betLabel: "Tiền sân 5-5 + Kèo nước",
    status: "MATCHED",
    matchedBy: "FC Dược Phẩm Ban Mê",
    avatar: "🩺",
    description: "Giao lưu thể dục buổi sáng, giữ sức khỏe và tinh thần thoải mái.",
    createdAt: "3 giờ trước"
  },
  {
    id: 4,
    teamName: "FC Sinh Viên Tây Nguyên",
    captainName: "Quang Thịnh",
    phone: "0947000111",
    fieldId: 17,
    fieldName: "SVĐ Trường ĐH Tây Nguyên",
    fieldType: "SAN_11",
    matchDate: "2026-11-26",
    timeSlot: "16:00 - 18:00",
    level: "TRUNG_BINH",
    levelLabel: "Trung bình (Phong trào)",
    betRule: "CHIA_DOI",
    betLabel: "Tiền sân 5-5",
    status: "OPEN",
    avatar: "🎓",
    description: "Kèo sân 11 người giao hữu sinh viên và cựu sinh viên, cọ xát nâng cao kỹ chiến thuật.",
    createdAt: "Hôm nay"
  }
];

// ==========================================
// 2. GIẢI ĐẤU MINI & BẢNG XẾP HẠNG (TOURNAMENT HUB)
// ==========================================
const DEFAULT_TOURNAMENT_DATA = {
  name: "CÚP TỨ HÙNG BAN MÊ 2026",
  subTitle: "Giải đấu giao lưu các đội bóng phong trào xuất sắc Buôn Ma Thuột",
  venue: "Sân Vận Động ĐTL (300 Hà Huy Tập) & Sân C1",
  standings: [
    { rank: 1, team: "FC Sân Nhà (Chủ giải)", played: 3, won: 2, drawn: 1, lost: 0, gf: 8, ga: 3, gd: "+5", points: 7, form: ["W", "W", "D"] },
    { rank: 2, team: "FC Ban Mê Sport", played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 4, gd: "+2", points: 6, form: ["W", "L", "W"] },
    { rank: 3, team: "FC ĐH Tây Nguyên", played: 3, won: 1, drawn: 1, lost: 1, gf: 5, ga: 5, gd: "0", points: 4, form: ["L", "W", "D"] },
    { rank: 4, team: "FC ĐTL Hà Huy Tập", played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 9, gd: "-7", points: 0, form: ["L", "L", "L"] }
  ],
  bracketMatches: [
    {
      id: "BK1",
      round: "BÁN KẾT 1",
      time: "17:30 · Sân 7-1 ĐTL",
      team1: { name: "FC Sân Nhà", score: 3 },
      team2: { name: "FC ĐH Tây Nguyên", score: 2 },
      status: "FINISHED",
      winner: "FC Sân Nhà"
    },
    {
      id: "BK2",
      round: "BÁN KẾT 2",
      time: "19:00 · Sân 7-2 ĐTL",
      team1: { name: "FC Ban Mê Sport", score: 2 },
      team2: { name: "FC ĐTL Hà Huy Tập", score: 1 },
      status: "FINISHED",
      winner: "FC Ban Mê Sport"
    },
    {
      id: "H3",
      round: "TRANH HẠNG BA",
      time: "16:30 · Sân C1",
      team1: { name: "FC ĐH Tây Nguyên", score: 2 },
      team2: { name: "FC ĐTL Hà Huy Tập", score: 1 },
      status: "FINISHED",
      winner: "FC ĐH Tây Nguyên"
    },
    {
      id: "CK",
      round: "CHUNG KẾT CÚP TỨ HÙNG",
      time: "18:00 · SVĐ Buôn Ma Thuột",
      team1: { name: "FC Sân Nhà", score: 1 },
      team2: { name: "FC Ban Mê Sport", score: 0 },
      status: "FINISHED",
      winner: "FC Sân Nhà (VÔ ĐỊCH 🏆)"
    }
  ]
};

// ==========================================
// 3. HỆ THỐNG CÂU LẠC BỘ (FC) & HỘI NHÓM - LEO RANK ELO (TỐI ĐA 15 NGƯỜI)
// ==========================================
const MAX_CLUB_MEMBERS = 15;

const DEFAULT_CLUBS = [
  {
    id: 1,
    name: "FC Sân Nhà Ban Mê",
    shortName: "SNBM",
    avatar: "⚽",
    banner: "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-chuan-va-dep_101638538.jpg",
    captainId: 1,
    captainName: "Lê Duy Tài",
    captainPhone: "0896890399",
    description: "Câu lạc bộ chính thức của hệ thống Sân Nhà FC tại Buôn Ma Thuột.",
    ward: "Phường Tân Tiến",
    fieldPreference: "Sân bóng đá C1",
    level: "TRUNG_BINH",
    elo: 1200,
    rank: "🥈 BẠC",
    wins: 12, draws: 3, losses: 5,
    goalsFor: 48, goalsAgainst: 28,
    members: [
      { userId: 1, name: "Lê Duy Tài", phone: "0896890399", role: "CAPTAIN", number: 10, joinedAt: "2026-10-01" },
      { userId: 2, name: "Kpa Trần Quang Thịnh", phone: "0905123456", role: "CO_CAPTAIN", number: 7, joinedAt: "2026-10-01" },
      { userId: 100, name: "Nguyễn Minh Hoàng", phone: "0914567890", role: "MEMBER", number: 9, joinedAt: "2026-10-05" },
      { userId: 101, name: "Trần Đức Long", phone: "0932111222", role: "MEMBER", number: 8, joinedAt: "2026-10-10" },
      { userId: 102, name: "Lê Quốc Hùng", phone: "0918999888", role: "MEMBER", number: 1, joinedAt: "2026-10-12" }
    ],
    createdAt: "2026-10-01",
    isRecruiting: true
  },
  {
    id: 2,
    name: "FC Ea Tam Warrior",
    shortName: "EATW",
    avatar: "🦁",
    banner: "https://atsport.vn/wp-content/uploads/2021/08/kich-thuoc-san-bong-da-7-nguoi-co-nhan-tao-1-1-960x960.jpg",
    captainId: 3,
    captainName: "Nguyễn Anh Tuấn",
    captainPhone: "0935444777",
    description: "Đội bóng phong trào mạnh nhất khu vực Ea Tam, chuyên thi đấu sân 7.",
    ward: "Phường Ea Tam",
    fieldPreference: "SVĐ ĐH Tây Nguyên",
    level: "BAN_CHUYEN",
    elo: 1450,
    rank: "🥇 VÀNG",
    wins: 18, draws: 2, losses: 3,
    goalsFor: 65, goalsAgainst: 20,
    members: [
      { userId: 3, name: "Nguyễn Anh Tuấn", phone: "0935444777", role: "CAPTAIN", number: 10, joinedAt: "2026-09-15" },
      { userId: 103, name: "Phạm Văn Đức", phone: "0943567890", role: "CO_CAPTAIN", number: 11, joinedAt: "2026-09-15" },
      { userId: 104, name: "Trần Hữu Phúc", phone: "0918234567", role: "MEMBER", number: 4, joinedAt: "2026-09-20" },
      { userId: 105, name: "Nguyễn Thanh Tùng", phone: "0932678901", role: "MEMBER", number: 6, joinedAt: "2026-09-22" },
      { userId: 106, name: "Lê Minh Quân", phone: "0905789012", role: "MEMBER", number: 1, joinedAt: "2026-10-01" },
      { userId: 107, name: "Võ Duy Mạnh", phone: "0914890123", role: "MEMBER", number: 21, joinedAt: "2026-10-05" }
    ],
    createdAt: "2026-09-15",
    isRecruiting: true
  },
  {
    id: 3,
    name: "FC Voi Chiến Tây Nguyên",
    shortName: "VCTN",
    avatar: "🐘",
    banner: "https://5.imimg.com/data5/SELLER/Default/2023/8/335821545/AO/WO/DU/19508713/football-artificial-grass-1000x1000.jpg",
    captainId: 5,
    captainName: "Trần Quốc Cường",
    captainPhone: "0912345678",
    description: "Đội bóng mạnh nhất giải phong trào Đắk Lắk, nhiều lần vô địch giải sân 7.",
    ward: "Phường Tân Lập",
    fieldPreference: "Sân Ban Mê Sport",
    level: "BAN_CHUYEN",
    elo: 1680,
    rank: "💎 KIM CƯƠNG",
    wins: 25, draws: 5, losses: 2,
    goalsFor: 88, goalsAgainst: 15,
    members: [
      { userId: 5, name: "Trần Quốc Cường", phone: "0912345678", role: "CAPTAIN", number: 9, joinedAt: "2026-08-01" },
      { userId: 111, name: "Lê Văn Hùng", phone: "0943678901", role: "CO_CAPTAIN", number: 10, joinedAt: "2026-08-01" },
      { userId: 112, name: "Phạm Minh Tuấn", phone: "0918789012", role: "MEMBER", number: 5, joinedAt: "2026-08-05" },
      { userId: 113, name: "Nguyễn Đình Trọng", phone: "0932890123", role: "MEMBER", number: 21, joinedAt: "2026-08-10" },
      { userId: 114, name: "Hồ Anh Quân", phone: "0905901234", role: "MEMBER", number: 19, joinedAt: "2026-08-15" },
      { userId: 115, name: "Vũ Tiến Dũng", phone: "0914012345", role: "MEMBER", number: 1, joinedAt: "2026-08-20" },
      { userId: 116, name: "Đỗ Hữu Dũng", phone: "0963123456", role: "MEMBER", number: 8, joinedAt: "2026-09-01" }
    ],
    createdAt: "2026-08-01",
    isRecruiting: false
  }
];

function getEloRank(elo) {
  if (elo >= 1600) return "💎 KIM CƯƠNG";
  if (elo >= 1400) return "🥇 VÀNG";
  if (elo >= 1100) return "🥈 BẠC";
  if (elo >= 800) return "🥉 ĐỒNG";
  return "🆕 MỚI";
}

function getEloColor(elo) {
  if (elo >= 1600) return "#329dd2";
  if (elo >= 1400) return "#eab308";
  if (elo >= 1100) return "#cbd5e1";
  if (elo >= 800) return "#f59e0b";
  return "#94a3b8";
}

// ==========================================
// 4. LEAFLET MAP & GPS ENGINE (CHUẨN ĐỊNH VỊ + CHỈ ĐƯỜNG)
// ==========================================
let pitchLeafletMap = null;
let pitchMarkers = [];
let userLocationMarker = null;
let routeLine = null;
let userLat = null;
let userLng = null;

function initPitchMap() {
  const mapContainer = document.getElementById("pitchMapContainer");
  if (!mapContainer) return;
  if (typeof L === "undefined") {
    mapContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b; font-size: 14px;">Đang tải bản đồ OpenStreetMap Buôn Ma Thuột...</div>';
    return;
  }
  if (pitchLeafletMap) {
    setTimeout(() => { pitchLeafletMap.invalidateSize(); }, 200);
    return;
  }

  pitchLeafletMap = L.map('pitchMapContainer').setView([12.6865, 108.0450], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(pitchLeafletMap);

  renderPitchMarkers();

  // Tự động quét GPS khi mở trang
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        showUserLocationOnMap(userLat, userLng);
      },
      () => {
        userLat = 12.6865;
        userLng = 108.0450;
        showUserLocationOnMap(userLat, userLng, true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }
}

function showUserLocationOnMap(lat, lng, isDefault = false) {
  if (!pitchLeafletMap) return;

  if (userLocationMarker) {
    pitchLeafletMap.removeLayer(userLocationMarker);
  }

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background: #eb2f33; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid #ffffff; box-shadow: 0 0 25px rgba(235,47,51,0.8); animation: pulse-red 2s infinite; cursor: pointer;">📍</div>',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40]
  });

  userLocationMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(pitchLeafletMap);
  userLocationMarker.bindPopup(
    '<div style="font-family: inherit; padding: 6px; min-width: 200px;">' +
    '<strong style="font-size: 14px; color: #eb2f33; display: block; margin-bottom: 4px;">📍 Vị trí hiện tại của bạn</strong>' +
    '<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">' + (isDefault ? 'Mặc định: Trung tâm Buôn Ma Thuột' : 'Định vị GPS chính xác') + '</div>' +
    '<div style="font-size: 11px; color: #080f1b; font-family: monospace; background: #edf4f9; padding: 4px 6px; border-radius: 4px;">Tọa độ: ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + '</div>' +
    '</div>'
  );

  renderPitchMarkers();
}

function renderPitchMarkers(filterType = "ALL") {
  if (!pitchLeafletMap) return;
  pitchMarkers.forEach(m => pitchLeafletMap.removeLayer(m));
  pitchMarkers = [];

  const fields = DEFAULT_FIELDS.filter(f => {
    if (f.status === 'MAINTENANCE' || f.id === 22) return false;
    if (filterType === "ALL") return true;
    const subs = (typeof getFieldSubPitches === "function") ? getFieldSubPitches(f) : [];
    return subs.some(s => s.category === filterType);
  });

  if (userLat && userLng) {
    fields.forEach(f => {
      f._distance = calculateDistance(userLat, userLng, f.lat || 12.6865, f.lng || 108.0450);
    });
    fields.sort((a, b) => (a._distance || 999) - (b._distance || 999));
  }

  fields.forEach(field => {
    if (!field.lat || !field.lng) return;

    const dist = (userLat && userLng) ? calculateDistance(userLat, userLng, field.lat, field.lng) : null;
    const distText = dist ? dist + ' km' : '';

    const customIcon = L.divIcon({
      className: 'pitch-map-marker',
      html: '<div style="background: #329dd2; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(50,157,210,0.45); font-weight: bold; cursor: pointer;">⚽</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([field.lat, field.lng], { icon: customIcon }).addTo(pitchLeafletMap);

    const gmapOrigin = (userLat && userLng) ? '&origin=' + userLat + ',' + userLng : '';
    const gmapDest = encodeURIComponent(field.name + ', ' + (field.address || '') + ', Buôn Ma Thuột, Đắk Lắk');
    const gmapNavUrl = 'https://www.google.com/maps/dir/?api=1' + gmapOrigin + '&destination=' + gmapDest + '&travelmode=driving';
    const gmapSearchUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(field.name + ' ' + (field.address || '') + ' Buôn Ma Thuột');

    const popupHtml =
      '<div style="font-family: inherit; width: 270px; padding: 2px;">' +
      '<img src="' + field.imageUrl + '" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" alt="' + field.name + '" />' +
      '<strong style="font-size: 15px; color: #080f1b; display: block; margin-bottom: 4px;">' + field.name + '</strong>' +
      (distText ? '<div style="font-size: 12px; color: #329dd2; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">📏 Cách vị trí của bạn: <strong>' + distText + '</strong> (~' + Math.ceil(dist * 2.5) + ' phút xe máy)</div>' : '') +
      '<div style="font-size: 11px; color: #166534; font-weight: 700; margin-bottom: 4px;">📍 ' + field.ward + ' · ' + (field.address || '') + '</div>' +
      '<div style="font-size: 11px; color: #475569; margin-bottom: 4px;">📞 Hotline: <strong>' + (field.phone || '0896890399') + '</strong></div>' +
      '<div style="font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.4;">' + field.description + '</div>' +
      '<div style="display: flex; gap: 6px; flex-wrap: wrap;">' +
      '<button type="button" onclick="drawRouteToPitch(' + field.id + ')" style="flex: 1; background: #eb2f33; color: white; border: none; padding: 8px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">🧭 Dẫn đường</button>' +
      '<a href="' + gmapNavUrl + '" target="_blank" style="background: #329dd2; color: white; padding: 8px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center;">Google Maps ➜</a>' +
      '<button type="button" onclick="selectPitchAndScroll(' + field.id + ')" style="background: #080f1b; color: white; border: none; padding: 8px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Đặt sân</button>' +
      '</div></div>';

    marker.bindPopup(popupHtml, { maxWidth: 290 });
    pitchMarkers.push(marker);
  });
}

// Vẽ đường dẫn nối từ vị trí của tôi tới sân bóng
function drawRouteToPitch(fieldId) {
  const field = DEFAULT_FIELDS.find(f => f.id === fieldId);
  if (!field || !pitchLeafletMap) return;

  const myLat = userLat || 12.6806;
  const myLng = userLng || 108.0378;

  if (routeLine) {
    pitchLeafletMap.removeLayer(routeLine);
  }

  routeLine = L.polyline([[myLat, myLng], [field.lat, field.lng]], {
    color: '#eb2f33',
    weight: 4,
    opacity: 0.85,
    dashArray: '8, 8',
    lineJoin: 'round'
  }).addTo(pitchLeafletMap);

  const bounds = L.latLngBounds([[myLat, myLng], [field.lat, field.lng]]);
  pitchLeafletMap.fitBounds(bounds, { padding: [50, 50] });

  const d = calculateDistance(myLat, myLng, field.lat, field.lng);
  const resultNotice = document.getElementById("nearestPitchNotice");
  if (resultNotice) {
    const dest = encodeURIComponent(field.name + ', ' + (field.address || '') + ', Buôn Ma Thuột, Đắk Lắk');
    const navUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + myLat + ',' + myLng + '&destination=' + dest + '&travelmode=driving';
    resultNotice.innerHTML =
      '<div style="background: #080f1b; border: 1.5px solid #329dd2; color: #ffffff; padding: 14px 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 12px; box-shadow: 0 4px 16px rgba(50,157,210,0.2);">' +
      '<div>' +
      '<div style="font-size: 14px; font-weight: 800; color: #329dd2;">🧭 Lộ trình từ vị trí của bạn tới ' + field.name + '</div>' +
      '<div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">Cự ly: <strong style="color: #eb2f33; font-size: 14px;">' + d + ' km</strong> · Dự kiến di chuyển: <strong>~' + Math.ceil(d * 2.5) + ' phút</strong></div>' +
      '</div>' +
      '<div style="display: flex; gap: 8px;">' +
      '<a href="' + navUrl + '" target="_blank" class="btn-accent-red" style="padding: 8px 16px; font-size: 12px; font-weight: 800; text-decoration: none;">🚗 Mở Google Maps chỉ đường</a>' +
      '<button type="button" onclick="selectPitchAndScroll(' + field.id + ')" class="primary-button" style="padding: 8px 14px; font-size: 12px;">⚡ Đặt sân</button>' +
      '</div></div>';
  }
}

function findNearestPitch() {
  const resultNotice = document.getElementById("nearestPitchNotice");
  if (resultNotice) resultNotice.innerHTML = '<span style="color: #329dd2; font-weight: 700;">📡 Đang quét radar GPS vệ tinh...</span>';

  if (!navigator.geolocation) {
    doFindNearest(12.6806, 108.0378, true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      showUserLocationOnMap(userLat, userLng);
      doFindNearest(userLat, userLng, false);
    },
    () => {
      userLat = 12.6806;
      userLng = 108.0378;
      showUserLocationOnMap(userLat, userLng, true);
      doFindNearest(userLat, userLng, true);
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

function doFindNearest(myLat, myLng, isFallback) {
  let nearestField = DEFAULT_FIELDS[0];
  let minD = 999999;

  DEFAULT_FIELDS.forEach(f => {
    if (!f.lat || !f.lng || f.status === 'MAINTENANCE' || f.id === 22) return;
    const d = calculateDistance(myLat, myLng, f.lat, f.lng);
    if (d < minD) {
      minD = d;
      nearestField = f;
    }
  });

  drawRouteToPitch(nearestField.id);
}

function selectPitchAndScroll(fieldId) {
  if (typeof selectPitch === "function") {
    selectPitch(fieldId);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}


// ==========================================
// 5. MATCHMAKING - SÀN CÁP KÈO BÓNG ĐÁ PHỦI BAN MÊ (LƯU TRỰC TIẾP NEON CLOUD)
// ==========================================
let currentMatchmakingFilter = "ALL";
let neonMatchmakingCache = null;

async function fetchNeonMatchmaking() {
  try {
    const rows = await queryNeonDirect("SELECT * FROM matchmaking_posts ORDER BY id DESC");
    if (Array.isArray(rows) && rows.length > 0) {
      neonMatchmakingCache = rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        userFullName: r.user_name || r.team_name,
        teamName: r.team_name,
        captainName: r.user_name || r.team_name,
        phone: r.phone,
        fieldId: r.pitch_id,
        fieldName: r.pitch_name,
        fieldType: r.format || 'SAN_5',
        matchDate: r.play_date,
        timeSlot: r.play_time,
        level: r.level || 'TRUNG_BINH',
        levelLabel: r.level || 'Phong trào',
        betRule: r.bet_type || 'CHIA_DOI',
        betLabel: r.bet_type || 'Tiền sân 5-5',
        status: r.status || 'OPEN',
        matchedBy: r.challenger_name || null,
        matchedPhone: r.challenger_phone || null,
        avatar: "⚡",
        description: r.note || "Kèo giao lưu hữu nghị Ban Mê",
        createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'
      }));
      localStorage.setItem("football_matchmaking", JSON.stringify(neonMatchmakingCache));
      return neonMatchmakingCache;
    }
  } catch (e) {
    console.warn("Lỗi fetch matchmaking từ Neon:", e);
  }
  return getMatchmakingPostsLocal();
}

function getMatchmakingPostsLocal() {
  try {
    const saved = localStorage.getItem("football_matchmaking");
    return saved ? JSON.parse(saved) : DEFAULT_MATCHMAKING_POSTS;
  } catch {
    return DEFAULT_MATCHMAKING_POSTS;
  }
}

function getMatchmakingPosts() {
  return neonMatchmakingCache || getMatchmakingPostsLocal();
}

function saveMatchmakingPosts(posts) {
  neonMatchmakingCache = posts;
  localStorage.setItem("football_matchmaking", JSON.stringify(posts));
}

async function renderMatchmaking(filter = "ALL") {
  currentMatchmakingFilter = filter;
  const container = document.getElementById("matchmakingListContainer");
  if (!container) return;

  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");

  // Load from Neon if cache empty
  if (!neonMatchmakingCache) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #94a3b8; font-size: 13px;">⏳ Đang đồng bộ sàn cáp kèo từ Neon Cloud...</div>';
    await fetchNeonMatchmaking();
  }

  const allPosts = getMatchmakingPosts();
  const posts = allPosts.filter(p => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return p.status === "OPEN";
    if (filter === "MY_POSTS") return authUser && (p.userId === authUser.id || p.phone === authUser.phone);
    return p.level === filter;
  });

  // Update tabs
  const tabs = ["ALL", "MY_POSTS", "VUI_VE", "TRUNG_BINH", "BAN_CHUYEN", "OPEN"];
  tabs.forEach(t => {
    const el = document.getElementById("tabMatch_" + t);
    if (el) el.className = `quick-day-btn ${t === filter ? 'active' : ''}`;
  });

  if (posts.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8; background: #0e1626; border-radius: 14px; border: 1px dashed rgba(50, 157, 210, 0.3);">' +
      '<div style="font-size: 32px; margin-bottom: 8px;">🤝</div>' +
      '<div style="color: #ffffff; font-weight: 700; margin-bottom: 6px;">Chưa có kèo nào trong mục này</div>' +
      '<div style="font-size: 13px; color: #94a3b8; margin-bottom: 14px;">Bấm nút <strong>"➕ ĐĂNG TIN TÌM ĐỐI / CÁP KÈO"</strong> bên trên để tạo bài đăng đầu tiên của bạn!</div>' +
      '<button type="button" class="btn-accent-red" style="padding: 8px 18px; font-size: 13px; font-weight: 700; margin: 0 auto;" onclick="openCreateMatchModal()">➕ Tạo bài đăng cáp kèo ngay</button>' +
      '</div>';
    return;
  }

  container.innerHTML = posts.map(post => {
    const isOpen = post.status === "OPEN";
    const isOwner = authUser && (post.userId === authUser.id || post.phone === authUser.phone);
    const levelBg = post.level === "BAN_CHUYEN" ? "rgba(235, 47, 51, 0.2)" : post.level === "TRUNG_BINH" ? "rgba(50, 157, 210, 0.2)" : "rgba(148, 163, 184, 0.15)";
    const levelColor = post.level === "BAN_CHUYEN" ? "#ff474b" : post.level === "TRUNG_BINH" ? "#329dd2" : "#cbd5e1";

    return '<div style="background: var(--surface-alt); border: 1.5px solid ' + (isOpen ? 'rgba(50, 157, 210, 0.35)' : 'var(--border)') + '; border-radius: 16px; padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">' +
      '<div>' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">' +
      '<div style="display: flex; align-items: center; gap: 10px;">' +
      '<span style="font-size: 26px; background: #050a12; border: 1px solid var(--border); width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">' + (post.avatar || '⚽') + '</span>' +
      '<div>' +
      '<strong style="font-size: 16px; color: var(--text-main); display: block;">' + post.teamName + '</strong>' +
      '<small style="color: var(--text-muted);">Đội trưởng: ' + post.captainName + ' · ' + post.createdAt + '</small>' +
      '</div></div>' +
      '<span style="font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 800; background: ' + (isOpen ? 'rgba(50, 157, 210, 0.15)' : 'rgba(235, 47, 51, 0.15)') + '; color: ' + (isOpen ? '#329dd2' : '#eb2f33') + '; border: 1px solid ' + (isOpen ? 'rgba(50, 157, 210, 0.3)' : 'rgba(235, 47, 51, 0.3)') + ';">' +
      (isOpen ? '● ĐANG TÌM ĐỐI' : '✓ ĐÃ CÁP KÈO') +
      '</span></div>' +

      '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">' +
      '<span style="font-size: 11px; font-weight: 700; background: ' + levelBg + '; color: ' + levelColor + '; padding: 3px 8px; border-radius: 6px;">🎯 ' + post.levelLabel + '</span>' +
      '<span style="font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 3px 8px; border-radius: 6px;">💰 ' + post.betLabel + '</span>' +
      '<span style="font-size: 11px; font-weight: 700; background: rgba(255, 255, 255, 0.08); color: var(--text-main); padding: 3px 8px; border-radius: 6px;">⚽ ' + (post.fieldType === 'SAN_11' ? 'Sân 11' : post.fieldType === 'SAN_7' ? 'Sân 7' : 'Sân 5') + '</span>' +
      '</div>' +

      '<div style="font-size: 13px; color: var(--text-main); background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 12px; line-height: 1.5;">' +
      '<div>🏟️ <strong>Sân:</strong> ' + post.fieldName + '</div>' +
      '<div>📅 <strong>Thời gian:</strong> ' + post.timeSlot + ' (Ngày ' + post.matchDate + ')</div>' +
      '<div style="margin-top: 6px; color: var(--text-muted); font-style: italic;">"' + post.description + '"</div>' +
      '</div></div>' +

      '<div style="display: flex; gap: 8px; margin-top: 6px;">' +
      (isOpen
        ? '<button type="button" onclick="openAcceptMatchModal(' + post.id + ')" class="btn-accent-red" style="flex: 1; padding: 9px; font-size: 12px; font-weight: 700; justify-content: center; border-radius: 8px;">🤝 Bắt đối ngay</button>'
        : '<div style="flex: 1; text-align: center; font-size: 12px; font-weight: 700; color: #329dd2; background: rgba(50, 157, 210, 0.15); border: 1px solid rgba(50, 157, 210, 0.3); padding: 8px; border-radius: 8px;">Đã bắt với: ' + (post.matchedBy || 'Đội bạn') + '</div>'
      ) +
      '<a href="tel:' + post.phone + '" class="outline-button" style="padding: 9px 12px; font-size: 12px; display: inline-flex; align-items: center;" title="Gọi điện">📞</a>' +
      '<a href="https://zalo.me/' + post.phone + '" target="_blank" rel="noreferrer" class="outline-button" style="padding: 9px 12px; font-size: 12px; color: #329dd2; display: inline-flex; align-items: center;" title="Nhắn Zalo">💬</a>' +
      (isOwner
        ? '<button type="button" onclick="deleteMatchPost(' + post.id + ')" class="outline-button" style="padding: 9px 10px; font-size: 12px; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" title="Xóa bài đăng cáp kèo này khỏi Neon Cloud">🗑️</button>'
        : ''
      ) +
      '</div></div>';
  }).join("");
}

function openCreateMatchModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  document.getElementById("createMatchModal").style.display = "flex";
  const captainInput = document.getElementById("cmCaptainName");
  const phoneInput = document.getElementById("cmPhone");
  if (captainInput && !captainInput.value) captainInput.value = authUser.fullName || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = authUser.phone || '';

  const select = document.getElementById("cmFieldSelect");
  if (select) {
    select.innerHTML = DEFAULT_FIELDS.map(f => '<option value="' + f.id + '">' + f.name + ' (' + (f.ward || 'BMT') + ')</option>').join("");
  }
  const dateInput = document.getElementById("cmDateInput");
  if (dateInput) dateInput.value = getTodayString();
}

function closeCreateMatchModal() {
  document.getElementById("createMatchModal").style.display = "none";
}

async function submitMatchPost(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const teamName = document.getElementById("cmTeamName").value.trim();
  const captainName = document.getElementById("cmCaptainName").value.trim() || (authUser ? authUser.fullName : "Đội trưởng");
  const phone = document.getElementById("cmPhone").value.trim();
  if (!teamName || !phone || phone.length < 9) {
    alert("⚠️ Vui lòng nhập Tên đội và Số điện thoại / Zalo (tối thiểu 9 số) để đội bạn liên hệ bắt đối!");
    return;
  }
  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: captainName,
      phone: phone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }
  const teamName = document.getElementById("cmTeamName").value.trim();
  const captainName = document.getElementById("cmCaptainName").value.trim() || authUser.fullName;
  const phone = document.getElementById("cmPhone").value.trim();
  if (!phone || phone.length < 9) {
    alert("⚠️ Số điện thoại / Zalo là bắt buộc (tối thiểu 9 số) để đội bạn liên hệ bắt đối!");
    return;
  }

  const fieldId = Number(document.getElementById("cmFieldSelect").value);
  const matchDate = document.getElementById("cmDateInput").value;
  const timeSlot = document.getElementById("cmTimeSlot").value;
  const level = document.getElementById("cmLevel").value;
  const betRule = document.getElementById("cmBetRule").value;
  const description = document.getElementById("cmDesc").value.trim() || "Kèo giao lưu hữu nghị, đá đẹp, nhiệt tình.";
  const field = DEFAULT_FIELDS.find(f => f.id === fieldId) || DEFAULT_FIELDS[0];

  const levelLabels = {
    "VUI_VE": "Dưỡng sinh (Vui vẻ)",
    "TRUNG_BINH": "Trung bình (Phong trào)",
    "BAN_CHUYEN": "Khá - Chiến (Cọ xát)"
  };

  const betLabels = {
    "CHIA_DOI": "Tiền sân 5-5",
    "THUA_BAO": "Đội thua trả sân",
    "KEO_NUOC": "Kèo nước ngọt"
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Đang lưu vào Neon Cloud...";
  }

  try {
    // 1. Ghi nhận trực tiếp vào Neon Database PostgreSQL (Table matchmaking_posts)
    const sql = `INSERT INTO matchmaking_posts (user_id, user_name, team_name, phone, play_date, play_time, pitch_name, pitch_id, format, bet_type, level, note, status)
      VALUES (${authUser.id || 'NULL'}, '${escapeSqlString(captainName)}', '${escapeSqlString(teamName)}', '${escapeSqlString(phone)}', '${escapeSqlString(matchDate)}', '${escapeSqlString(timeSlot)}', '${escapeSqlString(field.name)}', ${field.id}, '${escapeSqlString(field.fieldType || 'SAN_5')}', '${escapeSqlString(betLabels[betRule] || betRule)}', '${escapeSqlString(levelLabels[level] || level)}', '${escapeSqlString(description)}', 'OPEN')
      RETURNING *`;

    const insertedRows = await queryNeonDirect(sql);
    const newPostId = insertedRows && insertedRows[0] ? insertedRows[0].id : Date.now();

    const newPost = {
      id: newPostId,
      userId: authUser.id,
      userFullName: authUser.fullName,
      teamName,
      captainName,
      phone,
      fieldId,
      fieldName: field.name,
      fieldType: field.fieldType,
      matchDate,
      timeSlot,
      level,
      levelLabel: levelLabels[level] || "Phong trào",
      betRule,
      betLabel: betLabels[betRule] || "Tiền sân 5-5",
      status: "OPEN",
      matchedBy: null,
      matchedPhone: null,
      avatar: "⚡",
      description,
      createdAt: "Vừa xong"
    };

    const posts = getMatchmakingPosts();
    posts.unshift(newPost);
    saveMatchmakingPosts(posts);

    closeCreateMatchModal();
    renderMatchmaking("ALL");
    alert("🎉 Đã đăng bài cáp kèo THÀNH CÔNG lên Sàn Cáp Kèo Sân Nhà FC!\nDữ liệu đã được lưu trữ vĩnh viễn trên Neon PostgreSQL Cloud.");
  } catch (err) {
    alert("Có lỗi khi lưu bài đăng: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 Đăng tin tìm đối ngay";
    }
  }
}

let activeMatchIdToAccept = null;

function openAcceptMatchModal(postId) {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  activeMatchIdToAccept = postId;
  const posts = getMatchmakingPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById("acceptMatchTeamTarget").textContent = post.teamName;
  document.getElementById("acceptMatchDetails").textContent = post.fieldName + ' · ' + post.timeSlot + ' ngày ' + post.matchDate + ' · Kèo: ' + post.betLabel;

  const phoneInput = document.getElementById("amMyPhone");
  if (phoneInput && authUser.phone) phoneInput.value = authUser.phone;

  document.getElementById("acceptMatchModal").style.display = "flex";
}

function closeAcceptMatchModal() {
  document.getElementById("acceptMatchModal").style.display = "none";
  activeMatchIdToAccept = null;
}

async function confirmAcceptMatch(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const myTeam = document.getElementById("amMyTeamName").value.trim();
  const myPhone = document.getElementById("amMyPhone").value.trim();

  if (!myTeam || !myPhone || myPhone.length < 9) {
    alert("⚠️ Tên đội nhận kèo và Số điện thoại (tối thiểu 9 số) là bắt buộc!");
    return;
  }

  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: myTeam,
      phone: myPhone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }
  const myTeam = document.getElementById("amMyTeamName").value.trim();
  const myPhone = document.getElementById("amMyPhone").value.trim();

  if (!myTeam || !myPhone || myPhone.length < 9) {
    alert("⚠️ Tên đội nhận kèo và Số điện thoại (tối thiểu 9 số) là bắt buộc!");
    return;
  }

  const posts = getMatchmakingPosts();
  const idx = posts.findIndex(p => p.id === activeMatchIdToAccept);
  if (idx !== -1) {
    posts[idx].status = "MATCHED";
    posts[idx].matchedBy = myTeam;
    posts[idx].matchedPhone = myPhone;
    saveMatchmakingPosts(posts);

    // Update Neon PostgreSQL
    try {
      const sql = `UPDATE matchmaking_posts 
        SET status = 'ACCEPTED', challenger_id = ${authUser ? authUser.id : 'NULL'}, challenger_name = '${escapeSqlString(myTeam)}', challenger_phone = '${escapeSqlString(myPhone)}'
        WHERE id = ${activeMatchIdToAccept}`;
      await queryNeonDirect(sql);
    } catch (e) {
      console.warn("Lỗi update match accept trên Neon:", e);
    }
  }

  closeAcceptMatchModal();
  renderMatchmaking(currentMatchmakingFilter);
  alert("🤝 Chúc mừng bạn đã bắt đối thành công với " + (posts[idx]?.teamName || 'đội bạn') + "!\nHãy gọi SĐT " + (posts[idx]?.phone || '') + " để chốt màu áo thi đấu nhé.\nDữ liệu bắt đối đã được lưu vào Neon Cloud.");
}

async function deleteMatchPost(postId) {
  if (!confirm("Bạn có chắc chắn muốn xóa bài đăng cáp kèo này khỏi Neon Database?")) return;
  try {
    await queryNeonDirect(`DELETE FROM matchmaking_posts WHERE id = ${postId}`);
  } catch (e) {
    console.warn("Lỗi xóa post trên Neon:", e);
  }
  let posts = getMatchmakingPosts();
  posts = posts.filter(p => p.id !== postId);
  saveMatchmakingPosts(posts);
  renderMatchmaking(currentMatchmakingFilter);
  alert("✓ Đã xóa bài đăng cáp kèo khỏi hệ thống Neon!");
}

// ==========================================
// 6. FC CLUBS & LEO RANK ELO & GIẢI ĐẤU
// ==========================================
let currentClubFilter = "ALL";

function getClubs() {
  try {
    const saved = localStorage.getItem("football_clubs");
    return saved ? JSON.parse(saved) : DEFAULT_CLUBS;
  } catch {
    return DEFAULT_CLUBS;
  }
}

function saveClubs(clubs) {
  localStorage.setItem("football_clubs", JSON.stringify(clubs));
}

function renderClubs(filter = "ALL") {
  currentClubFilter = filter;
  const container = document.getElementById("clubsListContainer");
  if (!container) return;

  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");

  const clubs = getClubs().filter(c => {
    if (filter === "ALL") return true;
    if (filter === "RECRUITING") return c.isRecruiting;
    return c.level === filter;
  }).sort((a, b) => b.elo - a.elo);

  if (clubs.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--surface-alt); border-radius: 14px; border: 1px dashed var(--border);">Chưa có câu lạc bộ nào trong mục này. Hãy bấm "➕ Tạo FC mới (15 người)"!</div>';
    return;
  }

  container.innerHTML = clubs.map((club, idx) => {
    const isMember = authUser && club.members.some(m => m.userId === authUser.id);
    const isCaptain = authUser && club.captainId === authUser.id;
    const memberCount = club.members.length;
    const isFull = memberCount >= MAX_CLUB_MEMBERS;
    const rankMedal = idx === 0 ? '👑 #1 ' : (idx === 1 ? '🥈 #2 ' : (idx === 2 ? '🥉 #3 ' : '#' + (idx + 1) + ' '));

    return '<div style="background: var(--surface-alt); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">' +
      '<div>' +
      '<div style="position: relative; height: 100px;">' +
      '<img src="' + club.banner + '" style="width: 100%; height: 100%; object-fit: cover;" alt="' + club.name + '" />' +
      '<div style="position: absolute; inset: 0; background: linear-gradient(transparent 30%, rgba(0,0,0,0.75));"></div>' +
      '<div style="position: absolute; bottom: 8px; left: 12px; display: flex; align-items: center; gap: 8px;">' +
      '<span style="font-size: 28px; background: rgba(8, 15, 27, 0.9); border: 1px solid var(--border); width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">' + club.avatar + '</span>' +
      '<div>' +
      '<strong style="font-size: 15px; color: #ffffff; display: block; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">' + club.name + '</strong>' +
      '<span style="font-size: 11px; color: rgba(255,255,255,0.9);">' + club.ward + '</span>' +
      '</div></div>' +
      '<div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); color: ' + getEloColor(club.elo) + '; border: 1px solid rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800;">' + rankMedal + club.rank + ' · ' + club.elo + ' ELO</div>' +
      '</div>' +

      '<div style="padding: 14px;">' +
      '<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4;">' + club.description + '</div>' +

      '<div style="margin-bottom: 10px;">' +
      '<div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 4px; color: var(--text-main);">' +
      '<span>Quân số FC: <strong>' + memberCount + '/' + MAX_CLUB_MEMBERS + '</strong></span>' +
      '<span style="color: ' + (isFull ? '#eb2f33' : '#329dd2') + ';">' + (isFull ? '🔴 Đã đủ 15 người' : '🟢 Còn trống ' + (MAX_CLUB_MEMBERS - memberCount) + ' slot') + '</span>' +
      '</div>' +
      '<div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">' +
      '<div style="height: 100%; width: ' + ((memberCount / MAX_CLUB_MEMBERS) * 100) + '%; background: ' + (isFull ? '#eb2f33' : '#329dd2') + '; border-radius: 999px;"></div>' +
      '</div></div>' +

      '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">' +
      '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(50, 157, 210, 0.15); color: #329dd2;">🏆 ' + club.wins + 'W · ' + club.draws + 'D · ' + club.losses + 'L</span>' +
      '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(245, 158, 11, 0.15); color: #f59e0b;">⚽ ' + club.goalsFor + ' BT - ' + club.goalsAgainst + ' BB</span>' +
      (club.isRecruiting ? '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(34, 197, 94, 0.15); color: #22c55e;">🟢 Đang tuyển</span>' : '') +
      '</div>' +
      '<div style="font-size: 11px; color: var(--text-main); margin-bottom: 10px;">🎖️ Đội trưởng: <strong>' + club.captainName + '</strong></div>' +
      '</div></div>' +

      '<div style="padding: 0 14px 14px; display: flex; gap: 6px; flex-wrap: wrap;">' +
      (isMember
        ? '<div style="flex: 1; text-align: center; font-size: 11px; font-weight: 700; color: #329dd2; background: rgba(50, 157, 210, 0.15); border: 1px solid rgba(50, 157, 210, 0.3); padding: 8px; border-radius: 8px;">✓ Bạn là thành viên' + (isCaptain ? ' (Đội trưởng)' : '') + '</div>'
        : (isFull
          ? '<div style="flex: 1; text-align: center; font-size: 11px; font-weight: 700; color: #eb2f33; background: rgba(235, 47, 51, 0.15); border: 1px solid rgba(235, 47, 51, 0.3); padding: 8px; border-radius: 8px;">Đã đủ 15 người</div>'
          : '<button type="button" onclick="joinClub(' + club.id + ')" class="primary-button" style="flex: 1; padding: 8px; font-size: 11px; font-weight: 700; justify-content: center;">🤝 Gia nhập</button>'
        )
      ) +
      '<button type="button" onclick="openMatchChallengeModal(' + club.id + ')" class="btn-accent-red" style="padding: 8px 12px; font-size: 11px; font-weight: 800;" title="Thách đấu tính điểm ELO">⚔️ Thách đấu</button>' +
      '<button type="button" onclick="viewClubDetail(' + club.id + ')" class="outline-button" style="padding: 8px 12px; font-size: 11px;">👁️ Chi tiết</button>' +
      '</div></div>';
  }).join("");
}

function openCreateClubModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  document.getElementById("createClubModal").style.display = "flex";
  const captainInput = document.getElementById("ccCaptainName");
  const phoneInput = document.getElementById("ccPhone");
  if (captainInput) captainInput.value = authUser.fullName || "";
  if (phoneInput) phoneInput.value = authUser.phone || "";
}

function closeCreateClubModal() {
  document.getElementById("createClubModal").style.display = "none";
}

async function submitCreateClub(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const clubName = document.getElementById("ccClubName").value.trim();
  const captainName = document.getElementById("ccCaptainName").value.trim() || (authUser ? authUser.fullName : "Đội trưởng");
  const phone = document.getElementById("ccPhone").value.trim();
  if (!clubName || !phone || phone.length < 9) {
    alert("⚠️ Tên FC và Số điện thoại Đội trưởng là bắt buộc (tối thiểu 9 số)!");
    return;
  }
  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: captainName,
      phone: phone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }

  const clubName = document.getElementById("ccClubName").value.trim();
  const shortName = document.getElementById("ccShortName").value.trim().toUpperCase();
  const captainName = document.getElementById("ccCaptainName").value.trim() || authUser.fullName;
  const phone = document.getElementById("ccPhone").value.trim();
  const ward = document.getElementById("ccWard").value;
  const level = document.getElementById("ccLevel").value;
  const description = document.getElementById("ccDesc").value.trim() || "Câu lạc bộ bóng đá phong trào Buôn Ma Thuột.";
  const avatar = document.getElementById("ccAvatar").value || "⚽";

  if (!clubName || !phone || phone.length < 9) {
    alert("⚠️ Tên FC và Số điện thoại Đội trưởng là bắt buộc (tối thiểu 9 số)!");
    return;
  }

  const clubs = getClubs();
  const newClub = {
    id: Date.now(),
    name: clubName,
    shortName: shortName || clubName.substring(0, 4).toUpperCase(),
    avatar,
    banner: "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-rong-rai_101640962.jpg",
    captainId: authUser.id,
    captainName,
    captainPhone: phone,
    description,
    ward,
    fieldPreference: "Sân bóng đá C1",
    level,
    elo: 1000,
    rank: getEloRank(1000),
    wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0,
    members: [
      { userId: authUser.id, name: captainName, phone, role: "CAPTAIN", number: 10, joinedAt: getTodayString() }
    ],
    createdAt: getTodayString(),
    isRecruiting: true
  };

  clubs.unshift(newClub);
  saveClubs(clubs);
  closeCreateClubModal();
  renderClubs();
  alert("🎉 FC " + clubName + " đã được thành lập thành công!\n🎖️ Bạn là Đội trưởng. ELO khởi điểm: 1000 (🥉 ĐỒNG)\n📢 Bạn có thể mời thêm tối đa 14 thành viên nữa cho đủ 15 người.");
}

function joinClub(clubId) {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập tài khoản để xin gia nhập FC!");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }

  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  if (club.members.length >= MAX_CLUB_MEMBERS) {
    alert("⚠️ FC " + club.name + " đã đủ " + MAX_CLUB_MEMBERS + " thành viên!");
    return;
  }

  const existingClub = clubs.find(c => c.members.some(m => m.userId === authUser.id));
  if (existingClub) {
    alert("⚠️ Bạn đã là thành viên của FC " + existingClub.name + "!\nMỗi tài khoản chỉ được tham gia 1 câu lạc bộ.");
    return;
  }

  club.members.push({
    userId: authUser.id,
    name: authUser.fullName,
    phone: authUser.phone || "",
    role: "MEMBER",
    number: club.members.length + 1,
    joinedAt: getTodayString()
  });

  saveClubs(clubs);
  renderClubs();
  alert("🎉 Chúc mừng bạn đã gia nhập FC " + club.name + " thành công!\n📞 Hãy gọi cho Đội trưởng " + club.captainName + " để nhận áo đấu nhé.");
}

function viewClubDetail(clubId) {
  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const isCaptain = authUser && club.captainId === authUser.id;

  const membersHtml = club.members.map((m, i) => {
    const roleBadge = m.role === "CAPTAIN"
      ? '<span style="background: #eb2f33; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">🎖️ ĐỘI TRƯỞNG</span>'
      : (m.role === "CO_CAPTAIN"
        ? '<span style="background: #329dd2; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">⭐ ĐỘI PHÓ</span>'
        : '<span style="background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px;">CẦU THỦ</span>');

    return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: ' + (i % 2 === 0 ? '#f8fafc' : '#ffffff') + '; border-radius: 8px; font-size: 12px; border: 1px solid #eef3f7;">' +
      '<div style="display: flex; align-items: center; gap: 10px;">' +
      '<span style="background: #080f1b; color: #329dd2; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">#' + (m.number || (i + 1)) + '</span>' +
      '<div>' +
      '<strong style="color: #080f1b; font-size: 13px;">' + m.name + '</strong> ' + roleBadge +
      '</div></div>' +
      '<div style="display: flex; align-items: center; gap: 8px;">' +
      '<span style="font-family: monospace; color: #329dd2; font-weight: 600;">📞 ' + m.phone + '</span>' +
      '<a href="tel:' + m.phone + '" class="outline-button" style="padding: 4px 8px; font-size: 11px;">Gọi</a>' +
      '</div></div>';
  }).join("");

  const modalHtml =
    '<div id="clubDetailModal" class="modal-backdrop" style="display: flex;">' +
    '<div class="modal-card" style="max-width: 580px; max-height: 90vh; overflow-y: auto;">' +
    '<div class="modal-header">' +
    '<div>' +
    '<h3 style="margin: 0; font-size: 18px; color: #080f1b;">🏟️ Chi Tiết Câu Lạc Bộ</h3>' +
    '<p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Danh sách 15 thành viên &amp; Điểm số Leo Rank</p>' +
    '</div>' +
    '<button type="button" class="modal-close" onclick="document.getElementById(\'clubDetailModal\').remove()">✕</button>' +
    '</div>' +

    '<div style="padding: 20px;">' +
    '<div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">' +
    '<span style="font-size: 44px; background: #080f1b; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid #329dd2;">' + club.avatar + '</span>' +
    '<div>' +
    '<h3 style="margin: 0; font-size: 20px; color: #080f1b;">' + club.name + '</h3>' +
    '<div style="font-size: 12px; color: #64748b; margin-top: 2px;">📍 ' + club.ward + ' · 🏟️ Sân nhà: ' + club.fieldPreference + '</div>' +
    '<div style="margin-top: 4px; font-size: 13px; font-weight: 800; color: ' + getEloColor(club.elo) + ';">' + club.rank + ' · ' + club.elo + ' ELO</div>' +
    '</div></div>' +

    '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">' +
    '<div style="background: rgba(50,157,210,0.12); border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #176b94;">' + club.wins + '</div><div style="font-size: 10px; color: #64748b;">Trận Thắng</div></div>' +
    '<div style="background: #fefce8; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #ca8a04;">' + club.draws + '</div><div style="font-size: 10px; color: #64748b;">Trận Hòa</div></div>' +
    '<div style="background: rgba(235,47,51,0.12); border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #eb2f33;">' + club.losses + '</div><div style="font-size: 10px; color: #64748b;">Trận Thua</div></div>' +
    '<div style="background: #eff6ff; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #2563eb;">' + club.goalsFor + '</div><div style="font-size: 10px; color: #64748b;">Bàn Thắng</div></div>' +
    '</div>' +

    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
    '<div style="font-size: 13px; font-weight: 800; color: #080f1b;">📋 Danh sách thành viên (' + club.members.length + '/' + MAX_CLUB_MEMBERS + '):</div>' +
    (isCaptain && club.members.length < MAX_CLUB_MEMBERS
      ? '<button type="button" onclick="openAddMemberModal(' + club.id + ')" class="primary-button" style="padding: 4px 10px; font-size: 11px;">➕ Thêm thành viên</button>'
      : ''
    ) +
    '</div>' +
    '<div style="display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto;">' + membersHtml + '</div>' +

    '<div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; gap: 8px;">' +
    '<button type="button" onclick="registerClubForTournament(' + club.id + ')" class="btn-accent-red" style="flex: 1; padding: 10px; font-size: 12px; font-weight: 800;">🏆 Đăng ký tham gia Cúp Tứ Hùng</button>' +
    '<button type="button" class="outline-button" style="padding: 10px 18px;" onclick="document.getElementById(\'clubDetailModal\').remove()">Đóng</button>' +
    '</div></div></div></div>';

  const old = document.getElementById("clubDetailModal");
  if (old) old.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Thêm thành viên vào FC (cho Đội trưởng)
function openAddMemberModal(clubId) {
  const name = prompt("Nhập họ và tên thành viên mới:");
  if (!name || !name.trim()) return;
  const phone = prompt("Nhập số điện thoại của thành viên (bắt buộc):");
  if (!phone || phone.trim().length < 9) {
    alert("⚠️ Số điện thoại không hợp lệ!");
    return;
  }
  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;
  if (club.members.length >= MAX_CLUB_MEMBERS) {
    alert("⚠️ FC đã đủ 15 người!");
    return;
  }
  club.members.push({
    userId: Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    role: "MEMBER",
    number: club.members.length + 1,
    joinedAt: getTodayString()
  });
  saveClubs(clubs);
  const old = document.getElementById("clubDetailModal");
  if (old) old.remove();
  viewClubDetail(clubId);
  renderClubs();
  alert("🎉 Đã thêm " + name + " vào danh sách 15 người của FC!");
}

// Thách đấu Leo Rank ELO giữa 2 FC
function openMatchChallengeModal(targetClubId) {
  const clubs = getClubs();
  const targetClub = clubs.find(c => c.id === targetClubId);
  if (!targetClub) return;

  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const myClub = authUser ? clubs.find(c => c.members.some(m => m.userId === authUser.id)) : clubs[0];

  const clubsOption = clubs.map(c => '<option value="' + c.id + '" ' + (myClub && myClub.id === c.id ? 'selected' : '') + '>' + c.name + ' (' + c.rank + ' · ' + c.elo + ' ELO)</option>').join("");
  const targetOption = clubs.map(c => '<option value="' + c.id + '" ' + (targetClub.id === c.id ? 'selected' : '') + '>' + c.name + ' (' + c.rank + ' · ' + c.elo + ' ELO)</option>').join("");

  const modalHtml =
    '<div id="challengeModal" class="modal-backdrop" style="display: flex;">' +
    '<div class="modal-card" style="max-width: 480px;">' +
    '<div class="modal-header">' +
    '<div>' +
    '<h3 style="margin: 0; font-size: 18px; color: #080f1b;">⚔️ Thách Đấu &amp; Ghi Nhận Trận Đấu Leo Rank</h3>' +
    '<p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Cộng trừ điểm ELO cập nhật Bảng Xếp Hạng Ban Mê</p>' +
    '</div>' +
    '<button type="button" class="modal-close" onclick="document.getElementById(\'challengeModal\').remove()">✕</button>' +
    '</div>' +

    '<form onsubmit="submitMatchChallengeResult(event)" style="padding: 20px; display: flex; flex-direction: column; gap: 14px;">' +
    '<div class="form-group" style="margin-bottom: 0;">' +
    '<label style="font-weight: 700; font-size: 13px;">Đội 1 (Đội của bạn):</label>' +
    '<select id="chalClub1" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px;">' + clubsOption + '</select>' +
    '</div>' +

    '<div class="form-group" style="margin-bottom: 0;">' +
    '<label style="font-weight: 700; font-size: 13px;">Đội 2 (Đội đối thủ):</label>' +
    '<select id="chalClub2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px;">' + targetOption + '</select>' +
    '</div>' +

    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
    '<div class="form-group" style="margin-bottom: 0;">' +
    '<label style="font-weight: 700; font-size: 13px;">Số bàn thắng Đội 1: *</label>' +
    '<input type="number" id="chalScore1" min="0" max="99" required value="3" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; font-weight: 800; text-align: center;">' +
    '</div>' +
    '<div class="form-group" style="margin-bottom: 0;">' +
    '<label style="font-weight: 700; font-size: 13px;">Số bàn thắng Đội 2: *</label>' +
    '<input type="number" id="chalScore2" min="0" max="99" required value="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; font-weight: 800; text-align: center;">' +
    '</div></div>' +

    '<div style="background: #080f1b; border: 1px solid #1e3355; border-radius: 10px; padding: 12px; font-size: 12px; color: #cbd5e1;">' +
    '<strong style="color: #329dd2;">📊 Quy tắc tính điểm ELO Leo Rank:</strong>' +
    '<div style="margin-top: 4px;">• Thắng trận: <strong style="color: #329dd2;">+25 ELO</strong> · Thua trận: <strong style="color: #eb2f33;">-15 ELO</strong> · Hòa: <strong>+5 ELO</strong></div>' +
    '</div>' +

    '<div style="display: flex; gap: 10px; margin-top: 6px;">' +
    '<button type="submit" class="btn-accent-red" style="flex: 1; padding: 11px; font-weight: 800;">⚡ Xác nhận kết quả &amp; Cập nhật ELO</button>' +
    '<button type="button" class="outline-button" style="padding: 11px 18px;" onclick="document.getElementById(\'challengeModal\').remove()">Hủy</button>' +
    '</div></form></div></div>';

  const old = document.getElementById("challengeModal");
  if (old) old.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function submitMatchChallengeResult(e) {
  e.preventDefault();
  const id1 = Number(document.getElementById("chalClub1").value);
  const id2 = Number(document.getElementById("chalClub2").value);
  const s1 = Number(document.getElementById("chalScore1").value);
  const s2 = Number(document.getElementById("chalScore2").value);

  if (id1 === id2) {
    alert("⚠️ Vui lòng chọn 2 câu lạc bộ khác nhau để thi đấu!");
    return;
  }

  const clubs = getClubs();
  const c1 = clubs.find(c => c.id === id1);
  const c2 = clubs.find(c => c.id === id2);
  if (!c1 || !c2) return;

  c1.goalsFor += s1;
  c1.goalsAgainst += s2;
  c2.goalsFor += s2;
  c2.goalsAgainst += s1;

  let msg = "";
  if (s1 > s2) {
    c1.wins += 1;
    c1.elo += 25;
    c2.losses += 1;
    c2.elo = Math.max(0, c2.elo - 15);
    msg = "🏆 " + c1.name + " giành chiến thắng (" + s1 + " - " + s2 + ")!\n" + c1.name + ": +25 ELO (" + c1.elo + " ELO)\n" + c2.name + ": -15 ELO (" + c2.elo + " ELO)";
  } else if (s2 > s1) {
    c2.wins += 1;
    c2.elo += 25;
    c1.losses += 1;
    c1.elo = Math.max(0, c1.elo - 15);
    msg = "🏆 " + c2.name + " giành chiến thắng (" + s2 + " - " + s1 + ")!\n" + c2.name + ": +25 ELO (" + c2.elo + " ELO)\n" + c1.name + ": -15 ELO (" + c1.elo + " ELO)";
  } else {
    c1.draws += 1;
    c1.elo += 5;
    c2.draws += 1;
    c2.elo += 5;
    msg = "🤝 Hai đội hòa nhau (" + s1 + " - " + s2 + ")!\nMỗi đội được cộng +5 ELO.";
  }

  c1.rank = getEloRank(c1.elo);
  c2.rank = getEloRank(c2.elo);

  saveClubs(clubs);
  const modal = document.getElementById("challengeModal");
  if (modal) modal.remove();
  renderClubs();
  alert("🎉 ĐÃ CẬP NHẬT KẾT QUẢ THÀNH CÔNG!\n" + msg);
}

function registerClubForTournament(clubId) {
  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;
  alert("🏆 FC " + club.name + " đã được Ban tổ chức ghi nhận đăng ký tham gia CÚP TỨ HÙNG BAN MÊ 2026!\nBan tổ chức sẽ liên hệ SĐT " + (club.captainPhone || 'Đội trưởng') + " để xếp lịch bốc thăm.");
}

// ==========================================
// 7. TOURNAMENT HUB (GIẢI ĐẤU MINI & BẢNG XẾP HẠNG)
// ==========================================
let currentTournamentTab = "BRACKET";

function getTournamentData() {
  try {
    const saved = localStorage.getItem("football_tournaments");
    return saved ? JSON.parse(saved) : DEFAULT_TOURNAMENT_DATA;
  } catch {
    return DEFAULT_TOURNAMENT_DATA;
  }
}

function switchTournamentTab(tab) {
  currentTournamentTab = tab;
  document.getElementById("tabTourBracket").className = `quick-day-btn ${tab === 'BRACKET' ? 'active' : ''}`;
  document.getElementById("tabTourStandings").className = `quick-day-btn ${tab === 'STANDINGS' ? 'active' : ''}`;
  renderTournament();
}

function renderTournament() {
  const data = getTournamentData();
  const bracketView = document.getElementById("tourBracketView");
  const standingsView = document.getElementById("tourStandingsView");

  if (!bracketView || !standingsView) return;

  if (currentTournamentTab === "BRACKET") {
    bracketView.style.display = "block";
    standingsView.style.display = "none";
    renderTournamentBracket(data);
  } else {
    bracketView.style.display = "none";
    standingsView.style.display = "block";
    renderTournamentStandings(data);
  }
}

function renderTournamentBracket(data) {
  const container = document.getElementById("tourBracketContainer");
  if (!container) return;

  container.innerHTML = data.bracketMatches.map(m => {
    const isFinished = m.status === "FINISHED";
    const t1Win = isFinished && m.team1.score > m.team2.score;
    const t2Win = isFinished && m.team2.score > m.team1.score;

    return '<div style="background: var(--surface-alt); border: 1.5px solid var(--border); border-radius: 14px; padding: 18px; box-shadow: var(--shadow-sm); position: relative;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">' +
      '<span style="font-size: 12px; font-weight: 800; color: #329dd2; letter-spacing: 0.5px;">' + m.round + '</span>' +
      '<span style="font-size: 11px; color: var(--text-muted);">' + m.time + '</span>' +
      '</div>' +

      '<div style="display: flex; flex-direction: column; gap: 8px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; background: ' + (t1Win ? 'rgba(50, 157, 210, 0.2)' : 'rgba(0,0,0,0.25)') + '; border: 1px solid ' + (t1Win ? 'rgba(50, 157, 210, 0.4)' : 'var(--border)') + '; font-weight: ' + (t1Win ? '800' : '600') + '; color: ' + (t1Win ? '#329dd2' : 'var(--text-main)') + ';">' +
      '<span style="display: flex; align-items: center; gap: 8px;"><span>' + (t1Win ? '👑' : '⚪') + '</span> ' + m.team1.name + '</span>' +
      '<span style="font-size: 16px; font-weight: 800;">' + (m.team1.score !== null ? m.team1.score : '-') + '</span>' +
      '</div>' +

      '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; background: ' + (t2Win ? 'rgba(50, 157, 210, 0.2)' : 'rgba(0,0,0,0.25)') + '; border: 1px solid ' + (t2Win ? 'rgba(50, 157, 210, 0.4)' : 'var(--border)') + '; font-weight: ' + (t2Win ? '800' : '600') + '; color: ' + (t2Win ? '#329dd2' : 'var(--text-main)') + ';">' +
      '<span style="display: flex; align-items: center; gap: 8px;"><span>' + (t2Win ? '👑' : '⚪') + '</span> ' + m.team2.name + '</span>' +
      '<span style="font-size: 16px; font-weight: 800;">' + (m.team2.score !== null ? m.team2.score : '-') + '</span>' +
      '</div></div>' +

      (m.winner
        ? '<div style="margin-top: 10px; font-size: 11px; text-align: center; color: #329dd2; font-weight: 700; background: rgba(50, 157, 210, 0.15); border: 1px solid rgba(50, 157, 210, 0.3); padding: 4px; borderRadius: 6px;">Đội chiến thắng: ' + m.winner + '</div>'
        : ''
      ) +
      '</div>';
  }).join("");
}

function renderTournamentStandings(data) {
  const tbody = document.getElementById("tourStandingsTableBody");
  if (!tbody) return;

  tbody.innerHTML = data.standings.map(s => {
    const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank;
    return '<tr style="border-bottom: 1px solid var(--border); text-align: center;">' +
      '<td style="padding: 12px 8px; font-weight: 800; font-size: 14px;">' + medal + '</td>' +
      '<td style="padding: 12px 8px; text-align: left; font-weight: 700; color: var(--text-main);">' + s.team + '</td>' +
      '<td style="padding: 12px 8px; color: var(--text-muted);">' + s.played + '</td>' +
      '<td style="padding: 12px 8px; color: #329dd2; font-weight: 700;">' + s.won + '</td>' +
      '<td style="padding: 12px 8px; color: var(--text-muted);">' + s.drawn + '</td>' +
      '<td style="padding: 12px 8px; color: #eb2f33;">' + s.lost + '</td>' +
      '<td style="padding: 12px 8px; color: var(--text-muted);">' + s.gf + '</td>' +
      '<td style="padding: 12px 8px; color: var(--text-muted);">' + s.ga + '</td>' +
      '<td style="padding: 12px 8px; font-weight: 700; color: var(--text-main);">' + s.gd + '</td>' +
      '<td style="padding: 12px 8px; font-weight: 900; color: #329dd2; font-size: 15px; background: rgba(50, 157, 210, 0.15);">' + s.points + '</td>' +
      '</tr>';
  }).join("");
}

// ==========================================
// 8. STORAGE INITIALIZATION & WINDOW EXPORT
// ==========================================
function initStorage() {
  if (!localStorage.getItem("football_fields")) {
    localStorage.setItem("football_fields", JSON.stringify(DEFAULT_FIELDS));
  }
  if (!localStorage.getItem("football_clubs")) {
    localStorage.setItem("football_clubs", JSON.stringify(DEFAULT_CLUBS));
  }
  if (!localStorage.getItem("football_matchmaking")) {
    localStorage.setItem("football_matchmaking", JSON.stringify(DEFAULT_MATCHMAKING_POSTS));
  }
  if (!localStorage.getItem("football_tournaments")) {
    localStorage.setItem("football_tournaments", JSON.stringify(DEFAULT_TOURNAMENT_DATA));
  }
  if (!localStorage.getItem("my-bookings")) {
    localStorage.setItem("my-bookings", JSON.stringify([
      {
        bookingCode: "SAN-BK789",
        fieldName: "Sân 5A (Cỏ FIFA Pro)",
        timeLabel: "18:00 - 19:30",
        date: getTodayString(),
        customerName: "Nguyễn Văn Khách",
        customerPhone: "0901234567",
        totalPrice: 375000,
        status: "CONFIRMED",
        createdAt: new Date().toISOString()
      }
    ]));
  }
  if (!localStorage.getItem("football_users")) {
    localStorage.setItem("football_users", JSON.stringify([
      { id: 1, fullName: "Quản trị viên hệ thống", phone: "0999999999", email: "admin@example.com", role: "ADMIN", createdAt: new Date().toISOString(), bookingsCount: 0 },
      { id: 2, fullName: "Nhân viên trực sân", phone: "0988888888", email: "staff@example.com", role: "STAFF", createdAt: new Date().toISOString(), bookingsCount: 0 },
      { id: 3, fullName: "Nguyễn Văn Khách", phone: "0901234567", email: "customer@example.com", role: "CUSTOMER", createdAt: new Date().toISOString(), bookingsCount: 1 }
    ]));
  }
}

initStorage();

if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
  window.DEFAULT_FIELDS = DEFAULT_FIELDS;
  window.DEFAULT_TIME_SLOTS = DEFAULT_TIME_SLOTS;
  window.DEFAULT_CLUBS = DEFAULT_CLUBS;
  window.DEFAULT_MATCHMAKING_POSTS = DEFAULT_MATCHMAKING_POSTS;
  window.DEFAULT_TOURNAMENT_DATA = DEFAULT_TOURNAMENT_DATA;
  window.formatMoney = formatMoney;
  window.getTodayString = getTodayString;
  window.getFieldSubPitches = getFieldSubPitches;
  window.getClubs = getClubs;
  window.saveClubs = saveClubs;
  window.renderClubs = renderClubs;
  window.joinClub = joinClub;
  window.viewClubDetail = viewClubDetail;
  window.openAddMemberModal = openAddMemberModal;
  window.openCreateClubModal = openCreateClubModal;
  window.closeCreateClubModal = closeCreateClubModal;
  window.submitCreateClub = submitCreateClub;
  window.openMatchChallengeModal = openMatchChallengeModal;
  window.submitMatchChallengeResult = submitMatchChallengeResult;
  window.registerClubForTournament = registerClubForTournament;
  window.initPitchMap = initPitchMap;
  window.renderPitchMarkers = renderPitchMarkers;
  window.findNearestPitch = findNearestPitch;
  window.drawRouteToPitch = drawRouteToPitch;
  window.selectPitchAndScroll = selectPitchAndScroll;
  window.renderMatchmaking = renderMatchmaking;
  window.openCreateMatchModal = openCreateMatchModal;
  window.closeCreateMatchModal = closeCreateMatchModal;
  window.submitMatchPost = submitMatchPost;
  window.deleteMatchPost = deleteMatchPost;
  window.openAcceptMatchModal = openAcceptMatchModal;
  window.closeAcceptMatchModal = closeAcceptMatchModal;
  window.confirmAcceptMatch = confirmAcceptMatch;
  window.switchTournamentTab = switchTournamentTab;
  window.renderTournament = renderTournament;
  window.renderTournamentBracket = renderTournamentBracket;
  window.renderTournamentStandings = renderTournamentStandings;
  window.showUserLocationOnMap = showUserLocationOnMap;
  window.MAX_CLUB_MEMBERS = MAX_CLUB_MEMBERS;
}
