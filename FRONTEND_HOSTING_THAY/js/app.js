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
    teamName: "FC Ban Mê Trẻ",
    captainName: "Lê Duy Tài",
    phone: "0896890399",
    fieldId: 6,
    fieldName: "Sân bóng đá C1",
    fieldType: "SAN_5",
    matchDate: getTodayString(),
    timeSlot: "18:00 - 19:30",
    level: "TRUNG_BINH",
    levelLabel: "Trung bình (Phong trào)",
    betRule: "CHIA_DOI",
    betLabel: "Tiền sân 5-5",
    status: "OPEN",
    matchedBy: null,
    avatar: "⚡",
    description: "Đội sinh viên đá lành tính, phối hợp ban bật, không chơi xấu, giao lưu vui vẻ nâng cao sức khỏe.",
    createdAt: "Vừa xong"
  },
  {
    id: 2,
    teamName: "FC Ea Tam 47",
    captainName: "Quang Thịnh",
    phone: "0905123456",
    fieldId: 11,
    fieldName: "Sân vận động ĐTL (Hà Huy Tập)",
    fieldType: "SAN_7",
    matchDate: getTodayString(1),
    timeSlot: "19:30 - 21:00",
    level: "BAN_CHUYEN",
    levelLabel: "Khá - Chiến (Cọ xát)",
    betRule: "THUA_BAO",
    betLabel: "Đội thua trả sân",
    status: "OPEN",
    matchedBy: null,
    avatar: "🔥",
    description: "Đội cọ xát chuẩn bị tham gia giải sân 7 Đắk Lắk, tìm đối đá nhiệt tình, fair-play.",
    createdAt: "15 phút trước"
  },
  {
    id: 3,
    teamName: "FC Lão Tướng BMT",
    captainName: "Anh Hoàng",
    phone: "0913456789",
    fieldId: 12,
    fieldName: "Sân bóng đá Tân Thái Long",
    fieldType: "SAN_5",
    matchDate: getTodayString(1),
    timeSlot: "16:30 - 18:00",
    level: "VUI_VE",
    levelLabel: "Dưỡng sinh (Vui vẻ)",
    betRule: "KEO_NUOC",
    betLabel: "Kèo nước ngọt",
    status: "MATCHED",
    matchedBy: "FC Tân Lợi United",
    avatar: "☕",
    description: "Anh em văn phòng U35+ đá dưỡng sinh rèn luyện thể lực, không va chạm mạnh.",
    createdAt: "1 giờ trước"
  },
  {
    id: 4,
    teamName: "FC CNTT Đắk Lắk",
    captainName: "Hoàng Nam",
    phone: "0912345678",
    fieldId: 17,
    fieldName: "SVĐ Trường ĐH Tây Nguyên",
    fieldType: "SAN_11",
    matchDate: getTodayString(2),
    timeSlot: "15:00 - 17:00",
    level: "TRUNG_BINH",
    levelLabel: "Trung bình (SV ĐH Tây Nguyên)",
    betRule: "CHIA_DOI",
    betLabel: "Tiền sân 5-5",
    status: "OPEN",
    matchedBy: null,
    avatar: "💻",
    description: "Kèo sân lớn 11 người giao hữu bóng đá sinh viên và cựu sinh viên, thiếu 1 đối cùng chia sẻ đam mê.",
    createdAt: "2 giờ trước"
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
// 3. LEAFLET MAP LOGIC
// ==========================================
let pitchLeafletMap = null;
let pitchMarkers = [];

let userLocationMarker = null;
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

  // Tự động lấy vị trí người dùng khi mở bản đồ
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        showUserLocationOnMap(userLat, userLng);
      },
      () => {
        // Nếu từ chối GPS -> dùng vị trí trung tâm BMT
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

  // Xóa marker cũ nếu có
  if (userLocationMarker) {
    pitchLeafletMap.removeLayer(userLocationMarker);
  }

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background: #2563eb; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(37,99,235,0.6); animation: pulse 2s infinite; cursor: pointer;">📍</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -38]
  });

  userLocationMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(pitchLeafletMap);
  userLocationMarker.bindPopup(
    '<div style="font-family: inherit; padding: 4px; min-width: 180px;">' +
    '<strong style="font-size: 14px; color: #2563eb; display: block; margin-bottom: 4px;">📍 Vị trí của bạn</strong>' +
    '<div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">' + (isDefault ? 'Vị trí mặc định: Trung tâm BMT' : 'GPS định vị thực tế') + '</div>' +
    '<div style="font-size: 11px; color: #334155; font-family: monospace;">' + lat.toFixed(5) + ', ' + lng.toFixed(5) + '</div>' +
    '</div>'
  );

  // Thêm vòng tròn vùng phủ sóng
  L.circle([lat, lng], {
    color: '#2563eb',
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    radius: 500,
    weight: 1
  }).addTo(pitchLeafletMap);

  // Cập nhật popup mỗi marker sân bóng thêm khoảng cách thực tế
  updatePitchDistances(lat, lng);
}

function updatePitchDistances(uLat, uLng) {
  if (!pitchLeafletMap) return;
  // Re-render pitch markers để hiển thị khoảng cách
  renderPitchMarkers(document.getElementById('mapFilterType')?.value || 'ALL');
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

  // Sắp xếp theo khoảng cách gần nhất nếu có vị trí user
  if (userLat && userLng) {
    fields.forEach(f => {
      f._distance = calculateDistance(userLat, userLng, f.lat || 12.6865, f.lng || 108.0450);
    });
    fields.sort((a, b) => (a._distance || 999) - (b._distance || 999));
  }

  fields.forEach(field => {
    if (!field.lat || !field.lng) return;

    const distText = (userLat && userLng) ? calculateDistance(userLat, userLng, field.lat, field.lng) + ' km' : '';

    const customIcon = L.divIcon({
      className: 'pitch-map-marker',
      html: '<div style="background: #329dd2; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); font-weight: bold; cursor: pointer;">⚽</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -34]
    });

    const marker = L.marker([field.lat, field.lng], { icon: customIcon }).addTo(pitchLeafletMap);

    // Link chỉ đường Google Maps chuẩn: nếu có vị trí user thì dùng origin, không thì chỉ destination
    const gmapOrigin = (userLat && userLng) ? '&origin=' + userLat + ',' + userLng : '';
    const gmapLink = 'https://www.google.com/maps/dir/?api=1' + gmapOrigin + '&destination=' + field.lat + ',' + field.lng + '&travelmode=driving';
    const gmapViewLink = 'https://www.google.com/maps/search/?api=1&query=' + field.lat + ',' + field.lng;

    const subs = (typeof getFieldSubPitches === "function") ? getFieldSubPitches(field) : [];
    const subTypes = [...new Set(subs.map(s => s.category === 'SAN_5' ? 'Sân 5' : s.category === 'SAN_7' ? 'Sân 7' : 'Sân 11'))].join(' · ');

    const popupHtml =
      '<div style="font-family: inherit; width: 260px; padding: 2px;">' +
      '<img src="' + field.imageUrl + '" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" alt="' + field.name + '" />' +
      '<strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 4px;">' + field.name + '</strong>' +
      (distText ? '<div style="font-size: 11px; color: #2563eb; font-weight: 800; margin-bottom: 4px;">📏 Cách bạn: ' + distText + '</div>' : '') +
      '<div style="font-size: 11px; color: #166534; font-weight: 700; margin-bottom: 4px;">📍 ' + field.ward + ' · ' + (field.address || '') + '</div>' +
      '<div style="font-size: 11px; color: #475569; margin-bottom: 4px;">📞 ' + (field.phone || '0896890399') + (subTypes ? ' · ' + subTypes : '') + '</div>' +
      '<div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4;">' + field.description + '</div>' +
      '<div style="display: flex; gap: 5px; flex-wrap: wrap;">' +
      '<button type="button" onclick="selectPitchAndScroll(' + field.id + ')" style="flex: 1; background: #329dd2; color: white; border: none; padding: 7px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">⚡ Đặt sân</button>' +
      '<a href="' + gmapLink + '" target="_blank" style="background: #0284c7; color: white; padding: 7px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center;">🧭 Chỉ đường</a>' +
      '<a href="' + gmapViewLink + '" target="_blank" style="background: #7c3aed; color: white; padding: 7px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center;">📌 GG Map</a>' +
      '</div>' +
      '</div>';

    marker.bindPopup(popupHtml, { maxWidth: 280 });
    pitchMarkers.push(marker);
  });
}

function selectPitchAndScroll(fieldId) {
  if (typeof selectPitch === "function") {
    selectPitch(fieldId);
  }
}

// Tính khoảng cách Haversine giữa 2 tọa độ (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

function findNearestPitch() {
  const resultNotice = document.getElementById("nearestPitchNotice");
  if (!navigator.geolocation) {
    if (resultNotice) resultNotice.innerHTML = '<span style="color: #dc2626;">Trình duyệt không hỗ trợ định vị GPS.</span>';
    return;
  }
  if (resultNotice) resultNotice.innerHTML = '<span style="color: #64748b;">Đang định vị vị trí hiện tại của bạn...</span>';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const uLat = pos.coords.latitude;
      const uLng = pos.coords.longitude;

      let nearestField = null;
      let minDistance = 999999;

      DEFAULT_FIELDS.forEach(f => {
        if (!f.lat || !f.lng || f.status === 'MAINTENANCE' || f.id === 22) return;
        const d = calculateDistance(uLat, uLng, f.lat, f.lng);
        if (d < minDistance) {
          minDistance = d;
          nearestField = f;
        }
      });

      if (nearestField && pitchLeafletMap) {
        pitchLeafletMap.setView([nearestField.lat, nearestField.lng], 15);
        const marker = pitchMarkers.find(m => m.getLatLng().lat === nearestField.lat);
        if (marker) marker.openPopup();

        if (resultNotice) {
          resultNotice.innerHTML = `<div style="background: rgba(50, 157, 210, 0.12); border: 1px solid #86efac; color: #166534; padding: 10px 14px; border-radius: 8px; font-weight: 700;">📍 Sân gần bạn nhất: <strong>${nearestField.name}</strong> (Cách khoảng <strong>${minDistance} km</strong>) · ${nearestField.address}</div>`;
        }
      }
    },
    (err) => {
      // Nếu từ chối GPS, lấy vị trí trung tâm Buôn Ma Thuột mặc định
      const uLat = 12.6865;
      const uLng = 108.0450;
      let nearestField = DEFAULT_FIELDS[0];
      if (nearestField && pitchLeafletMap) {
        pitchLeafletMap.setView([nearestField.lat, nearestField.lng], 15);
      }
      if (resultNotice) {
        resultNotice.innerHTML = `<span style="color: #ea580c;">Không truy cập được GPS: Đã chuyển đến sân trung tâm Buôn Ma Thuột (${nearestField.name}).</span>`;
      }
    },
    { timeout: 8000 }
  );
}

// ==========================================
// 4. MATCHMAKING ACTIONS
// ==========================================
let currentMatchmakingFilter = "ALL";

function getMatchmakingPosts() {
  try {
    const saved = localStorage.getItem("football_matchmaking");
    return saved ? JSON.parse(saved) : DEFAULT_MATCHMAKING_POSTS;
  } catch {
    return DEFAULT_MATCHMAKING_POSTS;
  }
}

function renderMatchmaking(filter = "ALL") {
  currentMatchmakingFilter = filter;
  const container = document.getElementById("matchmakingListContainer");
  if (!container) return;

  const posts = getMatchmakingPosts().filter(p => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return p.status === "OPEN";
    return p.level === filter;
  });

  const tabs = ["ALL", "VUI_VE", "TRUNG_BINH", "BAN_CHUYEN", "OPEN"];
  tabs.forEach(t => {
    const el = document.getElementById("tabMatch_" + t);
    if (el) el.className = `quick-day-btn ${t === filter ? 'active' : ''}`;
  });

  if (posts.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; background: #f8fafc; border-radius: 14px;">Chưa có kèo đấu nào trong mục này. Hãy bấm nút "➕ Đăng tin tìm đối" để mở kèo đầu tiên!</div>';
    return;
  }

  container.innerHTML = posts.map(post => {
    const isOpen = post.status === "OPEN";
    const levelBg = post.level === "BAN_CHUYEN" ? "#fef2f2" : post.level === "TRUNG_BINH" ? "#f0fdf4" : "#eff6ff";
    const levelColor = post.level === "BAN_CHUYEN" ? "#b91c1c" : post.level === "TRUNG_BINH" ? "#166534" : "#1d4ed8";

    return `
      <div style="background: #ffffff; border: 1.5px solid ${isOpen ? '#cbd5e1' : '#e2e8f0'}; border-radius: 16px; padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; position: relative; transition: all 0.25s ease;" onmouseover="this.style.borderColor='#329dd2'" onmouseout="this.style.borderColor='${isOpen ? '#cbd5e1' : '#e2e8f0'}'">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 26px; background: #f1f5f9; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">${post.avatar || '⚽'}</span>
              <div>
                <strong style="font-size: 16px; color: #0f172a; display: block;">${post.teamName}</strong>
                <small style="color: #64748b;">Đội trưởng: ${post.captainName} · ${post.createdAt}</small>
              </div>
            </div>
            <span style="font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 800; background: ${isOpen ? 'rgba(50, 157, 210, 0.15)' : 'rgba(235, 47, 51, 0.15)'}; color: ${isOpen ? '#176b94' : '#eb2f33'}; border: 1px solid ${isOpen ? 'rgba(50, 157, 210, 0.3)' : 'rgba(235, 47, 51, 0.3)'};">
              ${isOpen ? '● ĐANG TÌM ĐỐI' : '✓ ĐÃ CÁP KÈO'}
            </span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
            <span style="font-size: 11px; font-weight: 700; background: ${levelBg}; color: ${levelColor}; padding: 3px 8px; border-radius: 6px;">
              🎯 ${post.levelLabel}
            </span>
            <span style="font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px;">
              💰 ${post.betLabel}
            </span>
            <span style="font-size: 11px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 6px;">
              ⚽ ${post.fieldType === 'SAN_11' ? 'Sân 11' : post.fieldType === 'SAN_7' ? 'Sân 7' : 'Sân 5'}
            </span>
          </div>

          <div style="font-size: 13px; color: #334155; background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 12px; line-height: 1.5;">
            <div>🏟️ <strong>Sân:</strong> ${post.fieldName}</div>
            <div>📅 <strong>Thời gian:</strong> ${post.timeSlot} (Ngày ${post.matchDate})</div>
            <div style="margin-top: 6px; color: #475569; font-style: italic;">"${post.description}"</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 6px;">
          ${isOpen ? `
            <button type="button" onclick="openAcceptMatchModal(${post.id})" class="btn-accent-red" style="flex: 1; padding: 9px; font-size: 12px; font-weight: 700; justify-content: center; border-radius: 8px;">
              🤝 Bắt đối ngay
            </button>
          ` : `
            <div style="flex: 1; text-align: center; font-size: 12px; font-weight: 700; color: #166534; background: #dcfce7; padding: 8px; border-radius: 8px;">
              Đã cáp với: ${post.matchedBy || 'Đội bạn'}
            </div>
          `}
          <a href="tel:${post.phone}" class="outline-button" style="padding: 9px 12px; font-size: 12px; display: inline-flex; align-items: center;" title="Gọi điện">
            📞
          </a>
          <a href="https://zalo.me/${post.phone}" target="_blank" class="outline-button" style="padding: 9px 12px; font-size: 12px; color: #0284c7; border-color: #bae6fd; display: inline-flex; align-items: center;" title="Nhắn tin Zalo">
            💬
          </a>
        </div>
      </div>
    `;
  }).join("");
}

let activeMatchIdToAccept = null;

function openCreateMatchModal() {
  // Kiểm tra đăng nhập trước khi mở form
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập để đăng tin tìm đối!\nHãy bấm nút \"Đăng nhập / Đăng ký\" trên thanh menu.");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  document.getElementById("createMatchModal").style.display = "flex";
  // Auto-fill thông tin từ tài khoản đang đăng nhập
  const captainInput = document.getElementById("cmCaptainName");
  const phoneInput = document.getElementById("cmPhone");
  if (captainInput && !captainInput.value) captainInput.value = authUser.fullName || '';
  if (phoneInput && !phoneInput.value) phoneInput.value = authUser.phone || '';
  // Fill pitch select options
  const select = document.getElementById("cmFieldSelect");
  if (select) {
    select.innerHTML = DEFAULT_FIELDS.map(f => `<option value="${f.id}">${f.name} (${f.ward})</option>`).join("");
  }
  const dateInput = document.getElementById("cmDateInput");
  if (dateInput) dateInput.value = getTodayString();
}

function closeCreateMatchModal() {
  document.getElementById("createMatchModal").style.display = "none";
}

function submitMatchPost(e) {
  e.preventDefault();
  // Bắt buộc đăng nhập để đăng tin cáp kèo
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập tài khoản để đăng tin tìm đối!\nHãy bấm nút \"Đăng nhập / Đăng ký\" trên thanh menu.");
    closeCreateMatchModal();
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
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

  const newPost = {
    id: Date.now(),
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
    avatar: "⚡",
    description,
    createdAt: "Vừa xong"
  };

  const posts = getMatchmakingPosts();
  posts.unshift(newPost);
  localStorage.setItem("football_matchmaking", JSON.stringify(posts));

  closeCreateMatchModal();
  renderMatchmaking("ALL");
  alert("🎉 Đã đăng tin tìm đối thành công! Các đội bóng tại Buôn Ma Thuột có thể liên hệ với bạn ngay.");
}

function openAcceptMatchModal(postId) {
  // Kiểm tra đăng nhập
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập để bắt đối!\nHãy bấm \"Đăng nhập / Đăng ký\" trên thanh menu.");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  activeMatchIdToAccept = postId;
  const posts = getMatchmakingPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById("acceptMatchTeamTarget").textContent = post.teamName;
  document.getElementById("acceptMatchDetails").textContent = `${post.fieldName} · ${post.timeSlot} ngày ${post.matchDate} · Kèo: ${post.betLabel}`;
  document.getElementById("acceptMatchModal").style.display = "flex";
}

function closeAcceptMatchModal() {
  document.getElementById("acceptMatchModal").style.display = "none";
  activeMatchIdToAccept = null;
}

function confirmAcceptMatch(e) {
  e.preventDefault();
  const myTeam = document.getElementById("amMyTeamName").value.trim();
  const myPhone = document.getElementById("amMyPhone").value.trim();

  if (!myTeam || !myPhone) return;

  const posts = getMatchmakingPosts();
  const idx = posts.findIndex(p => p.id === activeMatchIdToAccept);
  if (idx !== -1) {
    posts[idx].status = "MATCHED";
    posts[idx].matchedBy = myTeam;
    localStorage.setItem("football_matchmaking", JSON.stringify(posts));
  }

  closeAcceptMatchModal();
  renderMatchmaking(currentMatchmakingFilter);
  alert(`🤝 Chúc mừng bạn đã bắt đối thành công với ${posts[idx]?.teamName}! Hãy liên hệ SĐT ${posts[idx]?.phone} để chốt màu áo thi đấu nhé.`);
}

// ==========================================
// 5. TOURNAMENT HUB (GIẢI ĐẤU MINI & BẢNG XẾP HẠNG)
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

    return `
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px; box-shadow: var(--shadow-sm); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
          <span style="font-size: 12px; font-weight: 800; color: #329dd2; letter-spacing: 0.5px;">${m.round}</span>
          <span style="font-size: 11px; color: #64748b;">${m.time}</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; background: ${t1Win ? '#f0fdf4' : '#f8fafc'}; font-weight: ${t1Win ? '800' : '600'}; color: ${t1Win ? '#166534' : '#334155'};">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span>${t1Win ? '👑' : '⚪'}</span> ${m.team1.name}
            </span>
            <span style="font-size: 16px; font-weight: 800;">${m.team1.score !== null ? m.team1.score : '-'}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 8px; background: ${t2Win ? '#f0fdf4' : '#f8fafc'}; font-weight: ${t2Win ? '800' : '600'}; color: ${t2Win ? '#166534' : '#334155'};">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span>${t2Win ? '👑' : '⚪'}</span> ${m.team2.name}
            </span>
            <span style="font-size: 16px; font-weight: 800;">${m.team2.score !== null ? m.team2.score : '-'}</span>
          </div>
        </div>

        ${m.winner ? `
          <div style="margin-top: 10px; font-size: 11px; text-align: center; color: #176b94; font-weight: 700; background: #e6f4fb; padding: 4px; border-radius: 6px;">
            Đội chiến thắng: ${m.winner}
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

function renderTournamentStandings(data) {
  const tbody = document.getElementById("tourStandingsTableBody");
  if (!tbody) return;

  tbody.innerHTML = data.standings.map(s => {
    const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank;
    return `
      <tr style="border-bottom: 1px solid #f1f5f9; text-align: center;">
        <td style="padding: 12px 8px; font-weight: 800; font-size: 14px;">${medal}</td>
        <td style="padding: 12px 8px; text-align: left; font-weight: 700; color: #0f172a;">${s.team}</td>
        <td style="padding: 12px 8px;">${s.played}</td>
        <td style="padding: 12px 8px; color: #16a34a; font-weight: 700;">${s.won}</td>
        <td style="padding: 12px 8px; color: #64748b;">${s.drawn}</td>
        <td style="padding: 12px 8px; color: #dc2626;">${s.lost}</td>
        <td style="padding: 12px 8px;">${s.gf}</td>
        <td style="padding: 12px 8px;">${s.ga}</td>
        <td style="padding: 12px 8px; font-weight: 700;">${s.gd}</td>
        <td style="padding: 12px 8px; font-weight: 800; color: #176b94; font-size: 16px; background: #f0fdf4;">${s.points}</td>
      </tr>
    `;
  }).join("");
}

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

// Export globals to window for robust cross-file access
if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
  window.DEFAULT_FIELDS = DEFAULT_FIELDS;
  window.DEFAULT_TIME_SLOTS = DEFAULT_TIME_SLOTS;
  window.formatMoney = formatMoney;
  window.getTodayString = getTodayString;
  window.getFieldSubPitches = getFieldSubPitches;
  window.DEFAULT_CLUBS = DEFAULT_CLUBS;
  window.DEFAULT_MATCHMAKING_POSTS = DEFAULT_MATCHMAKING_POSTS;
  window.DEFAULT_TOURNAMENT_DATA = DEFAULT_TOURNAMENT_DATA;
}


// ==========================================
// 6. HỆ THỐNG CÂU LẠC BỘ (FC) & HỘI NHÓM - LEO RANK
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
    description: "Câu lạc bộ chính thức của hệ thống đặt sân Sân Nhà FC tại Buôn Ma Thuột.",
    ward: "Phường Tân Tiến",
    fieldPreference: "Sân bóng đá C1",
    level: "TRUNG_BINH",
    elo: 1200,
    rank: "🥈 BẠC",
    wins: 12, draws: 3, losses: 5,
    goalsFor: 48, goalsAgainst: 28,
    members: [
      { userId: 1, name: "Lê Duy Tài", phone: "0896890399", role: "CAPTAIN", joinedAt: "2026-10-01" },
      { userId: 2, name: "Kpa Trần Quang Thịnh", phone: "0905123456", role: "CO_CAPTAIN", joinedAt: "2026-10-01" },
      { userId: 100, name: "Nguyễn Minh Hoàng", phone: "0914567890", role: "MEMBER", joinedAt: "2026-10-05" },
      { userId: 101, name: "Trần Đức Long", phone: "0932111222", role: "MEMBER", joinedAt: "2026-10-10" },
      { userId: 102, name: "Lê Quốc Hùng", phone: "0918999888", role: "MEMBER", joinedAt: "2026-10-12" }
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
    description: "Đội bóng phong trào mạnh nhất khu vực Ea Tam, chuyên thi đấu sân 7.",
    ward: "Phường Ea Tam",
    fieldPreference: "SVĐ ĐH Tây Nguyên",
    level: "BAN_CHUYEN",
    elo: 1450,
    rank: "🥇 VÀNG",
    wins: 18, draws: 2, losses: 3,
    goalsFor: 65, goalsAgainst: 20,
    members: [
      { userId: 3, name: "Nguyễn Anh Tuấn", phone: "0935444777", role: "CAPTAIN", joinedAt: "2026-09-15" },
      { userId: 103, name: "Phạm Văn Đức", phone: "0943567890", role: "CO_CAPTAIN", joinedAt: "2026-09-15" },
      { userId: 104, name: "Trần Hữu Phúc", phone: "0918234567", role: "MEMBER", joinedAt: "2026-09-20" },
      { userId: 105, name: "Nguyễn Thanh Tùng", phone: "0932678901", role: "MEMBER", joinedAt: "2026-09-22" },
      { userId: 106, name: "Lê Minh Quân", phone: "0905789012", role: "MEMBER", joinedAt: "2026-10-01" },
      { userId: 107, name: "Võ Duy Mạnh", phone: "0914890123", role: "MEMBER", joinedAt: "2026-10-05" },
      { userId: 108, name: "Bùi Hoàng Long", phone: "0963901234", role: "MEMBER", joinedAt: "2026-10-10" }
    ],
    createdAt: "2026-09-15",
    isRecruiting: true
  },
  {
    id: 3,
    name: "FC Cà Phê Ban Mê",
    shortName: "CFBM",
    avatar: "☕",
    banner: "https://image.made-in-china.com/202f0j00QIzeVHbmrscn/Football-Artificial-Grass-Carpets-Astro-Turf-for-Football-Stadium.webp",
    captainId: 4,
    captainName: "Hoàng Minh Đức",
    description: "Đội bóng anh em cà phê sáng BMT, đá lành tính dưỡng sinh buổi sáng.",
    ward: "Phường Tân Tiến",
    fieldPreference: "Sân Bóng Đá Ngọc Anh",
    level: "VUI_VE",
    elo: 950,
    rank: "🥉 ĐỒNG",
    wins: 5, draws: 4, losses: 8,
    goalsFor: 22, goalsAgainst: 35,
    members: [
      { userId: 4, name: "Hoàng Minh Đức", phone: "0906448004", role: "CAPTAIN", joinedAt: "2026-10-05" },
      { userId: 109, name: "Ngô Thanh Bình", phone: "0918345678", role: "MEMBER", joinedAt: "2026-10-06" },
      { userId: 110, name: "Đặng Văn Hải", phone: "0935456789", role: "MEMBER", joinedAt: "2026-10-08" }
    ],
    createdAt: "2026-10-05",
    isRecruiting: true
  },
  {
    id: 4,
    name: "FC Voi Chiến Tây Nguyên",
    shortName: "VCTN",
    avatar: "🐘",
    banner: "https://5.imimg.com/data5/SELLER/Default/2023/8/335821545/AO/WO/DU/19508713/football-artificial-grass-1000x1000.jpg",
    captainId: 5,
    captainName: "Trần Quốc Cường",
    description: "Đội bóng mạnh nhất giải phong trào Đắk Lắk, nhiều lần vô địch giải sân 7.",
    ward: "Phường Tân Lập",
    fieldPreference: "Sân Ban Mê Sport",
    level: "BAN_CHUYEN",
    elo: 1680,
    rank: "💎 KIM CƯƠNG",
    wins: 25, draws: 5, losses: 2,
    goalsFor: 88, goalsAgainst: 15,
    members: [
      { userId: 5, name: "Trần Quốc Cường", phone: "0912345678", role: "CAPTAIN", joinedAt: "2026-08-01" },
      { userId: 111, name: "Lê Văn Hùng", phone: "0943678901", role: "CO_CAPTAIN", joinedAt: "2026-08-01" },
      { userId: 112, name: "Phạm Minh Tuấn", phone: "0918789012", role: "MEMBER", joinedAt: "2026-08-05" },
      { userId: 113, name: "Nguyễn Đình Trọng", phone: "0932890123", role: "MEMBER", joinedAt: "2026-08-10" },
      { userId: 114, name: "Hồ Anh Quân", phone: "0905901234", role: "MEMBER", joinedAt: "2026-08-15" },
      { userId: 115, name: "Vũ Tiến Dũng", phone: "0914012345", role: "MEMBER", joinedAt: "2026-08-20" },
      { userId: 116, name: "Đỗ Hữu Dũng", phone: "0963123456", role: "MEMBER", joinedAt: "2026-09-01" },
      { userId: 117, name: "Nguyễn Văn Toàn", phone: "0918234567", role: "MEMBER", joinedAt: "2026-09-05" },
      { userId: 118, name: "Trần Phi Sơn", phone: "0935345678", role: "MEMBER", joinedAt: "2026-09-10" },
      { userId: 119, name: "Lê Công Vinh", phone: "0906456789", role: "MEMBER", joinedAt: "2026-09-15" }
    ],
    createdAt: "2026-08-01",
    isRecruiting: false
  }
];

function getClubs() {
  try {
    const saved = localStorage.getItem("football_clubs");
    return saved ? JSON.parse(saved) : DEFAULT_CLUBS;
  } catch { return DEFAULT_CLUBS; }
}

function saveClubs(clubs) {
  localStorage.setItem("football_clubs", JSON.stringify(clubs));
}

function getEloRank(elo) {
  if (elo >= 1600) return "💎 KIM CƯƠNG";
  if (elo >= 1400) return "🥇 VÀNG";
  if (elo >= 1100) return "🥈 BẠC";
  if (elo >= 800) return "🥉 ĐỒNG";
  return "🆕 MỚI";
}

function getEloColor(elo) {
  if (elo >= 1600) return "#7c3aed";
  if (elo >= 1400) return "#ca8a04";
  if (elo >= 1100) return "#64748b";
  if (elo >= 800) return "#b45309";
  return "#94a3b8";
}

function renderClubs(filter = "ALL") {
  const container = document.getElementById("clubsListContainer");
  if (!container) return;

  const clubs = getClubs().filter(c => {
    if (filter === "ALL") return true;
    if (filter === "RECRUITING") return c.isRecruiting;
    return c.level === filter;
  }).sort((a, b) => b.elo - a.elo);

  if (clubs.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; background: #f8fafc; border-radius: 14px;">Chưa có câu lạc bộ nào. Hãy bấm "Tạo FC mới" để tạo đội bóng đầu tiên!</div>';
    return;
  }

  container.innerHTML = clubs.map((club, idx) => {
    const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
    const isMember = authUser && club.members.some(m => m.userId === authUser.id);
    const isCaptain = authUser && club.captainId === authUser.id;
    const memberCount = club.members.length;
    const isFull = memberCount >= MAX_CLUB_MEMBERS;

    return '<div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: all 0.2s;" onmouseover="this.style.borderColor=\'#329dd2\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">' +
      '<div style="position: relative; height: 100px;">' +
      '<img src="' + club.banner + '" style="width: 100%; height: 100%; object-fit: cover;" alt="' + club.name + '" />' +
      '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(transparent 30%, rgba(0,0,0,0.6));"></div>' +
      '<div style="position: absolute; bottom: 8px; left: 12px; display: flex; align-items: center; gap: 8px;">' +
      '<span style="font-size: 28px; background: rgba(255,255,255,0.9); width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">' + club.avatar + '</span>' +
      '<div>' +
      '<strong style="font-size: 15px; color: #ffffff; display: block; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">' + club.name + '</strong>' +
      '<span style="font-size: 11px; color: rgba(255,255,255,0.9); text-shadow: 0 1px 3px rgba(0,0,0,0.5);">' + club.ward + '</span>' +
      '</div></div>' +
      '<div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: ' + getEloColor(club.elo) + '; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; backdrop-filter: blur(4px);">' + club.rank + ' · ' + club.elo + ' ELO</div>' +
      '</div>' +
      '<div style="padding: 14px;">' +
      '<div style="font-size: 12px; color: #64748b; margin-bottom: 8px; line-height: 1.4;">' + club.description + '</div>' +
      '<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">' +
      '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #f0fdf4; color: #166534;">👤 ' + memberCount + '/' + MAX_CLUB_MEMBERS + ' thành viên</span>' +
      '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #eff6ff; color: #1d4ed8;">🏆 ' + club.wins + 'W · ' + club.draws + 'D · ' + club.losses + 'L</span>' +
      '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #fef3c7; color: #92400e;">⚽ ' + club.goalsFor + ' BT - ' + club.goalsAgainst + ' BB</span>' +
      (club.isRecruiting ? '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(50, 157, 210, 0.12); color: #176b94; border: 1px solid rgba(50, 157, 210, 0.25);">🟢 Đang tuyển</span>' : '<span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(235, 47, 51, 0.12); color: #eb2f33; border: 1px solid rgba(235, 47, 51, 0.25);">🔴 Đã đủ</span>') +
      '</div>' +
      '<div style="font-size: 11px; color: #334155; margin-bottom: 10px;">🎖️ Đội trưởng: <strong>' + club.captainName + '</strong> · 📞 ' + (club.members[0]?.phone || '') + '</div>' +
      '<div style="display: flex; gap: 6px;">' +
      (isMember
        ? '<div style="flex: 1; text-align: center; font-size: 11px; font-weight: 700; color: #166534; background: #dcfce7; padding: 8px; border-radius: 8px;">✓ Bạn là thành viên' + (isCaptain ? ' (Đội trưởng)' : '') + '</div>'
        : (isFull
          ? '<div style="flex: 1; text-align: center; font-size: 11px; font-weight: 700; color: #991b1b; background: #fee2e2; padding: 8px; border-radius: 8px;">Đội đã đủ 15 người</div>'
          : '<button type="button" onclick="joinClub(' + club.id + ')" class="primary-button" style="flex: 1; padding: 8px; font-size: 11px; font-weight: 700; justify-content: center;">🤝 Xin gia nhập</button>'
        )
      ) +
      '<button type="button" onclick="viewClubDetail(' + club.id + ')" class="outline-button" style="padding: 8px 12px; font-size: 11px;">👁️ Chi tiết</button>' +
      '</div></div></div>';
  }).join("");
}

function joinClub(clubId) {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập để gia nhập câu lạc bộ!");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }

  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  if (club.members.length >= MAX_CLUB_MEMBERS) {
    alert("⚠️ FC " + club.name + " đã đủ " + MAX_CLUB_MEMBERS + " thành viên, không thể gia nhập!");
    return;
  }

  // Kiểm tra đã gia nhập CLB khác chưa
  const existingClub = clubs.find(c => c.members.some(m => m.userId === authUser.id));
  if (existingClub) {
    alert("⚠️ Bạn đã là thành viên của FC " + existingClub.name + "!\nMỗi tài khoản chỉ được tham gia 1 câu lạc bộ. Hãy rời đội cũ trước khi gia nhập đội mới.");
    return;
  }

  if (club.members.some(m => m.userId === authUser.id)) {
    alert("Bạn đã là thành viên của FC " + club.name + " rồi!");
    return;
  }

  club.members.push({
    userId: authUser.id,
    name: authUser.fullName,
    phone: authUser.phone || "",
    role: "MEMBER",
    joinedAt: getTodayString()
  });

  saveClubs(clubs);
  renderClubs();
  alert("🎉 Chúc mừng! Bạn đã gia nhập FC " + club.name + " thành công!\n📞 Hãy liên hệ Đội trưởng " + club.captainName + " để nhận lịch tập và phân công vị trí.");
}

function viewClubDetail(clubId) {
  const clubs = getClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  const membersHtml = club.members.map((m, i) => {
    const roleLabel = m.role === "CAPTAIN" ? "🎖️ Đội trưởng" : m.role === "CO_CAPTAIN" ? "⭐ Phó đội" : "👤 Thành viên";
    return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ' + (i % 2 === 0 ? '#f8fafc' : '#ffffff') + '; border-radius: 6px; font-size: 12px;">' +
      '<div style="display: flex; align-items: center; gap: 8px;">' +
      '<span style="font-weight: 700; color: #0f172a;">' + (i + 1) + '. ' + m.name + '</span>' +
      '<span style="font-size: 10px; color: #64748b;">' + roleLabel + '</span>' +
      '</div>' +
      '<span style="color: #64748b; font-family: monospace;">📞 ' + m.phone + '</span>' +
      '</div>';
  }).join("");

  const detailHtml =
    '<div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">' +
    '<span style="font-size: 48px; background: #f1f5f9; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">' + club.avatar + '</span>' +
    '<div>' +
    '<h3 style="margin: 0; font-size: 20px; color: #0f172a;">' + club.name + '</h3>' +
    '<div style="font-size: 12px; color: #64748b; margin-top: 2px;">📍 ' + club.ward + ' · 🏟️ ' + club.fieldPreference + '</div>' +
    '<div style="margin-top: 4px; font-size: 13px; font-weight: 800; color: ' + getEloColor(club.elo) + ';">' + club.rank + ' · ' + club.elo + ' ELO</div>' +
    '</div></div>' +
    '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">' +
    '<div style="background: #f0fdf4; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #16a34a;">' + club.wins + '</div><div style="font-size: 10px; color: #64748b;">Thắng</div></div>' +
    '<div style="background: #fefce8; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #ca8a04;">' + club.draws + '</div><div style="font-size: 10px; color: #64748b;">Hòa</div></div>' +
    '<div style="background: #fef2f2; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #dc2626;">' + club.losses + '</div><div style="font-size: 10px; color: #64748b;">Thua</div></div>' +
    '<div style="background: #eff6ff; border-radius: 10px; padding: 12px; text-align: center;"><div style="font-size: 20px; font-weight: 800; color: #2563eb;">' + club.goalsFor + '</div><div style="font-size: 10px; color: #64748b;">Bàn thắng</div></div>' +
    '</div>' +
    '<div style="margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">📋 Danh sách thành viên (' + club.members.length + '/' + MAX_CLUB_MEMBERS + '):</div>' +
    '<div style="display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto;">' + membersHtml + '</div>';

  // Show in a simple alert-style modal
  const existing = document.getElementById("clubDetailModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "clubDetailModal";
  modal.className = "modal-backdrop";
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-card" style="max-width: 540px; max-height: 90vh; overflow-y: auto;">' +
    '<div class="modal-header"><div><h3 style="margin: 0; font-size: 18px;">🏟️ Chi tiết Câu lạc bộ</h3></div>' +
    '<button type="button" class="modal-close" onclick="document.getElementById(\'clubDetailModal\').remove()">✕</button></div>' +
    '<div style="padding: 20px;">' + detailHtml + '</div>' +
    '<div style="padding: 0 20px 20px; display: flex; gap: 10px;">' +
    '<button type="button" class="outline-button" style="flex: 1; padding: 10px;" onclick="document.getElementById(\'clubDetailModal\').remove()">Đóng</button>' +
    '</div></div>';
  document.body.appendChild(modal);
}

let currentClubFilter = "ALL";

function openCreateClubModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) {
    alert("⚠️ Bạn cần đăng nhập để tạo câu lạc bộ!");
    if (typeof openAuthModal === 'function') openAuthModal('LOGIN');
    return;
  }
  // Kiểm tra đã có CLB chưa
  const clubs = getClubs();
  const existingClub = clubs.find(c => c.members.some(m => m.userId === authUser.id));
  if (existingClub) {
    alert("⚠️ Bạn đã là thành viên của FC " + existingClub.name + "!\nHãy rời đội cũ trước khi tạo đội mới.");
    return;
  }

  document.getElementById("createClubModal").style.display = "flex";
  const captainInput = document.getElementById("ccCaptainName");
  const phoneInput = document.getElementById("ccPhone");
  if (captainInput) captainInput.value = authUser.fullName || "";
  if (phoneInput) phoneInput.value = authUser.phone || "";
}

function closeCreateClubModal() {
  document.getElementById("createClubModal").style.display = "none";
}

function submitCreateClub(e) {
  e.preventDefault();
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  if (!authUser) return;

  const clubName = document.getElementById("ccClubName").value.trim();
  const shortName = document.getElementById("ccShortName").value.trim().toUpperCase();
  const captainName = document.getElementById("ccCaptainName").value.trim() || authUser.fullName;
  const phone = document.getElementById("ccPhone").value.trim();
  const ward = document.getElementById("ccWard").value;
  const level = document.getElementById("ccLevel").value;
  const description = document.getElementById("ccDesc").value.trim() || "Câu lạc bộ bóng đá phong trào tại Buôn Ma Thuột.";
  const avatar = document.getElementById("ccAvatar").value || "⚽";

  if (!clubName || !phone || phone.length < 9) {
    alert("⚠️ Tên CLB và Số điện thoại đội trưởng là bắt buộc!");
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
    description,
    ward,
    fieldPreference: "",
    level,
    elo: 1000,
    rank: getEloRank(1000),
    wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0,
    members: [
      { userId: authUser.id, name: captainName, phone, role: "CAPTAIN", joinedAt: getTodayString() }
    ],
    createdAt: getTodayString(),
    isRecruiting: true
  };

  clubs.push(newClub);
  saveClubs(clubs);
  closeCreateClubModal();
  renderClubs();
  alert("🎉 FC " + clubName + " đã được tạo thành công!\n🎖️ Bạn là Đội trưởng. ELO khởi điểm: 1000 (🥉 ĐỒNG)\n📢 Hãy chia sẻ để tuyển thành viên (tối đa " + MAX_CLUB_MEMBERS + " người).");
}

// Export mới cho window
if (typeof window !== "undefined") {
  window.getClubs = getClubs;
  window.saveClubs = saveClubs;
  window.renderClubs = renderClubs;
  window.joinClub = joinClub;
  window.viewClubDetail = viewClubDetail;
  window.openCreateClubModal = openCreateClubModal;
  window.closeCreateClubModal = closeCreateClubModal;
  window.submitCreateClub = submitCreateClub;
  window.initPitchMap = initPitchMap;
  window.renderPitchMarkers = renderPitchMarkers;
  window.findNearestPitch = findNearestPitch;
  window.selectPitchAndScroll = selectPitchAndScroll;
  window.renderMatchmaking = renderMatchmaking;
  window.openCreateMatchModal = openCreateMatchModal;
  window.closeCreateMatchModal = closeCreateMatchModal;
  window.submitMatchPost = submitMatchPost;
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
