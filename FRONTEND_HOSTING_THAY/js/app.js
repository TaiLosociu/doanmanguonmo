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
function initStorage() {
  if (!localStorage.getItem("football_fields")) {
    localStorage.setItem("football_fields", JSON.stringify(DEFAULT_FIELDS));
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
}

