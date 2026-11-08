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
    id: 5,
    name: "SVĐ Buôn Ma Thuột",
    ward: "Phường Tân Tiến",
    address: "2 Nguyễn Công Trứ, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0262 3857 805",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân vận động trung tâm Buôn Ma Thuột, mặt sân chất lượng cao, dàn đèn chuẩn thi đấu giải.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 11 người / đội",
    turf: "Cỏ tự nhiên & nhân tạo Pro",
    size: "60m x 100m"
  },
  {
    id: 6,
    name: "Sân bóng C1",
    ward: "Phường Tân Tiến",
    address: "1B Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "098 383 0955",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân cỏ nhân tạo 5 người, không gian thoáng đãng, phục vụ nước uống và trang phục.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo 50mm",
    size: "20m x 40m"
  },
  {
    id: 7,
    name: "Sân Manchester",
    ward: "Phường Tân Tiến",
    address: "130 Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0914 123 456",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini phong cách hiện đại, dàn đèn chiếu sáng tốt, khu để xe rộng rãi.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo cao cấp",
    size: "20m x 40m"
  },
  {
    id: 8,
    name: "Sân T&H",
    ward: "Phường Tân Tiến",
    address: "110/10 Hoàng Hoa Thám, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0906 448 004",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Cụm sân cỏ mini chất lượng cao, mặt cỏ êm, tổ chức giải đấu phong trào thường xuyên.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ FIFA giảm chấn",
    size: "20m x 40m"
  },
  {
    id: 9,
    name: "Sân mini Hoài Ân",
    ward: "Phường Tân Lập",
    address: "Hẻm 119 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0963 747 477",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini thoáng mát, nằm ngay trung tâm Tân Lập, có căn tin phục vụ giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo Monofilament",
    size: "20m x 40m"
  },
  {
    id: 10,
    name: "Sân Ngọc Anh",
    ward: "Phường Tân Lập",
    address: "Hẻm 44 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0782 559 909",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng nhân tạo chất lượng tốt, giá cả học sinh - sinh viên, đặt sân dễ dàng.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo êm ái",
    size: "20m x 40m"
  },
  {
    id: 11,
    name: "Sân Công Thành",
    ward: "Phường Tân Lập",
    address: "Hẻm 44/11 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0935 221 889",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Mặt cỏ mới bảo dưỡng, hệ thống lưới chắn an toàn, bãi giữ xe máy và ô tô tiện lợi.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo Pro",
    size: "20m x 40m"
  },
  {
    id: 12,
    name: "Sân Tân Thái Long",
    ward: "Phường Tân Lợi",
    address: "56 Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0262 3601 888",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Tổ hợp sân 7 và sân 5 hiện đại hàng đầu khu Y Moan, có khán đài mini cổ vũ.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo chuẩn thi đấu",
    size: "30m x 50m"
  },
  {
    id: 13,
    name: "Sân Lập Nguyễn",
    ward: "Phường Tân Lợi",
    address: "128/7 Giải Phóng, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0905 889 123",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini cỏ nhân tạo chất lượng cao, thoát nước tốt, hoạt động từ 6h đến 22h.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo 50mm",
    size: "20m x 40m"
  },
  {
    id: 14,
    name: "Sân KenVin",
    ward: "Phường Ea Tam",
    address: "Hẻm 4 Nguyễn Trường Tộ, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0918 776 543",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini sinh viên Ea Tam, không khí thể thao sôi động, giá ưu đãi cho học sinh sinh viên.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo bền đẹp",
    size: "20m x 40m"
  },
  {
    id: 15,
    name: "Sân Đại Thành",
    ward: "Phường Ea Tam",
    address: "Đường Phùng Hưng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0944 556 778",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân 7 người rộng rãi, tổ chức các giải đấu cơ quan và giao lưu câu lạc bộ tại Buôn Ma Thuột.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Mặt cỏ sân 7 chuẩn giải",
    size: "30m x 50m"
  },
  {
    id: 16,
    name: "Sân Hoàng Gia",
    ward: "Phường Ea Tam",
    address: "22 Mai Thị Lựu, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0977 443 219",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Mặt cỏ cao cấp, đèn led sáng rõ, phục vụ nước ngọt đá lạnh miễn phí cho đội đặt sân.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo cao cấp",
    size: "20m x 40m"
  },
  {
    id: 17,
    name: "Sân ĐH Tây Nguyên",
    ward: "Phường Ea Tam",
    address: "567 Lê Duẩn, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0262 3825 555",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân bóng đá trong khuôn viên trường ĐH Tây Nguyên, kích thước chuẩn, không gian rợp bóng mát.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 11 người / đội",
    turf: "Cỏ tự nhiên & nhân tạo",
    size: "30m x 50m"
  },
  {
    id: 18,
    name: "Sân CĐ Sư Phạm",
    ward: "Phường Ea Tam",
    address: "Hẻm 33 Lê Thị Riêng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0932 110 889",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini khu vực CĐ Sư Phạm Đắk Lắk, môi trường thể thao thân thiện, tiện ích đầy đủ.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo chất lượng",
    size: "20m x 40m"
  },
  {
    id: 19,
    name: "Sân Ban Mê Sport",
    ward: "Phường Tự An",
    address: "121 Hùng Vương, Phường Tự An, Buôn Ma Thuột",
    phone: "0947 959 578",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Trung tâm thể thao Ban Mê Sport hiện đại bậc nhất phố núi, cỏ nhân tạo cao cấp, phòng thay đồ VIP.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo Pro VIP",
    size: "30m x 50m"
  },
  {
    id: 20,
    name: "Sân mini Hiệp Long",
    ward: "Phường Tân Thành",
    address: "87 Giải Phóng, Phường Tân Thành, Buôn Ma Thuột",
    phone: "0908 667 334",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini 5 người mặt cỏ êm, dàn đèn hiện đại, phục vụ đồ uống giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo êm",
    size: "20m x 40m"
  },
  {
    id: 21,
    name: "Sân Thành Nhất",
    ward: "Phường Thành Nhất",
    address: "113/44/17 Nguyễn Cơ Thạch, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0982 456 781",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng cỏ nhân tạo chất lượng tốt, giá thành hợp lý, phong trào bóng đá sôi nổi.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo phong trào",
    size: "20m x 40m"
  },
  {
    id: 22,
    name: "Sân An Dương Vương",
    ward: "Phường Thành Nhất",
    address: "68 An Dương Vương, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0973 889 002",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini gia đình tiện lợi, trang thiết bị mới, hỗ trợ mượn bóng và áo bib tập.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo mới",
    size: "20m x 40m"
  },
  {
    id: 23,
    name: "Sân thể thao Đức Thịnh",
    ward: "Phường Khánh Xuân",
    address: "Hẻm 174 Phan Huy Chú, Phường Khánh Xuân, Buôn Ma Thuột",
    phone: "0768 447 887",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Khu liên hợp thể thao Đức Thịnh với cụm sân 7 và sân 5, hệ thống chiếu sáng chuẩn thi đấu đêm.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo đạt chuẩn",
    size: "30m x 50m"
  },
  {
    id: 24,
    name: "Sân Tiến Thy",
    ward: "Xã Hòa Khánh",
    address: "ĐT682, Xã Hòa Khánh, Buôn Ma Thuột",
    phone: "0915 678 910",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini khu vực Hòa Khánh, mặt cỏ xanh mượt, phù hợp giao lưu bóng đá địa phương.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo sân mini",
    size: "20m x 40m"
  },
  {
    id: 25,
    name: "Sân Quốc Định",
    ward: "Xã Hòa Thuận",
    address: "Thôn 8, Xã Hòa Thuận, Buôn Ma Thuột",
    phone: "0934 890 123",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân cỏ nhân tạo Hòa Thuận, phục vụ đam mê bóng đá bà con nông thôn mới và thanh thiếu niên.",
    imageUrl: "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo chuẩn sân 5",
    size: "20m x 40m"
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
}

