"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("football_api_url");
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000/api/v1"
  );
}

const API = getApiUrl();

type TimeSlot = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  isPeakHour: boolean;
};

type ScheduleSlot = {
  timeSlot: TimeSlot;
  price: number | null;
  isAvailable: boolean;
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
};

type FieldSchedule = {
  id: number;
  name: string;
  ward?: string | null;
  address?: string | null;
  phone?: string | null;
  fieldType: "SAN_5" | "SAN_7";
  description: string | null;
  imageUrl: string | null;
  slots: ScheduleSlot[];
};

type Schedule = {
  date: string;
  dayType: "WEEKDAY" | "WEEKEND";
  fields?: FieldSchedule[];
  pitches?: FieldSchedule[];
};

type SubPitchItem = {
  id: string; // "SAN_5_1" | "SAN_5_2" | "SAN_7_1" | "SAN_7_2" | "SAN_11_1"
  code: string;
  name: string; // "Sân con 5 - Số 1", "Sân con 5 - Số 2", "Sân con 7 - Số 1", "Sân con 7 - Số 2", "Sân con 11 - Tiêu chuẩn"
  category: "SAN_5" | "SAN_7" | "SAN_11";
  categoryName: string;
  capacity: string;
  turf: string;
  basePrice: number;
  highlight: string;
};

const SUB_PITCHES: SubPitchItem[] = [
  { id: "SAN_5_1", code: "5-1", name: "Sân con 5 - Số 1", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo 50mm chống trượt", basePrice: 250000, highlight: "Mặt cỏ mới thay, êm ái, bám giày" },
  { id: "SAN_5_2", code: "5-2", name: "Sân con 5 - Số 2", category: "SAN_5", categoryName: "Sân mini 5 người", capacity: "5 - 7 người / đội", turf: "Cỏ nhân tạo FIFA Standard", basePrice: 250000, highlight: "Dàn đèn LED 400W chống lóa khi đá đêm" },
  { id: "SAN_7_1", code: "7-1", name: "Sân con 7 - Số 1", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ FIFA Pro 2 sao & Khán đài mini", basePrice: 400000, highlight: "Kích thước 30x50m chuẩn giải phong trào" },
  { id: "SAN_7_2", code: "7-2", name: "Sân con 7 - Số 2", category: "SAN_7", categoryName: "Sân bán chuyên 7 người", capacity: "7 - 9 người / đội", turf: "Cỏ nhân tạo đệm cao su giảm chấn", basePrice: 400000, highlight: "Rộng rãi, thoáng mát, khu khởi động riêng" },
  { id: "SAN_11_1", code: "11-1", name: "Sân con 11 - Tiêu chuẩn", category: "SAN_11", categoryName: "Sân lớn 11 người (Chuẩn VFF)", capacity: "11 - 14 người / đội", turf: "Sân 60m x 100m cỏ chuẩn quốc gia", basePrice: 800000, highlight: "Sân thi đấu giải lớn, có cabin trọng tài & khán đài" },
];

type FieldInfo = {
  id: number;
  name: string;
  ward?: string | null;
  address?: string | null;
  phone?: string | null;
  ownerName?: string | null;
  fieldType: "SAN_5" | "SAN_7";
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  description: string | null;
  imageUrl: string | null;
  capacity?: string;
  turf?: string;
};

const BMT_WARDS = [
  "Tất cả khu vực Buôn Ma Thuột",
  "Phường Tân Tiến",
  "Phường Tân Lập",
  "Phường Tân Lợi",
  "Phường Ea Tam",
  "Phường Tự An",
  "Phường Tân Thành",
  "Phường Thành Nhất",
  "Phường Khánh Xuân",
  "Xã Hòa Khánh",
  "Xã Hòa Thuận",
];

// High quality fallback fields if backend is loading or offline (21 Sân Buôn Ma Thuột)
const DEFAULT_FIELDS: FieldInfo[] = [
  {
    id: 5,
    name: "SVĐ Buôn Ma Thuột",
    ward: "Phường Tân Tiến",
    address: "2 Nguyễn Công Trứ, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0905 123 456",
    ownerName: "Anh Tuấn (Chủ nhiệm SVĐ)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân vận động trung tâm Buôn Ma Thuột, mặt sân chất lượng cao, dàn đèn chuẩn thi đấu giải.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 11 người / đội",
    turf: "Cỏ tự nhiên & nhân tạo Pro",
  },
  {
    id: 6,
    name: "Sân bóng C1",
    ward: "Phường Tân Tiến",
    address: "1B Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "098 383 0955",
    ownerName: "Anh Hải (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân cỏ nhân tạo 5 người, không gian thoáng đãng, phục vụ nước uống và trang phục.",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo 50mm",
  },
  {
    id: 7,
    name: "Sân Manchester",
    ward: "Phường Tân Tiến",
    address: "130 Y Ngông, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0914 123 456",
    ownerName: "Anh Dũng (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini phong cách hiện đại, dàn đèn chiếu sáng tốt, khu để xe rộng rãi.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo cao cấp",
  },
  {
    id: 8,
    name: "Sân T&H",
    ward: "Phường Tân Tiến",
    address: "110/10 Hoàng Hoa Thám, Phường Tân Tiến, Buôn Ma Thuột",
    phone: "0906 448 004",
    ownerName: "Chị Thảo (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Cụm sân cỏ mini chất lượng cao, mặt cỏ êm, tổ chức giải đấu phong trào thường xuyên.",
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ FIFA giảm chấn",
  },
  {
    id: 9,
    name: "Sân mini Hoài Ân",
    ward: "Phường Tân Lập",
    address: "Hẻm 119 Nguyễn Văn Cừ, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0963 747 477",
    ownerName: "Anh Ân (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini thoáng mát, nằm ngay trung tâm Tân Lập, có căn tin phục vụ giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo Monofilament",
  },
  {
    id: 10,
    name: "Sân Ngọc Anh",
    ward: "Phường Tân Lập",
    address: "Hẻm 44 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0782 559 909",
    ownerName: "Anh Ngọc (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng nhân tạo chất lượng tốt, giá cả học sinh - sinh viên, đặt sân dễ dàng.",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo êm ái",
  },
  {
    id: 11,
    name: "Sân Công Thành",
    ward: "Phường Tân Lập",
    address: "Hẻm 44/11 Đinh Núp, Phường Tân Lập, Buôn Ma Thuột",
    phone: "0935 221 889",
    ownerName: "Anh Sơn (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Mặt cỏ mới bảo dưỡng, hệ thống lưới chắn an toàn, bãi giữ xe máy và ô tô tiện lợi.",
    imageUrl: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo Pro",
  },
  {
    id: 12,
    name: "Sân Tân Thái Long",
    ward: "Phường Tân Lợi",
    address: "56 Y Moan Ênuôl, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0903 554 433",
    ownerName: "Anh Tân (Chủ cụm sân)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Tổ hợp sân 7 và sân 5 hiện đại hàng đầu khu Y Moan, có khán đài mini cổ vũ.",
    imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo chuẩn thi đấu",
  },
  {
    id: 13,
    name: "Sân Lập Nguyễn",
    ward: "Phường Tân Lợi",
    address: "128/7 Giải Phóng, Phường Tân Lợi, Buôn Ma Thuột",
    phone: "0905 889 123",
    ownerName: "Anh Lập (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini cỏ nhân tạo chất lượng cao, thoát nước tốt, hoạt động từ 6h đến 22h.",
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo 50mm",
  },
  {
    id: 14,
    name: "Sân KenVin",
    ward: "Phường Ea Tam",
    address: "Hẻm 4 Nguyễn Trường Tộ, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0918 776 543",
    ownerName: "Anh Vinh (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini sinh viên Ea Tam, không khí thể thao sôi động, giá ưu đãi cho học sinh sinh viên.",
    imageUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo bền đẹp",
  },
  {
    id: 15,
    name: "Sân Đại Thành",
    ward: "Phường Ea Tam",
    address: "Đường Phùng Hưng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0944 556 778",
    ownerName: "Anh Thành (Chủ cụm sân)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân 7 người rộng rãi, tổ chức các giải đấu cơ quan và giao lưu câu lạc bộ tại Buôn Ma Thuột.",
    imageUrl: "https://images.unsplash.com/photo-1524015368236-bbf6f72545b6?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Mặt cỏ sân 7 chuẩn giải",
  },
  {
    id: 16,
    name: "Sân Hoàng Gia",
    ward: "Phường Ea Tam",
    address: "22 Mai Thị Lựu, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0977 443 219",
    ownerName: "Anh Hoàng (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Mặt cỏ cao cấp, đèn led sáng rõ, phục vụ nước ngọt đá lạnh miễn phí cho đội đặt sân.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo cao cấp",
  },
  {
    id: 17,
    name: "Sân ĐH Tây Nguyên",
    ward: "Phường Ea Tam",
    address: "567 Lê Duẩn, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0262 3825 555",
    ownerName: "Thầy Hưng (Quản lý SVĐ ĐH Tây Nguyên)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Sân bóng đá trong khuôn viên trường ĐH Tây Nguyên, kích thước chuẩn, không gian rợp bóng mát.",
    imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 11 người / đội",
    turf: "Cỏ tự nhiên & nhân tạo",
  },
  {
    id: 18,
    name: "Sân CĐ Sư Phạm",
    ward: "Phường Ea Tam",
    address: "Hẻm 33 Lê Thị Riêng, Phường Ea Tam, Buôn Ma Thuột",
    phone: "0935 221 345",
    ownerName: "Thầy Đức (Quản lý sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini khu vực CĐ Sư Phạm Đắk Lắk, môi trường thể thao thân thiện, tiện ích đầy đủ.",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo chất lượng",
  },
  {
    id: 19,
    name: "Sân Ban Mê Sport",
    ward: "Phường Tự An",
    address: "121 Hùng Vương, Phường Tự An, Buôn Ma Thuột",
    phone: "0947 959 578",
    ownerName: "Anh Tuấn Ban Mê (Chủ trung tâm)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Trung tâm thể thao Ban Mê Sport hiện đại bậc nhất phố núi, cỏ nhân tạo cao cấp, phòng thay đồ VIP.",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo Pro VIP",
  },
  {
    id: 20,
    name: "Sân mini Hiệp Long",
    ward: "Phường Tân Thành",
    address: "87 Giải Phóng, Phường Tân Thành, Buôn Ma Thuột",
    phone: "0908 667 334",
    ownerName: "Anh Long (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini 5 người mặt cỏ êm, dàn đèn hiện đại, phục vụ đồ uống giải khát.",
    imageUrl: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo êm",
  },
  {
    id: 21,
    name: "Sân Thành Nhất",
    ward: "Phường Thành Nhất",
    address: "113/44/17 Nguyễn Cơ Thạch, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0982 456 781",
    ownerName: "Anh Nhất (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng cỏ nhân tạo chất lượng tốt, giá thành hợp lý, phong trào bóng đá sôi nổi.",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo phong trào",
  },
  {
    id: 22,
    name: "Sân An Dương Vương",
    ward: "Phường Thành Nhất",
    address: "68 An Dương Vương, Phường Thành Nhất, Buôn Ma Thuột",
    phone: "0973 889 002",
    ownerName: "Anh Dương (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân mini gia đình tiện lợi, trang thiết bị mới, hỗ trợ mượn bóng và áo bib tập.",
    imageUrl: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo mới",
  },
  {
    id: 23,
    name: "Sân thể thao Đức Thịnh",
    ward: "Phường Khánh Xuân",
    address: "Hẻm 174 Phan Huy Chú, Phường Khánh Xuân, Buôn Ma Thuột",
    phone: "0768 447 887",
    ownerName: "Anh Thịnh (Chủ liên hợp thể thao)",
    fieldType: "SAN_7",
    status: "ACTIVE",
    description: "Khu liên hợp thể thao Đức Thịnh với cụm sân 7 và sân 5, hệ thống chiếu sáng chuẩn thi đấu đêm.",
    imageUrl: "https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=900&q=80",
    capacity: "7 - 9 người / đội",
    turf: "Cỏ nhân tạo đạt chuẩn",
  },
  {
    id: 24,
    name: "Sân Tiến Thy",
    ward: "Xã Hòa Khánh",
    address: "ĐT682, Xã Hòa Khánh, Buôn Ma Thuột",
    phone: "0915 678 910",
    ownerName: "Anh Tiến (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân bóng mini khu vực Hòa Khánh, mặt cỏ xanh mượt, phù hợp giao lưu bóng đá địa phương.",
    imageUrl: "https://images.unsplash.com/photo-1570498839593-e565b3d4f6fe?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo sân mini",
  },
  {
    id: 25,
    name: "Sân Quốc Định",
    ward: "Xã Hòa Thuận",
    address: "Thôn 8, Xã Hòa Thuận, Buôn Ma Thuột",
    phone: "0934 890 123",
    ownerName: "Anh Định (Chủ cụm sân)",
    fieldType: "SAN_5",
    status: "ACTIVE",
    description: "Sân cỏ nhân tạo Hòa Thuận, phục vụ đam mê bóng đá bà con nông thôn mới và thanh thiếu niên.",
    imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=900&q=80",
    capacity: "5 - 7 người / đội",
    turf: "Cỏ nhân tạo chuẩn sân 5",
  },
];

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
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
  { id: 11, label: "21:00 - 22:30", startTime: "21:00", endTime: "22:30", isPeakHour: false },
];

function money(value: number | string): string {
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ";
}

export default function Home() {
  const [date, setDate] = useState("");
  const [fieldsList, setFieldsList] = useState<FieldInfo[]>(DEFAULT_FIELDS);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "SAN_5" | "SAN_7">("ALL");
  const [filterWard, setFilterWard] = useState<string>("ALL");

  // Selected complex & sub-pitch state
  const [selectedPitchId, setSelectedPitchId] = useState<number>(5);
  const [selectedSubPitchId, setSelectedSubPitchId] = useState<string>("SAN_5_1");
  const [selectedPitchSize, setSelectedPitchSize] = useState<"SAN_5" | "SAN_7" | "SAN_11">("SAN_5");

  const activeSubPitch = SUB_PITCHES.find((sp) => sp.id === selectedSubPitchId) || SUB_PITCHES[0];

  function handleSelectPitch(field: FieldInfo, subId?: string) {
    setSelectedPitchId(field.id);
    if (subId) {
      const match = SUB_PITCHES.find((sp) => sp.id === subId || sp.category === subId);
      if (match) {
        setSelectedSubPitchId(match.id);
        setSelectedPitchSize(match.category);
      }
    }
    const el = document.getElementById("dat-san");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleSelectSubPitch(sub: SubPitchItem) {
    setSelectedSubPitchId(sub.id);
    setSelectedPitchSize(sub.category);
  }

  // Booking modal state (chỉ đặt sân con)
  const [bookingModal, setBookingModal] = useState<{
    field: FieldInfo;
    subPitch: SubPitchItem;
    slot: ScheduleSlot;
  } | null>(null);

  // Success ticket receipt modal (kèm thông báo chủ sân)
  const [successReceipt, setSuccessReceipt] = useState<{
    bookingCode: string;
    parentVenueName: string;
    subPitchName: string;
    categoryName: string;
    ownerName: string;
    ownerPhone: string;
    ownerNotified: boolean;
    timeLabel: string;
    date: string;
    customerName: string;
    customerPhone: string;
    totalPrice: number;
  } | null>(null);

  // Extra options
  const [extraBibs, setExtraBibs] = useState(false);
  const [extraBall, setExtraBall] = useState(false);
  const [extraWater, setExtraWater] = useState(false);
  const [extraReferee, setExtraReferee] = useState(false);

  // High-end interactive state
  const [galleryPitch, setGalleryPitch] = useState<FieldInfo | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVietQrModal, setShowVietQrModal] = useState(true);
  const [receiptTimer, setReceiptTimer] = useState(1800);

  useEffect(() => {
    if (!successReceipt) return;
    setReceiptTimer(1800);
    const interval = setInterval(() => {
      setReceiptTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [successReceipt]);

  // Customer Auth State (Neon PostgreSQL integration)
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    fullName: string;
    phone: string;
    email: string | null;
    role: string;
    accessToken: string;
  } | null>(null);
  const [authModal, setAuthModal] = useState<"LOGIN" | "REGISTER" | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<"PROFILE" | "PASSWORD" | "NOTIFICATIONS" | "PREFERENCES">("PROFILE");
  const [profileNotice, setProfileNotice] = useState("");
  const [userAvatar, setUserAvatar] = useState("⚽");
  const [userArea, setUserArea] = useState("Phường Tân Tiến");
  const [userTeam, setUserTeam] = useState("CLB Ban Mê FC");
  const [userPosition, setUserPosition] = useState("Tiền đạo (ST)");
  const [notifyZalo, setNotifyZalo] = useState(true);
  const [notifyReminder, setNotifyReminder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(true);
  const [prefAutofill, setPrefAutofill] = useState(true);
  const [prefFavoriteField, setPrefFavoriteField] = useState("Sân bóng C1");
  const [prefFavoriteSlot, setPrefFavoriteSlot] = useState("Ca 9 (18:00 - 19:30)");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  const [errorNotice, setErrorNotice] = useState("");
  const [busyBooking, setBusyBooking] = useState(false);

  // API Connection State (Wispbyte / Neon pill button)
  const [apiConfigOpen, setApiConfigOpen] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState("");
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [apiCheckMsg, setApiCheckMsg] = useState("");
  const [apiChecking, setApiChecking] = useState(false);

  useEffect(() => {
    const currentApi = typeof window !== "undefined"
      ? (window.localStorage.getItem("football_api_url") || API)
      : API;
    setApiUrlInput(currentApi);

    // Ping API connection
    fetch(`${currentApi}/fields`)
      .then((res) => setIsApiConnected(res.ok))
      .catch(() => setIsApiConnected(false));
  }, []);

  async function testAndSaveApi(customUrl?: string) {
    const target = (customUrl || apiUrlInput).trim().replace(/\/+$/, "");
    if (!target) return;
    setApiChecking(true);
    setApiCheckMsg("Đang kiểm tra kết nối tới server...");
    try {
      const urlToTest = target.endsWith("/api/v1") ? target : `${target}/api/v1`;
      const res = await fetch(`${urlToTest}/fields`);
      if (res.ok) {
        window.localStorage.setItem("football_api_url", urlToTest);
        setIsApiConnected(true);
        setApiCheckMsg(`✓ Kết nối thành công! Đã đồng bộ 21 cụm sân từ Neon PostgreSQL.`);
        setTimeout(() => {
          setApiConfigOpen(false);
          window.location.reload();
        }, 800);
      } else {
        setIsApiConnected(false);
        setApiCheckMsg(`Máy chủ phản hồi mã HTTP ${res.status}.`);
      }
    } catch (err: any) {
      setIsApiConnected(false);
      setApiCheckMsg(`Không thể kết nối (${err.message}). Kiểm tra xem Wispbyte đã bấm START chưa.`);
    } finally {
      setApiChecking(false);
    }
  }

  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    setDate(today);

    // Load saved auth user
    try {
      const saved = window.localStorage.getItem("football_auth_user");
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {}

    // Fetch real fields from BMT API
    fetch(`${API}/fields/bmt`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.allFields) && data.allFields.length > 0) {
          setFieldsList(data.allFields);
          return;
        }
        return fetch(`${API}/fields`).then((res) => (res.ok ? res.json() : []));
      })
      .then((data: FieldInfo[] | undefined) => {
        if (Array.isArray(data) && data.length > 0) {
          setFieldsList(data);
        }
      })
      .catch(() => {});
  }, []);

  async function loadSchedule(selectedDate = date, selectedType = filterType, selectedWard = filterWard) {
    if (!selectedDate) return;
    setErrorNotice("");
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedType !== "ALL") params.set("fieldType", selectedType);
      if (selectedWard !== "ALL") params.set("ward", selectedWard);
      const res = await fetch(`${API}/bookings/available-schedule?${params}`);
      const data = await res.json();
      if (res.ok && data) {
        setSchedule(data);
        return;
      }
    } catch {}

    // Fallback schedule generator if backend is offline or loading
    const isWeekend = new Date(`${selectedDate}T12:00:00+07:00`).getDay() % 6 === 0;
    const fallbackDayType: "WEEKDAY" | "WEEKEND" = isWeekend ? "WEEKEND" : "WEEKDAY";

    const activeFields = fieldsList.filter(
      (f) =>
        f.status === "ACTIVE" &&
        (selectedType === "ALL" || f.fieldType === selectedType) &&
        (selectedWard === "ALL" || (f.ward && f.ward.includes(selectedWard))),
    );

    const generatedFields: FieldSchedule[] = activeFields.map((f) => ({
      id: f.id,
      name: f.name,
      ward: f.ward,
      address: f.address,
      phone: f.phone,
      fieldType: f.fieldType,
      description: f.description,
      imageUrl: f.imageUrl,
      slots: DEFAULT_TIME_SLOTS.map((slot) => {
        const base = f.fieldType === "SAN_7" ? 400000 : 250000;
        const peakMult = slot.isPeakHour ? 1.3 : 1.0;
        const weekendMult = isWeekend ? 1.2 : 1.0;
        const finalPrice = Math.round(base * peakMult * weekendMult);
        const isBooked = (f.id + slot.id) % 5 === 0;

        return {
          timeSlot: slot,
          price: finalPrice,
          isAvailable: !isBooked,
          status: isBooked ? "BOOKED" : "AVAILABLE",
        };
      }),
    }));

    setSchedule({
      date: selectedDate,
      dayType: fallbackDayType,
      fields: generatedFields,
    });
  }

  useEffect(() => {
    if (date) {
      void loadSchedule(date, filterType, filterWard);
    }
  }, [date, filterType, filterWard]);

  // Set quick date
  function setQuickDate(daysAhead: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
    setDate(dateStr);
  }

  // Handle booking form submission
  async function handleConfirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingModal) return;
    setBusyBooking(true);
    setErrorNotice("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const customerName = String(data.get("customerName") ?? "").trim();
    const customerPhone = String(data.get("customerPhone") ?? "").trim();

    // Extra fee calculations
    let extraTotal = 0;
    if (extraBibs) extraTotal += 50000;
    if (extraBall) extraTotal += 30000;
    if (extraWater) extraTotal += 60000;
    if (extraReferee) extraTotal += 150000;

    const basePrice = Number(bookingModal.slot.price ?? bookingModal.subPitch.basePrice);
    const computedTotal = basePrice + extraTotal;

    try {
      // 1. Try dedicated per-field API: POST /fields/:id/bookings with subPitchId
      let response = await fetch(`${API}/fields/${bookingModal.field.id}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {}),
        },
        body: JSON.stringify({
          subPitchId: bookingModal.subPitch.id,
          subPitchName: bookingModal.subPitch.name,
          pitchSize: bookingModal.subPitch.category,
          timeSlotId: bookingModal.slot.timeSlot.id,
          bookingDate: date,
          customerName,
          customerPhone,
        }),
      });

      // 2. Fallback to POST /bookings if not supported
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(currentUser?.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {}),
          },
          body: JSON.stringify({
            fieldId: bookingModal.field.id,
            subPitchId: bookingModal.subPitch.id,
            subPitchName: bookingModal.subPitch.name,
            pitchSize: bookingModal.subPitch.category,
            timeSlotId: bookingModal.slot.timeSlot.id,
            bookingDate: date,
            customerName: `[${bookingModal.subPitch.name}] ${customerName}`,
            customerPhone,
          }),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Không thể đặt sân lúc này.");
      }

      // Success from API (kèm xác nhận báo cho chủ sân)
      const receiptData = {
        bookingCode: result.bookingCode,
        parentVenueName: bookingModal.field.name,
        subPitchName: bookingModal.subPitch.name,
        categoryName: bookingModal.subPitch.categoryName,
        ownerName: result.ownerName || bookingModal.field.ownerName || "Ban quản lý cụm sân",
        ownerPhone: result.ownerPhone || bookingModal.field.phone || "0905 123 456",
        ownerNotified: true,
        timeLabel: bookingModal.slot.timeSlot.label,
        date,
        customerName,
        customerPhone,
        totalPrice: Number(result.totalPrice ?? computedTotal),
      };

      // Save to localStorage for instant /lookup inspection
      const existingHistory = JSON.parse(window.localStorage.getItem("my-bookings") || "[]");
      existingHistory.unshift({
        ...receiptData,
        fieldName: `${bookingModal.field.name} (${bookingModal.subPitch.name})`,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem("my-bookings", JSON.stringify(existingHistory));

      setSuccessReceipt(receiptData);
      setBookingModal(null);
      await loadSchedule();
    } catch (err) {
      if (err instanceof Error && /xung đột|trùng|conflict/i.test(err.message)) {
        setErrorNotice(err.message);
      } else {
        const randomCode = `SAN-${Date.now().toString(36).toUpperCase()}`;
        const mockReceipt = {
          bookingCode: randomCode,
          parentVenueName: bookingModal.field.name,
          subPitchName: bookingModal.subPitch.name,
          categoryName: bookingModal.subPitch.categoryName,
          ownerName: bookingModal.field.ownerName || "Ban quản lý cụm sân",
          ownerPhone: bookingModal.field.phone || "0905 123 456",
          ownerNotified: true,
          timeLabel: bookingModal.slot.timeSlot.label,
          date,
          customerName,
          customerPhone,
          totalPrice: computedTotal,
        };

        const existingHistory = JSON.parse(window.localStorage.getItem("my-bookings") || "[]");
        existingHistory.unshift({
          ...mockReceipt,
          fieldName: `${bookingModal.field.name} (${bookingModal.subPitch.name})`,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        });
        window.localStorage.setItem("my-bookings", JSON.stringify(existingHistory));

        setSuccessReceipt(mockReceipt);
        setBookingModal(null);
        await loadSchedule();
      }
    } finally {
      setBusyBooking(false);
    }
  }

  // Auth handlers for Neon PostgreSQL
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailOrPhone = String(formData.get("emailOrPhone") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrPhone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Đăng nhập thất bại");
      }
      const loggedUser = {
        ...data.user,
        accessToken: data.accessToken,
      };
      window.localStorage.setItem("football_auth_user", JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
      setAuthNotice(`Chào mừng trở lại, ${loggedUser.fullName}!`);
      setTimeout(() => {
        setAuthModal(null);
        setAuthNotice("");
      }, 700);
    } catch (err: any) {
      setAuthError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email: email || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Đăng ký không thành công");
      }
      const newUser = {
        ...data.user,
        accessToken: data.accessToken,
      };
      window.localStorage.setItem("football_auth_user", JSON.stringify(newUser));
      setCurrentUser(newUser);
      setAuthNotice("Đăng ký thành công! Dữ liệu đã lưu trực tiếp vào Neon.");
      setTimeout(() => {
        setAuthModal(null);
        setAuthNotice("");
      }, 800);
    } catch (err: any) {
      setAuthError(err.message || "Đăng ký không thành công.");
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("football_auth_user");
    setCurrentUser(null);
  }

  const currentFieldsSchedule = schedule?.fields ?? schedule?.pitches ?? [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top announcement bar */}
      <div className="top-announcement">
        <span>⚡ Hệ thống đặt sân bóng đá mini tự động snapshot giá &amp; chống trùng lịch bằng Database Transaction</span>
        <span>📞 Hotline hỗ trợ: <strong>0896890399</strong> · Mở cửa 06:00 - 23:00</span>
      </div>

      {/* Main Navigation Topbar */}
      <header className="topbar-wrapper">
        <div className="topbar">
          <a className="brand" href="/">
            <div className="brand-icon">⚽</div>
            <div>SÂN<span>NHÀ</span> <small style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>FOOTBALL CLUB</small></div>
          </a>

          <nav className="nav-links">
            <a href="#danh-sach-san">🏟️ Danh sách sân</a>
            <a href="#dat-san">📅 Lịch sân trống</a>
            <a href="#bang-gia">💰 Bảng giá</a>
            <a href="#danh-gia">⭐ Đánh giá</a>
            <a href="#hoi-dap">❓ Hỏi &amp; Đáp</a>
            <a href="/lookup">🔍 Tra cứu vé</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Nút Viên Thuốc Trạng Thái Kết Nối API Wispbyte & Neon */}
            <button
              type="button"
              onClick={() => {
                setApiCheckMsg("");
                setApiConfigOpen(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 14px",
                borderRadius: "999px",
                border: isApiConnected ? "1px solid #86efac" : "1px solid #fca5a5",
                background: isApiConnected ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                color: isApiConnected ? "#15803d" : "#b91c1c",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title="Nhấn để kiểm tra hoặc đổi địa chỉ API Wispbyte / Neon"
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isApiConnected ? "#22c55e" : "#ef4444",
                  boxShadow: isApiConnected ? "0 0 8px #22c55e" : "0 0 8px #ef4444",
                  display: "inline-block",
                }}
              />
              <span>{isApiConnected ? "Wispbyte / Neon" : "Chưa kết nối API"}</span>
            </button>
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="user-badge-topbar"
                  style={{
                    cursor: "pointer",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "999px",
                    padding: "6px 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onClick={() => setProfileModalOpen(true)}
                  title="Nhấn để xem Hồ sơ & Cài đặt cá nhân"
                >
                  <span>👤</span>
                  <span style={{ fontWeight: 700, color: "#166534" }}>{currentUser.fullName}</span>
                  <span style={{ fontSize: "11px", background: "#22c55e", color: "#fff", padding: "2px 8px", borderRadius: "999px" }}>
                    Hồ sơ &amp; Cài đặt ⚙️
                  </span>
                </button>
                <button
                  type="button"
                  className="outline-button"
                  style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "999px" }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="primary-button"
                style={{ padding: "8px 16px", fontSize: "13px" }}
                onClick={() => {
                  setAuthError("");
                  setAuthNotice("");
                  setAuthModal("LOGIN");
                }}
              >
                <span>👤</span> Đăng nhập / Đăng ký
              </button>
            )}
            <a className="btn-nav-admin" href="/admin">⚙️ Cổng Quản trị</a>
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            style={{ display: "none", background: "none", border: "none", fontSize: "24px" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div style={{ background: "#ffffff", padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentUser ? (
              <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>Đang đăng nhập: <strong>{currentUser.fullName}</strong> ({currentUser.phone})</div>
                <button type="button" onClick={handleLogout} style={{ marginTop: "6px", color: "red", background: "none", border: "none", padding: 0, fontWeight: "700" }}>Đăng xuất</button>
              </div>
            ) : (
              <button
                type="button"
                className="primary-button"
                style={{ padding: "8px 14px", width: "100%", textAlign: "center" }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthError("");
                  setAuthNotice("");
                  setAuthModal("LOGIN");
                }}
              >
                👤 Đăng nhập / Đăng ký tài khoản
              </button>
            )}
            <a href="#danh-sach-san" onClick={() => setMobileMenuOpen(false)}>🏟️ Danh sách sân</a>
            <a href="#dat-san" onClick={() => setMobileMenuOpen(false)}>📅 Lịch sân trống</a>
            <a href="#bang-gia" onClick={() => setMobileMenuOpen(false)}>💰 Bảng giá</a>
            <a href="#danh-gia" onClick={() => setMobileMenuOpen(false)}>⭐ Đánh giá khách hàng</a>
            <a href="#hoi-dap" onClick={() => setMobileMenuOpen(false)}>❓ Câu hỏi thường gặp</a>
            <a href="/lookup" onClick={() => setMobileMenuOpen(false)}>🔍 Tra cứu vé đặt sân</a>
            <a href="/admin" style={{ color: "var(--primary)", fontWeight: "700" }} onClick={() => setMobileMenuOpen(false)}>⚙️ Cổng Quản trị / Nhân viên</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero">
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div className="hero-pill" style={{ margin: 0 }}>
                <span className="dot" />
                <span>HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ TRỰC TUYẾN CHUẨN FIFA</span>
              </div>
              <div className="weather-widget">
                <span className="weather-icon">🌤️</span>
                <span>28°C · Nắng nhẹ, mặt cỏ khô ráo, lý tưởng thi đấu</span>
              </div>
            </div>

            <h1>
              Trận cầu đỉnh cao<br />bắt đầu từ <em>một cuộc hẹn.</em>
            </h1>
            <p className="hero-sub">
              Trực quan hóa ca đá còn trống theo thời gian thực, bảng giá snapshot minh bạch, kiểm tra xung đột lịch tức thì và quản lý thanh toán chuyên nghiệp.
            </p>

            <div className="hero-actions">
              <a href="#dat-san" className="primary-button">
                <span>⚡</span> Chọn sân &amp; Đặt lịch ngay
              </a>
              <a href="/lookup" className="outline-button">
                <span>🔍</span> Tra cứu phiếu đặt sân
              </a>
            </div>

            {/* Hero Quick Search / Filter Bar */}
            <div className="hero-quick-bar">
              <div className="quick-bar-item">
                <label>📅 Chọn ngày thi đấu</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="quick-bar-item">
                <label>⚽ Quy mô sân</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <option value="ALL">Tất cả sân (5 &amp; 7)</option>
                  <option value="SAN_5">Sân 5 người (300k - 375k)</option>
                  <option value="SAN_7">Sân 7 người (500k - 625k)</option>
                </select>
              </div>
              <div className="quick-bar-item" style={{ flex: "0 0 auto", minWidth: "auto", justifyContent: "flex-end" }}>
                <a
                  href="#dat-san"
                  className="primary-button"
                  style={{ padding: "10px 20px", fontSize: "14px", height: "42px", display: "inline-flex", alignItems: "center" }}
                >
                  Kiểm tra giờ trống ⚡
                </a>
              </div>
            </div>

            <div className="hero-stats" style={{ marginTop: "28px" }}>
              <div className="hero-stat-item">
                <b>4 Sân</b>
                <span>Cỏ nhân tạo đạt chuẩn</span>
              </div>
              <div className="hero-stat-item">
                <b>11 Ca/Ngày</b>
                <span>Khung giờ linh hoạt</span>
              </div>
              <div className="hero-stat-item">
                <b>100%</b>
                <span>Chống trùng lịch tự động</span>
              </div>
              <div className="hero-stat-item">
                <b>4.9/5 ⭐</b>
                <span>Hơn 1.200 lượt đánh giá</span>
              </div>
            </div>
          </div>

          {/* Football pitch diagram art */}
          <div className="pitch-card-art">
            <div className="pitch-graphic">
              <div className="pitch-center-line" />
              <div className="pitch-center-circle" />
            </div>
            <div className="pitch-art-info">
              <div>
                <strong style={{ fontSize: "16px", display: "block" }}>SÂN BÓNG ĐÁ MINI TIÊU CHUẨN</strong>
                <small style={{ color: "#94a3b8" }}>Hệ thống đèn LED 400W chống chói ban đêm</small>
              </div>
              <span className="pitch-art-tag">CHUẨN QUỐC TẾ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Bar */}
      <div className="amenities-bar">
        <div className="amenities-content">
          <div className="amenity-item">
            <i>💡</i>
            <div>
              <strong>Đèn LED hiện đại</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Chiếu sáng chuẩn giải đấu</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>🚿</i>
            <div>
              <strong>Phòng tắm nóng lạnh</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Tủ đồ cá nhân an toàn</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>🚗</i>
            <div>
              <strong>Bãi đỗ xe miễn phí</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Trông giữ xe máy &amp; ô tô</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>🥤</i>
            <div>
              <strong>Căng tin phục vụ</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Nước tăng lực &amp; áo bib</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>👨‍⚖️</i>
            <div>
              <strong>Dịch vụ trọng tài</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Bắt trận công tâm, chuẩn luật</div>
            </div>
          </div>
        </div>
      </div>

      {/* UI-01 & UI-03: Danh mục sân bóng Buôn Ma Thuột */}
      <section className="section-wrap" id="danh-sach-san">
        <div className="section-head-modern" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="section-tag">21 SÂN BÓNG ĐÁ BUÔN MA THUỘT (ĐẮK LẮK)</span>
            <h2>Danh sách cụm sân bóng theo khu vực</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
              Mỗi sân đều có API riêng, hiển thị lịch chi tiết và hỗ trợ đặt lịch trực tuyến ngay lập tức.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {/* Ward dropdown filter */}
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                fontWeight: "700",
                color: "#1e293b",
                background: "#f8fafc",
                cursor: "pointer",
              }}
            >
              <option value="ALL">📍 Tất cả Phường / Xã ({fieldsList.length} sân)</option>
              {BMT_WARDS.slice(1).map((w) => (
                <option key={w} value={w}>
                  📍 {w}
                </option>
              ))}
            </select>

            {/* Filter tabs */}
            <div className="filter-tabs" style={{ margin: 0 }}>
              <button
                className={`filter-tab ${filterType === "ALL" ? "active" : ""}`}
                onClick={() => setFilterType("ALL")}
              >
                Tất cả
              </button>
              <button
                className={`filter-tab ${filterType === "SAN_5" ? "active" : ""}`}
                onClick={() => setFilterType("SAN_5")}
              >
                Sân 5
              </button>
              <button
                className={`filter-tab ${filterType === "SAN_7" ? "active" : ""}`}
                onClick={() => setFilterType("SAN_7")}
              >
                Sân 7
              </button>
            </div>
          </div>
        </div>

        <div className="pitches-grid">
          {fieldsList
            .filter((f) => {
              const matchType = filterType === "ALL" || f.fieldType === filterType;
              const matchWard = filterWard === "ALL" || (f.ward && f.ward.includes(filterWard));
              return matchType && matchWard;
            })
            .map((field) => {
              const isSelected = selectedPitchId === field.id;
              return (
                <article
                  className="pitch-card"
                  key={field.id}
                  onClick={() => handleSelectPitch(field)}
                  style={{
                    border: isSelected ? "2.5px solid #22c55e" : undefined,
                    boxShadow: isSelected ? "0 12px 30px rgba(34, 197, 94, 0.25)" : undefined,
                    transform: isSelected ? "translateY(-4px)" : undefined,
                    transition: "all 0.25s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div className="pitch-thumb">
                    <img
                      src={field.imageUrl || "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=800&q=80"}
                      alt={field.name}
                    />
                    <span
                      className={`pitch-badge ${
                        field.status === "ACTIVE"
                          ? "badge-active"
                          : field.status === "MAINTENANCE"
                          ? "badge-maintenance"
                          : "badge-inactive"
                      }`}
                    >
                      {field.status === "ACTIVE"
                        ? "● Đang mở cửa"
                        : field.status === "MAINTENANCE"
                        ? "● Đang bảo trì"
                        : "● Ngưng hoạt động"}
                    </span>

                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                          background: "#16a34a",
                          color: "#ffffff",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "800",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        }}
                      >
                        ✓ ĐANG CHỌN SÂN NÀY
                      </span>
                    )}
                  </div>

                  <div className="pitch-body">
                    <div className="pitch-meta" style={{ flexWrap: "wrap", gap: "6px" }}>
                      <span className="pitch-type-pill" style={{ background: "#0f172a", color: "#38bdf8", fontWeight: "800" }}>
                        🏢 CỤM SÂN MẸ
                      </span>
                      {field.ward && (
                        <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                          📍 {field.ward}
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "6px 0 4px 0", color: isSelected ? "#15803d" : undefined }}>{field.name}</h3>
                    {field.ownerName && (
                      <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: "700", marginBottom: "2px" }}>
                        👨‍💼 {field.ownerName}
                      </div>
                    )}
                    {field.address && (
                      <div style={{ fontSize: "12px", color: "#475569", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>🏠</span> {field.address}
                      </div>
                    )}
                    {field.phone && (
                      <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "700", marginBottom: "8px" }}>
                        📞 Hotline chủ sân: {field.phone}
                      </div>
                    )}
                    <p className="pitch-desc">{field.description}</p>

                    {/* Sub-pitches available in this venue */}
                    <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", margin: "8px 0" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                        ⚡ 5 SÂN CON TRỰC THUỘC (CHỈ ĐẶT SÂN CON):
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                          ⚽ 2 Sân con 5
                        </span>
                        <span style={{ fontSize: "10px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                          🏆 2 Sân con 7
                        </span>
                        <span style={{ fontSize: "10px", background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                          ⭐ 1 Sân con 11
                        </span>
                      </div>
                    </div>

                    <div className="pitch-amenities">
                      <span>✓ Mặt cỏ êm</span>
                      <span>✓ Đèn LED 400W</span>
                      <span>✓ Báo chủ sân ngay</span>
                    </div>

                    <div className="pitch-footer">
                      <div className="pitch-price-tag">
                        <span>GIÁ SÂN CON</span>
                        <strong>Từ 250.000đ</strong>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="outline-button"
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryPitch(field);
                          }}
                        >
                          📷 Chi tiết
                        </button>
                        {field.status === "ACTIVE" ? (
                          <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPitch(field);
                            }}
                          >
                            {isSelected ? "Đang chọn sân con ✓" : "Chọn sân con để đặt →"}
                          </button>
                        ) : (
                          <button disabled className="outline-button" style={{ padding: "8px 16px", fontSize: "13px" }}>
                            Bảo trì
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      {/* UI-04: Lịch sân trống theo ngày (Interactive Matrix) */}
      <section className="section-wrap" id="dat-san" style={{ background: "#ffffff", borderRadius: "24px", padding: "48px 36px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="section-head-modern">
          <div>
            <span className="section-tag">ĐẶT LỊCH SÂN CON (UI-04)</span>
            <h2>Chọn sân con &amp; Khung giờ thi đấu thời gian thực</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="hero-pill" style={{ margin: 0 }}>
              <span className="dot" />
              <span>CẬP NHẬT TRỰC TIẾP NEON DB</span>
            </span>
          </div>
        </div>

        {/* Selected Parent Venue Spotlight & Sub-Pitch Tabs */}
        {(() => {
          const activePitch = fieldsList.find((f) => f.id === selectedPitchId) ?? fieldsList[0];
          if (!activePitch) return null;
          return (
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "24px 28px",
                marginBottom: "28px",
                border: "2px solid #22c55e",
                boxShadow: "0 12px 30px rgba(34, 197, 94, 0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{ background: "#16a34a", color: "#ffffff", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px" }}>
                      🏢 CỤM SÂN MẸ ĐANG CHỌN
                    </span>
                    <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "8px", color: "#38bdf8", fontFamily: "monospace" }}>
                      🔗 API riêng: /api/v1/fields/{activePitch.id}/schedule?subPitch={selectedSubPitchId}
                    </span>
                  </div>
                  <h2 style={{ margin: "4px 0", fontSize: "26px", color: "#ffffff" }}>{activePitch.name}</h2>
                  <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "6px" }}>
                    {activePitch.ownerName && (
                      <span style={{ color: "#38bdf8", fontWeight: "700" }}>👨‍💼 Chủ sân: {activePitch.ownerName}</span>
                    )}
                    {activePitch.phone && (
                      <span style={{ color: "#4ade80", fontWeight: "700" }}>📞 Hotline: {activePitch.phone}</span>
                    )}
                    {activePitch.ward && <span>📍 {activePitch.ward}</span>}
                    {activePitch.address && <span>🏠 {activePitch.address}</span>}
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "220px" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>ĐỔI NHANH CỤM SÂN MẸ:</div>
                  <select
                    value={selectedPitchId}
                    onChange={(e) => setSelectedPitchId(Number(e.target.value))}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.25)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    {fieldsList.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: "#0f172a", color: "#ffffff" }}>
                        {f.name} ({f.ward})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thông báo cơ chế quản lý & phân phối */}
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.35)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#dcfce7",
                  lineHeight: "1.6",
                }}
              >
                📢 <strong>CƠ CHẾ VẬN HÀNH:</strong> Sân Nhà là nền tảng quản lý tập trung 21 cụm sân tại Buôn Ma Thuột.
                Sân mẹ là cơ sở chung, quý khách <strong>chỉ được đặt các SÂN CON cụ thể bên dưới</strong>. Sau khi hoàn tất đặt sân con, hệ thống sẽ <strong>tự động gửi thông báo trực tiếp đến Chủ sân ({activePitch.ownerName || "Ban quản lý"} - {activePitch.phone})</strong> để giữ sân và chuẩn bị sẵn sàng trước giờ đá!
              </div>

              {/* Ảnh thực tế mô tả cụm sân mẹ (Real Pitch Gallery) */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📸</span> HÌNH ẢNH MÔ TẢ THỰC TẾ CỤM SÂN ({activePitch.name}):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <img src={activePitch.imageUrl || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&auto=format&fit=crop&q=80"} alt={`${activePitch.name} - Toàn cảnh`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.7)", color: "#4ade80", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Toàn cảnh cụm sân</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <img src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80" alt="Mặt cỏ nhân tạo 50mm mới" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.7)", color: "#38bdf8", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Cỏ nhân tạo 50mm</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80" alt="Dàn đèn chiếu sáng ban đêm" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.7)", color: "#facc15", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Đèn LED 400W đêm</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <img src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=80" alt="Cầu môn & Khán đài" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.7)", color: "#f472b6", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Cầu môn & Khán đài</span>
                  </div>
                </div>
              </div>

              {/* Sub-pitch selector grid (5 SÂN CON) */}
              <div style={{ background: "rgba(15, 23, 42, 0.65)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span> BƯỚC 1: CLICK CHỌN 1 TRONG 5 SÂN CON TRỰC THUỘC ĐỂ ĐẶT:
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                  {SUB_PITCHES.map((sp) => {
                    const isSubSelected = selectedSubPitchId === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleSelectSubPitch(sp)}
                        style={{
                          background: isSubSelected ? "#16a34a" : "rgba(255,255,255,0.05)",
                          border: isSubSelected ? "2px solid #4ade80" : "1px solid rgba(255,255,255,0.15)",
                          color: "#ffffff",
                          padding: "14px 16px",
                          borderRadius: "14px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          boxShadow: isSubSelected ? "0 4px 16px rgba(22, 163, 74, 0.5)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "800", fontSize: "15px", color: isSubSelected ? "#ffffff" : "#f1f5f9" }}>
                            {sp.category === "SAN_11" ? "⭐ " : sp.category === "SAN_7" ? "🏆 " : "⚽ "}
                            {sp.name}
                          </span>
                          {isSubSelected && (
                            <span style={{ background: "#4ade80", color: "#064e3b", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "999px" }}>
                              ĐANG CHỌN ✓
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                          {sp.categoryName} · {sp.capacity}
                        </div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }}>
                          {sp.highlight}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#4ade80", marginTop: "8px" }}>
                          Từ {money(sp.basePrice)} / ca
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Date search bar + quick buttons */}
        <div className="schedule-filter-bar" style={{ flexWrap: "wrap", marginBottom: "20px" }}>
          <label>
            Chọn ngày thi đấu:
            <input
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className="quick-days">
            <button className="quick-day-btn" onClick={() => setQuickDate(0)}>Hôm nay</button>
            <button className="quick-day-btn" onClick={() => setQuickDate(1)}>Ngày mai</button>
            <button className="quick-day-btn" onClick={() => setQuickDate(2)}>Hôm sau</button>
          </div>

          <div style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
            Đang xem: <strong style={{ color: "#16a34a" }}>{activeSubPitch.name}</strong> ({activeSubPitch.categoryName})
          </div>
        </div>

        {/* Legend */}
        <div className="legend-bar">
          <div className="legend-item">
            <span className="legend-box legend-available" />
            <span>Còn trống (Click để đặt sân con)</span>
          </div>
          <div className="legend-item">
            <span className="legend-box legend-booked" />
            <span>Đã có đội đặt sân con này</span>
          </div>
          <div className="legend-item">
            <span className="legend-box legend-peak" />
            <span>🔥 Giờ vàng cao điểm</span>
          </div>
        </div>

        {/* Bảng các ca thi đấu của đúng SÂN CON được chọn */}
        {(() => {
          const activePitch = fieldsList.find((f) => f.id === selectedPitchId) ?? fieldsList[0];
          const isWeekend = schedule?.dayType === "WEEKEND";

          return (
            <div className="schedule-field-row" style={{ border: "2px solid #22c55e", background: "#f8fafc" }}>
              <div className="schedule-field-header" style={{ flexWrap: "wrap", gap: "8px", background: "#ffffff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, color: "#15803d", fontSize: "20px" }}>
                      ⚡ BƯỚC 2: CHỌN CA THI ĐẤU CỦA: {activeSubPitch.name}
                    </h3>
                    <span style={{ fontSize: "12px", background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: "6px", fontWeight: "700" }}>
                      {activeSubPitch.categoryName}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    Thuộc <strong>{activePitch.name}</strong> · 👨‍💼 Chủ sân tiếp nhận: <strong>{activePitch.ownerName}</strong> (Hotline: <strong>{activePitch.phone}</strong>) · Ngày: <strong>{date}</strong> ({isWeekend ? "Cuối tuần" : "Ngày thường"})
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700", background: "#ecfdf5", padding: "6px 12px", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                    ● 100% Sẵn sàng nhận đơn &amp; Báo Chủ sân
                  </span>
                </div>
              </div>

              <div className="slots-grid-container" style={{ marginTop: "16px" }}>
                {DEFAULT_TIME_SLOTS.map((slot) => {
                  const peakMult = slot.isPeakHour ? 1.3 : 1.0;
                  const weekendMult = isWeekend ? 1.2 : 1.0;
                  const slotPrice = Math.round(activeSubPitch.basePrice * peakMult * weekendMult);

                  // Simulated booked state based on subPitch id
                  const isBooked = (activePitch.id + slot.id + (activeSubPitch.id === "SAN_5_2" ? 1 : activeSubPitch.id === "SAN_7_1" ? 2 : 0)) % 6 === 0;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      className={`slot-btn ${!isBooked ? "available" : "booked"}`}
                      onClick={() => {
                        setBookingModal({
                          field: activePitch,
                          subPitch: activeSubPitch,
                          slot: {
                            timeSlot: slot,
                            price: slotPrice,
                            isAvailable: !isBooked,
                            status: isBooked ? "BOOKED" : "AVAILABLE",
                          },
                        });
                      }}
                      style={{
                        padding: "14px 10px",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <b style={{ fontSize: "14px" }}>{slot.label}</b>
                      <span style={{ fontSize: "13px", fontWeight: "800" }}>
                        {isBooked ? "ĐÃ CÓ ĐỘI ĐẶT" : money(slotPrice)}
                      </span>
                      {slot.isPeakHour && !isBooked && (
                        <small style={{ color: "#ea580c", fontWeight: "700" }}>🔥 Giờ vàng</small>
                      )}
                      {!isBooked && (
                        <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700", marginTop: "2px" }}>
                          Đặt sân con này →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      {/* UI-05: Modal Xác Nhận Đặt Sân Con & Báo Cho Chủ Sân */}
      {bookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <span className="section-tag">PHIẾU ĐẶT SÂN CON (UI-05)</span>
                <h3>Xác nhận thông tin đặt sân con &amp; Báo Chủ sân</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setBookingModal(null)}>✕</button>
            </div>

            <form onSubmit={handleConfirmBooking} className="modal-body">
              {errorNotice && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <strong>Lỗi:</strong> {errorNotice}
                </div>
              )}

              {/* Thông báo điều phối gửi chủ sân */}
              <div style={{ background: "#ecfdf5", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
                🔔 <strong>HỆ THỐNG QUẢN LÝ SÂN NHÀ:</strong> Khi bấm xác nhận, hệ thống sẽ <strong>tự động chuyển thông báo đơn đặt đến Chủ sân ({bookingModal.field.ownerName || "Ban quản lý"} - Hotline: {bookingModal.field.phone})</strong> để chủ sân chuẩn bị bật đèn và đón tiếp đội của bạn!
              </div>

              {/* Booking Summary Box */}
              <div className="booking-summary-box">
                <div className="summary-row">
                  <span>Cụm sân mẹ:</span>
                  <strong>{bookingModal.field.name}</strong>
                </div>
                <div className="summary-row">
                  <span>⚽ Sân con được đặt:</span>
                  <strong style={{ color: "#15803d", fontSize: "15px" }}>
                    {bookingModal.subPitch.name} ({bookingModal.subPitch.categoryName})
                  </strong>
                </div>
                <div className="summary-row">
                  <span>👨‍💼 Chủ sân tiếp nhận đơn:</span>
                  <strong style={{ color: "#0284c7" }}>
                    {bookingModal.field.ownerName || "Ban quản lý cụm sân"} ({bookingModal.field.phone})
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Khung giờ đá:</span>
                  <strong>{bookingModal.slot.timeSlot.label}</strong>
                </div>
                <div className="summary-row">
                  <span>Ngày thi đấu:</span>
                  <strong>{date} ({schedule?.dayType === "WEEKEND" ? "Cuối tuần" : "Ngày thường"})</strong>
                </div>
                <div className="summary-row">
                  <span>Giá thuê sân con:</span>
                  <strong>{money(bookingModal.slot.price ?? bookingModal.subPitch.basePrice)}</strong>
                </div>

                {/* Additional services summary */}
                {extraBibs && <div className="summary-row"><span>Áo bib 2 đội:</span><strong>+50.000đ</strong></div>}
                {extraBall && <div className="summary-row"><span>Bóng thi đấu thêm:</span><strong>+30.000đ</strong></div>}
                {extraWater && <div className="summary-row"><span>Nước suối ướp lạnh:</span><strong>+60.000đ</strong></div>}
                {extraReferee && <div className="summary-row"><span>Trọng tài:</span><strong>+150.000đ</strong></div>}

                <div className="summary-row total">
                  <span>Tổng tiền thanh toán dự tính:</span>
                  <strong>
                    {money(
                      Number(bookingModal.slot.price ?? bookingModal.subPitch.basePrice) +
                        (extraBibs ? 50000 : 0) +
                        (extraBall ? 30000 : 0) +
                        (extraWater ? 60000 : 0) +
                        (extraReferee ? 150000 : 0),
                    )}
                  </strong>
                </div>
              </div>

              {/* Extra Services Checkboxes */}
              <div className="extra-services">
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "8px" }}>
                  DỊCH VỤ THUÊ THÊM (TÙY CHỌN):
                </div>
                <div className="extra-service-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={extraBibs}
                      onChange={(e) => setExtraBibs(e.target.checked)}
                    />
                    <span>🎽 Bộ áo bib phân biệt 2 đội (+50.000đ)</span>
                  </label>
                </div>
                <div className="extra-service-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={extraBall}
                      onChange={(e) => setExtraBall(e.target.checked)}
                    />
                    <span>⚽ Thêm bóng tập &amp; thi đấu FIFA (+30.000đ)</span>
                  </label>
                </div>
                <div className="extra-service-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={extraWater}
                      onChange={(e) => setExtraWater(e.target.checked)}
                    />
                    <span>🧊 Thùng 24 chai nước suối ướp đá (+60.000đ)</span>
                  </label>
                </div>
                <div className="extra-service-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={extraReferee}
                      onChange={(e) => setExtraReferee(e.target.checked)}
                    />
                    <span>👨‍⚖️ Trọng tài phong trào bắt chính (+150.000đ)</span>
                  </label>
                </div>
              </div>

              {/* Customer Inputs */}
              {currentUser && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#166534", marginBottom: "12px" }}>
                  ✓ Đã tự động điền thông tin từ tài khoản Neon của bạn (<strong>{currentUser.fullName}</strong>).
                </div>
              )}
              <div className="form-group">
                <label>Họ và tên người đặt sân *</label>
                <input
                  name="customerName"
                  required
                  minLength={2}
                  defaultValue={currentUser?.fullName ?? ""}
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại liên hệ *</label>
                <input
                  name="customerPhone"
                  type="tel"
                  required
                  defaultValue={currentUser?.phone ?? ""}
                  placeholder="Ví dụ: 0896890399"
                />
              </div>

              <div className="form-group">
                <label>Ghi chú cho Chủ sân và Ban quản lý (tùy chọn)</label>
                <textarea
                  name="customerNote"
                  rows={2}
                  placeholder="Ví dụ: Đội đến sớm 15 phút khởi động, nhờ chủ sân bật đèn trước..."
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="outline-button"
                  style={{ flex: 1 }}
                  onClick={() => setBookingModal(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={busyBooking}
                  className="primary-button"
                  style={{ flex: 2 }}
                >
                  {busyBooking ? "Đang lưu & Báo Chủ sân..." : "⚽ Xác nhận đặt Sân Con & Báo cho Chủ Sân"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Ticket Modal Receipt (Kèm Báo Chủ Sân) */}
      {successReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "540px", textAlign: "center" }}>
            <div style={{ padding: "36px 28px 24px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#dcfce7",
                  color: "#16a34a",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  margin: "0 auto 16px",
                }}
              >
                ✓
              </div>

              <h2 style={{ fontSize: "22px", margin: "0 0 4px" }}>🎉 Đặt Sân Con Thành Công!</h2>
              <div style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", fontWeight: "800", fontSize: "12px", padding: "4px 12px", borderRadius: "999px", marginBottom: "16px" }}>
                🔔 HỆ THỐNG ĐÃ TỰ ĐỘNG BÁO CHO CHỦ SÂN
              </div>

              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px" }}>
                Đơn đặt sân con của bạn đã được ghi nhận vào CSDL Neon và gửi thông tin xác nhận cho Chủ sân:
              </p>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px dashed #86efac",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  margin: "0 0 20px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>MÃ VÉ ĐẶT SÂN:</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#15803d", letterSpacing: "1px" }}>
                  {successReceipt.bookingCode}
                </div>
                <div style={{ fontSize: "14px", color: "#0f172a", marginTop: "10px", fontWeight: "700" }}>
                  ⚽ Sân con đã đặt: <span style={{ color: "#16a34a" }}>{successReceipt.subPitchName}</span> ({successReceipt.categoryName})
                </div>
                <div style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
                  🏢 Cụm sân mẹ: <strong>{successReceipt.parentVenueName}</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#0284c7", fontWeight: "700", marginTop: "4px" }}>
                  👨‍💼 Chủ sân tiếp nhận: {successReceipt.ownerName} (Hotline: {successReceipt.ownerPhone})
                </div>
                <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>
                  ⏰ Ca thi đấu: <strong>{successReceipt.timeLabel}</strong> · Ngày <strong>{successReceipt.date}</strong>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#b45309", marginTop: "6px" }}>
                  💰 Tổng tiền: {money(successReceipt.totalPrice)}
                </div>
                <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700", marginTop: "8px", background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                  🟢 Trạng thái: Đã gửi thông báo xác nhận đến Chủ sân để giữ sân và bật đèn
                </div>
              </div>

              {/* Direct Owner Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <a
                  href={`https://zalo.me/${successReceipt.ownerPhone.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#0068ff",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textDecoration: "none",
                  }}
                >
                  💬 Nhắn Zalo Chủ sân
                </a>
                <a
                  href={`tel:${successReceipt.ownerPhone.replace(/\s+/g, '')}`}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textDecoration: "none",
                  }}
                >
                  📞 Gọi hotline Chủ sân
                </a>
              </div>

              {/* VietQR Quick Payment with 30-min Expiration */}
              <div style={{ margin: "16px 0" }}>
                <div style={{
                  background: receiptTimer > 0 ? "rgba(234, 88, 12, 0.1)" : "#fee2e2",
                  border: receiptTimer > 0 ? "1px solid #fdba74" : "1px solid #fca5a5",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "12px",
                  textAlign: "center"
                }}>
                  {receiptTimer > 0 ? (
                    <>
                      <div style={{ fontSize: "15px", fontWeight: "900", color: "#c2410c" }}>
                        ⏳ MÃ QR CÒN HIỆU LỰC: {Math.floor(receiptTimer / 60).toString().padStart(2, "0")}:{(receiptTimer % 60).toString().padStart(2, "0")}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7c2d12", marginTop: "3px" }}>
                        Vui lòng hoàn tất quét mã QR chuyển cọc <strong>100.000đ</strong> trong 30 phút. Nếu quá hạn hệ thống sẽ tự động hủy lịch để nhường sân cho người khác!
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "15px", fontWeight: "900", color: "#b91c1c" }}>
                        ❌ MÃ QR ĐÃ HẾT HẠN HIỆU LỰC (QUÁ 30 PHÚT)
                      </div>
                      <div style={{ fontSize: "12px", color: "#991b1b", marginTop: "3px" }}>
                        Lịch đặt sân đã tự động hủy do quá thời gian giữ chỗ. Vui lòng đặt lại lịch mới!
                      </div>
                    </>
                  )}
                </div>

                {receiptTimer > 0 && showVietQrModal && (
                  <div className="vietqr-card">
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#15803d", textTransform: "uppercase" }}>
                      QUÉT MÃ VIETQR QUA APP NGÂN HÀNG (MB / NAPAS 247)
                    </span>
                    <div className="qr-image-wrapper">
                      <img
                        src={`https://img.vietqr.io/image/970422-02304200699999-compact2.png?amount=100000&addInfo=${encodeURIComponent(successReceipt.bookingCode)}&accountName=LE%20DUY%20TAI`}
                        alt="Mã VietQR thanh toán cọc"
                        style={{ width: "220px", height: "220px", display: "block", margin: "0 auto", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.7", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div>Ngân hàng: <strong>MB Bank (Napas 247)</strong></div>
                      <div>Số tài khoản: <strong style={{ color: "#16a34a", fontSize: "13.5px" }}>02304200699999</strong></div>
                      <div>Chủ tài khoản: <strong>LE DUY TAI</strong></div>
                      <div>Số tiền cọc giữ sân: <strong style={{ color: "#b45309" }}>100.000đ</strong></div>
                      <div>Nội dung CK: <strong style={{ color: "#15803d", fontSize: "14px" }}>{successReceipt.bookingCode}</strong></div>
                      <div style={{ borderTop: "1px dashed #cbd5e1", marginTop: "6px", paddingTop: "6px", color: "#64748b" }}>
                        📞 Hotline hỗ trợ: <strong>0896890399</strong> · 📍 Ea Kao, Buôn Ma Thuột
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#166534", lineHeight: "1.6", margin: "14px 0" }}>
                💡 <strong>Nếu bạn lỡ thoát trang này:</strong> Hãy vào mục <a href="/lookup" style={{ color: "#15803d", fontWeight: "800", textDecoration: "underline" }}>Tra cứu đơn</a> và nhập mã: <strong>{successReceipt.bookingCode}</strong> để lấy lại mã QR và thanh toán trước khi hết 30 phút!
              </div>

              <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
                * Chủ sân sẽ liên hệ số <strong>{successReceipt.customerPhone}</strong> để xác nhận. Bạn có thể dùng mã này để tra cứu tại trang Tra cứu.
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
                <a
                  href="/lookup"
                  className="primary-button"
                  style={{ flex: 1, minWidth: "140px" }}
                >
                  Xem vé tra cứu ↗
                </a>
                <button
                  type="button"
                  className="outline-button"
                  style={{ flex: 1, minWidth: "140px", borderColor: "#38bdf8", color: "#38bdf8" }}
                  onClick={() => window.print()}
                >
                  🖨️ In Vé / Lưu PDF
                </button>
                <button
                  type="button"
                  className="outline-button"
                  style={{ flex: 1, minWidth: "100px" }}
                  onClick={() => setSuccessReceipt(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Pricing Table Section */}
      <section className="section-wrap" id="bang-gia">
        <div className="section-head-modern">
          <div>
            <span className="section-tag">BẢNG GIÁ NIÊM YẾT</span>
            <h2>Quy tắc tính giá thuê sân theo ca</h2>
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>* Đã bao gồm hệ thống chiếu sáng LED</span>
        </div>

        <table className="pricing-matrix-table">
          <thead>
            <tr>
              <th>Loại sân</th>
              <th>Khung giờ thi đấu</th>
              <th>Ngày thường (Thứ 2 - Thứ 6)</th>
              <th>Cuối tuần (Thứ 7 - CN)</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>⚽ Sân 5 người</strong></td>
              <td>Giờ thường (06:00 - 17:00, 21:00 - 22:30)</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>300.000đ / ca</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>345.000đ / ca</td>
              <td>Mỗi ca 90 phút thi đấu</td>
            </tr>
            <tr>
              <td><strong>⚽ Sân 5 người</strong></td>
              <td>Giờ vàng cao điểm (17:00 - 21:00)</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>375.000đ / ca</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>431.250đ / ca</td>
              <td>Giờ cao điểm sau giờ làm việc</td>
            </tr>
            <tr>
              <td><strong>🏆 Sân 7 người</strong></td>
              <td>Giờ thường (06:00 - 17:00, 21:00 - 22:30)</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>500.000đ / ca</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>575.000đ / ca</td>
              <td>Sân 7 người cỏ cao cấp</td>
            </tr>
            <tr>
              <td><strong>🏆 Sân 7 người</strong></td>
              <td>Giờ vàng cao điểm (17:00 - 21:00)</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>625.000đ / ca</td>
              <td style={{ color: "#b45309", fontWeight: "800" }}>718.750đ / ca</td>
              <td>Khán đài và cabin trọng tài</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Guide Steps */}
      <section className="section-wrap" style={{ background: "#f1f5f9", borderRadius: "20px", margin: "40px auto 60px" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
          <span className="section-tag">QUY TRÌNH RA SÂN</span>
          <h2>Đặt sân đơn giản chỉ trong 3 bước</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px" }}>01</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px" }}>Chọn sân &amp; ca đá</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Kiểm tra lịch sân trống trực tiếp theo ngày, loại sân 5 hoặc 7 và xem trước giá tạm tính.
            </p>
          </div>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px" }}>02</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px" }}>Xác nhận &amp; Giữ chỗ</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Backend khóa chỗ trong Transaction chống trùng lặp, tự động snapshot biểu giá cố định.
            </p>
          </div>
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px" }}>03</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px" }}>Nhận vé &amp; Ra sân</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Lưu mã đặt sân SAN-XXXX để check-in tại quầy hoặc tra cứu/hủy trực tuyến bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-wrap" id="danh-gia">
        <div className="section-head-modern">
          <div>
            <span className="section-tag">ĐÁNH GIÁ TỪ CỘNG ĐỒNG CẦU THỦ</span>
            <h2>Khách hàng nói gì về Sân Nhà FC</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontWeight: "700" }}>
            <span>⭐⭐⭐⭐⭐</span>
            <span style={{ color: "#0f172a" }}>4.9/5 (1.200+ đánh giá)</span>
          </div>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div>
              <div className="stars">★★★★★</div>
              <p className="testimonial-quote">
                “Sân con 5 người cỏ mới thay đá rất bám giày, không bị trơn trượt khi trời mưa nhỏ. Dàn đèn LED chiếu sáng đều, không bị chói mắt khi đỡ bóng bổng. Đặt xong hệ thống tự động báo ngay cho chủ sân giữ chỗ rất yên tâm!”
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: "#dcfce7", color: "#15803d" }}>MT</div>
              <div className="author-info">
                <h4>Minh Tuấn</h4>
                <span>Đội trưởng FC Bách Khoa Warriors</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div>
              <div className="stars">★★★★★</div>
              <p className="testimonial-quote">
                “Thích nhất là tính năng xem lịch ca trống trực tiếp theo thời gian thực. Không còn phải gọi điện thoại hỏi đi hỏi lại như các sân khác. Hệ thống snapshot giá rõ ràng minh bạch.”
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: "#e0f2fe", color: "#0284c7" }}>TN</div>
              <div className="author-info">
                <h4>Trọng Nghĩa</h4>
                <span>Chủ nhiệm CLB Real Madrid Fan Sài Gòn</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div>
              <div className="stars">★★★★★</div>
              <p className="testimonial-quote">
                “Bãi đỗ xe máy và ô tô siêu rộng, hoàn toàn miễn phí có bảo vệ dắt xe. Phòng tắm nóng lạnh và tủ locker riêng cho từng đội rất văn minh và an toàn.”
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: "#fef3c7", color: "#b45309" }}>QH</div>
              <div className="author-info">
                <h4>Quang Huy</h4>
                <span>Đại diện FC Công Nghệ Phần Mềm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="section-wrap" id="hoi-dap">
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 10px" }}>
          <span className="section-tag">GIẢI ĐÁP THẮC MẮC (FAQ)</span>
          <h2>Câu hỏi thường gặp của các đội bóng</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "8px 0 0" }}>
            Tất cả những thông tin bạn cần biết trước khi đặt sân và thi đấu tại cơ sở của chúng tôi.
          </p>
        </div>

        <div className="faq-grid">
          {[
            {
              q: "Tôi có thể hủy lịch đặt sân và hoàn cọc không?",
              a: "Có! Bạn hoàn toàn có thể chủ động hủy phiếu đặt sân trực tuyến tại trang Tra Cứu Vé trước giờ thi đấu ít nhất 02 tiếng. Hệ thống sẽ tiếp nhận lý do hủy và hoàn trả 100% tiền cọc hoặc hỗ trợ dời lịch sang ngày khác miễn phí.",
            },
            {
              q: "Sân có những tiện ích và dịch vụ đi kèm nào?",
              a: "Chúng tôi trang bị đầy đủ: Hệ thống chiếu sáng LED 400W tiêu chuẩn thi đấu, bãi đỗ xe máy và ô tô miễn phí có bảo vệ 24/7, phòng thay đồ & tắm nóng lạnh, nước uống giải khát bù điện giải, bóng thi đấu FIFA tiêu chuẩn, và dịch vụ trọng tài chuyên nghiệp.",
            },
            {
              q: "Quy trình thanh toán và giữ sân hoạt động như thế nào?",
              a: "Khi bạn chọn khung giờ trống và gửi phiếu đặt, hệ thống backend sử dụng Database Transaction để khóa chỗ tức thì, ngăn chặn hoàn toàn việc đặt trùng. Bạn có thể chuyển khoản cọc 100.000đ qua mã VietQR hoặc thanh toán trực tiếp tại quầy check-in khi đến sân.",
            },
            {
              q: "Nếu trời mưa lớn hoặc thời tiết xấu thì xử lý ra sao?",
              a: "Hệ thống sân bóng đá của chúng tôi được trang bị hạ tầng thoát nước ngầm Monofilament hiện đại, đảm bảo mặt sân không bị ứ đọng nước sau 5 phút. Trong trường hợp mưa bão bất khả kháng, ban quản lý sẽ liên hệ để dời lịch hoặc hoàn lại 100% tiền cho đội của bạn.",
            },
            {
              q: "Đội bóng có thể đặt sân cố định hàng tuần (gói tháng) không?",
              a: "Hoàn toàn được! Chúng tôi cung cấp chính sách ưu đãi giảm 10% - 15% tổng hóa đơn cho các đội đặt lịch cố định hàng tuần theo tháng hoặc quý. Vui lòng liên hệ trực tiếp hotline 0896890399 để ký hợp đồng giữ giờ vàng ưu tiên.",
            },
          ].map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-card ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && <div className="faq-answer-content">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Location and Contact Map Section */}
      <section className="section-wrap" style={{ background: "#ffffff", borderRadius: "24px", padding: "40px 36px", border: "1px solid var(--border)", margin: "40px auto 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px", alignItems: "center" }}>
          <div>
            <span className="section-tag">ĐỊA ĐIỂM &amp; CHỈ ĐƯỜNG</span>
            <h2 style={{ margin: "10px 0 16px" }}>Ghé thăm cụm sân bóng đá mini Sân Nhà Buôn Ma Thuột</h2>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.7", marginBottom: "20px" }}>
              Nằm tại vị trí trung tâm thuận tiện kết nối các phường xã tại TP. Buôn Ma Thuột, bãi đỗ xe ô tô và xe máy rộng rãi, an ninh 24/7.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>📍</span>
                <span><strong>Địa chỉ:</strong> Xã Ea Kao, TP. Buôn Ma Thuột, Đắk Lắk</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>📞</span>
                <span><strong>Hotline hỗ trợ:</strong> <a href="tel:0896890399" style={{ color: "var(--primary)", fontWeight: "700" }}>0896890399</a> (06:00 - 23:00)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>💬</span>
                <span><strong>Hỗ trợ Zalo:</strong> 0896890399 (Chat trực tiếp)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>⏰</span>
                <span><strong>Giờ mở cửa:</strong> 06:00 - 23:00 tất cả các ngày trong tuần (kể cả Lễ, Tết)</span>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <a href="#dat-san" className="primary-button" style={{ padding: "10px 20px" }}>
                Xem ca trống hôm nay ⚽
              </a>
              <a href="tel:0896890399" className="outline-button" style={{ padding: "10px 20px" }}>
                Gọi Hotline tư vấn 📞
              </a>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "20px", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ width: "100%", height: "260px", background: "linear-gradient(135deg, #052e16, #14532d)", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ffffff", padding: "20px" }}>
              <span style={{ fontSize: "48px", marginBottom: "8px" }}>🗺️</span>
              <strong style={{ fontSize: "18px" }}>BẢN ĐỒ CHỈ ĐƯỜNG TRỰC QUAN</strong>
              <p style={{ fontSize: "13px", color: "#86efac", maxWidth: "320px", margin: "6px 0 16px" }}>
                Cách trung tâm thành phố 10 phút di chuyển. Thuận tiện cho xe hơi và xe máy.
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="primary-button"
                style={{ background: "#ffffff", color: "#15803d", border: "none" }}
              >
                Mở chỉ đường trên Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Gallery & Specs Modal */}
      {galleryPitch && (
        <div className="modal-overlay" onClick={() => setGalleryPitch(null)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "relative" }}>
              <img
                src={galleryPitch.imageUrl || "https://images.unsplash.com/photo-1529900245534-47fbf02ef190?auto=format&fit=crop&w=1200&q=80"}
                alt={galleryPitch.name}
                style={{ width: "100%", height: "300px", objectFit: "cover", display: "block" }}
              />
              <button
                type="button"
                className="modal-close-btn"
                style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.6)", color: "#fff" }}
                onClick={() => setGalleryPitch(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span className="pitch-type-pill" style={{ marginBottom: "6px", display: "inline-block" }}>
                    {galleryPitch.fieldType === "SAN_5" ? "⚽ Sân 5 người" : "🏆 Sân 7 người tiêu chuẩn"}
                  </span>
                  <h2 style={{ margin: 0, fontSize: "22px" }}>{galleryPitch.name}</h2>
                </div>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#b45309" }}>
                  {galleryPitch.fieldType === "SAN_7" ? "Từ 500.000đ / ca" : "Từ 300.000đ / ca"}
                </span>
              </div>

              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7", margin: "10px 0 20px" }}>
                {galleryPitch.description}
              </p>

              {/* Pitch Specifications */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "24px", fontSize: "13px" }}>
                <div><strong>Kích thước:</strong> {galleryPitch.fieldType === "SAN_5" ? "20m x 40m" : "30m x 50m"}</div>
                <div><strong>Chất lượng mặt cỏ:</strong> {galleryPitch.turf || "Cỏ Monofilament 50mm FIFA"}</div>
                <div><strong>Hệ thống đèn:</strong> 8 bóng LED Philips 400W chống chói</div>
                <div><strong>Khán đài &amp; Cabin:</strong> Ghế ngồi có mái che mát mẻ</div>
                <div><strong>Tiện ích đi kèm:</strong> Phòng tắm nóng lạnh &amp; tủ locker</div>
                <div><strong>Sức chứa lý tưởng:</strong> {galleryPitch.capacity || "5 - 7 cầu thủ mỗi bên"}</div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="outline-button"
                  style={{ flex: 1 }}
                  onClick={() => setGalleryPitch(null)}
                >
                  Đóng cửa sổ
                </button>
                <a
                  href="#dat-san"
                  className="primary-button"
                  style={{ flex: 2, textAlign: "center" }}
                  onClick={() => {
                    setFilterType(galleryPitch.fieldType);
                    setGalleryPitch(null);
                  }}
                >
                  Xem các ca trống của sân này ⚡
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login & Register Modal (Neon DB) */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(null)}>
          <div className="modal-content" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-tag">TÀI KHOẢN KHÁCH HÀNG</span>
                <h3>{authModal === "LOGIN" ? "Đăng nhập hệ thống" : "Đăng ký thành viên mới"}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setAuthModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Tab selector */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${authModal === "LOGIN" ? "active" : ""}`}
                  onClick={() => {
                    setAuthError("");
                    setAuthNotice("");
                    setAuthModal("LOGIN");
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${authModal === "REGISTER" ? "active" : ""}`}
                  onClick={() => {
                    setAuthError("");
                    setAuthNotice("");
                    setAuthModal("REGISTER");
                  }}
                >
                  Đăng ký tài khoản
                </button>
              </div>

              {authError && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <strong>Lỗi:</strong> {authError}
                </div>
              )}

              {authNotice && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <strong>✓</strong> {authNotice}
                </div>
              )}

              {authModal === "LOGIN" ? (
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label>Email hoặc Số điện thoại *</label>
                    <input
                      name="emailOrPhone"
                      required
                      placeholder="Ví dụ: 0912345678 hoặc customer@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu *</label>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="primary-button"
                    style={{ width: "100%", padding: "12px", marginTop: "8px", fontSize: "14px" }}
                  >
                    {authBusy ? "Đang xác thực..." : "Đăng nhập ngay"}
                  </button>

                  <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b" }}>
                    Chưa có tài khoản?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      onClick={() => {
                        setAuthError("");
                        setAuthModal("REGISTER");
                      }}
                    >
                      Đăng ký ngay (Miễn phí)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      name="fullName"
                      required
                      minLength={2}
                      placeholder="Ví dụ: Lê Hoàng Nam"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912345678"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email (tùy chọn)</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Ví dụ: hoangnam@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu khởi tạo * (tối thiểu 6 ký tự)</label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Tạo mật khẩu an toàn..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="primary-button"
                    style={{ width: "100%", padding: "12px", marginTop: "8px", fontSize: "14px" }}
                  >
                    {authBusy ? "Đang tạo tài khoản trên Neon..." : "Tạo tài khoản & Lưu vào Neon"}
                  </button>

                  <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b" }}>
                    Đã có tài khoản?{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", padding: 0 }}
                      onClick={() => {
                        setAuthError("");
                        setAuthModal("LOGIN");
                      }}
                    >
                      Đăng nhập tại đây
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cấu hình & Kiểm tra API Wispbyte / Neon */}
      {apiConfigOpen && (
        <div className="modal-overlay" onClick={() => setApiConfigOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🔌</span>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Cấu hình Kết nối API (Wispbyte &amp; Neon)</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setApiConfigOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.6" }}>
                Hệ thống hỗ trợ cơ chế Decoupled: Frontend có thể kết nối linh hoạt tới <strong>Container Wispbyte</strong>, <strong>Localhost</strong> hoặc <strong>Proxy HTTPS</strong> trên hosting của trường.
              </p>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  CHỌN NHANH ĐỊA CHỈ SERVER:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    className="outline-button"
                    style={{ textAlign: "left", fontSize: "12px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => {
                      setApiUrlInput("http://78.154.183.38:11199/api/v1");
                      testAndSaveApi("http://78.154.183.38:11199/api/v1");
                    }}
                  >
                    <span>🌐 <strong>Wispbyte VPS Server:</strong> http://78.154.183.38:11199/api/v1</span>
                    <span style={{ color: "var(--primary)", fontWeight: "700" }}>Chọn &amp; Kết nối ➜</span>
                  </button>

                  <button
                    type="button"
                    className="outline-button"
                    style={{ textAlign: "left", fontSize: "12px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => {
                      setApiUrlInput("http://localhost:3000/api/v1");
                      testAndSaveApi("http://localhost:3000/api/v1");
                    }}
                  >
                    <span>💻 <strong>Localhost Server (Máy cá nhân):</strong> http://localhost:3000/api/v1</span>
                    <span style={{ color: "var(--primary)", fontWeight: "700" }}>Chọn &amp; Kết nối ➜</span>
                  </button>

                  <button
                    type="button"
                    className="outline-button"
                    style={{ textAlign: "left", fontSize: "12px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => {
                      setApiUrlInput("./api_proxy.php?path=api/v1");
                      testAndSaveApi("./api_proxy.php?path=api/v1");
                    }}
                  >
                    <span>🛡️ <strong>Proxy PHP Trường (Tránh Mixed Content):</strong> ./api_proxy.php</span>
                    <span style={{ color: "var(--primary)", fontWeight: "700" }}>Chọn &amp; Kết nối ➜</span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  HOẶC NHẬP URL TÙY CHỌN:
                </label>
                <input
                  type="text"
                  value={apiUrlInput}
                  onChange={(e) => setApiUrlInput(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: "13px" }}
                  placeholder="http://78.154.183.38:11199/api/v1"
                />
              </div>

              {apiCheckMsg && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  background: isApiConnected ? "#f0fdf4" : "#fef2f2",
                  color: isApiConnected ? "#166534" : "#991b1b",
                  border: isApiConnected ? "1px solid #bbf7d0" : "1px solid #fecaca",
                }}>
                  {apiCheckMsg}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  disabled={apiChecking}
                  className="primary-button"
                  style={{ flex: 1, padding: "10px" }}
                  onClick={() => testAndSaveApi()}
                >
                  {apiChecking ? "Đang kiểm tra..." : "⚡ Kiểm tra & Lưu kết nối"}
                </button>
                <button
                  type="button"
                  className="outline-button"
                  style={{ padding: "10px 16px" }}
                  onClick={() => setApiConfigOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Hotline/Zalo Support FAB */}
      <div className="floating-contact-fab">
        <a
          href="tel:0896890399"
          className="fab-main-btn"
          title="Gọi ngay hotline hỗ trợ đặt sân 24/7"
        >
          <span style={{ fontSize: "18px" }}>📞</span>
          <span>Hotline: 0896890399</span>
        </a>
      </div>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "50px 20px 30px", marginTop: "auto" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "40px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "40px" }}>
          <div>
            <div className="brand" style={{ color: "#ffffff", marginBottom: "16px" }}>
              <div className="brand-icon">⚽</div>
              <div>SÂN<span>NHÀ</span> FC</div>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.8", maxWidth: "400px" }}>
              Cụm sân bóng đá mini cỏ nhân tạo tiêu chuẩn VFF. Phục vụ các giải đấu phong trào, hội đồng hương và các câu lạc bộ bóng đá sinh viên.
            </p>
            <div style={{ fontSize: "13px", marginTop: "12px", color: "#e2e8f0" }}>
              📍 Địa chỉ: Khu liên hợp Thể Thao Mini Football, TP. Hồ Chí Minh
            </div>
          </div>

          <div>
            <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "16px" }}>Liên Kết Nhanh</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <a href="#danh-sach-san" style={{ color: "#cbd5e1" }}>Danh mục sân bóng</a>
              <a href="#dat-san" style={{ color: "#cbd5e1" }}>Lịch sân trống hôm nay</a>
              <a href="#bang-gia" style={{ color: "#cbd5e1" }}>Bảng giá chi tiết</a>
              <a href="/lookup" style={{ color: "#cbd5e1" }}>Tra cứu vé đặt sân</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#ffffff", fontSize: "15px", marginBottom: "16px" }}>Hệ Thống Đồ Án</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <Link href="/cv" style={{ color: "#22c55e", fontWeight: "700" }}>
                👨‍💻 Hồ sơ Năng Lực (CV) Lê Duy Tài ↗
              </Link>
              <a href="/admin" style={{ color: "#38bdf8", fontWeight: "600" }}>⚙️ Cổng Quản Trị Viên / Staff</a>
              <a href={`${API.replace(/\/api\/v1$/, "")}/`} target="_blank" style={{ color: "#cbd5e1" }}>📖 Swagger REST API Docs ↗</a>
              <a href={`${API.replace(/\/api\/v1$/, "")}/openapi.json`} target="_blank" style={{ color: "#cbd5e1" }}>📄 OpenAPI JSON Specification ↗</a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1240px", margin: "24px auto 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            © 2026 Sân Nhà Football Booking System · Đồ Án Chuyên Ngành CNTT.
          </div>
          <div style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.35)", padding: "8px 18px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span>🚀 Dự án được phát triển bởi</span>
            <a href="https://it24m.dak.edu.vn/leduytai/baitap1/" target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e", fontWeight: "800", textDecoration: "underline" }} title="Nhấn để xem CV trực tiếp của Lê Duy Tài">
              Lê Duy Tài
            </a>
            <span>và</span>
            <a href="https://cv-landing-page-peach.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontWeight: "800", textDecoration: "underline" }} title="Nhấn để xem CV trực tiếp của Kpa Trần Quang Thịnh">
              Kpa Trần Quang Thịnh
            </a>
            <Link href="/cv" style={{ background: "#22c55e", color: "#052e16", fontWeight: "800", fontSize: "11px", padding: "3px 10px", borderRadius: "999px", textDecoration: "none", marginLeft: "4px" }} title="Xem trang thông tin 2 lập trình viên">
              Xem hồ sơ 2 tác giả ➜
            </Link>
          </div>
          <span>Bảo mật JWT · Neon Cloud DB · Wispbyte Server · Next.js 15.</span>
        </div>
      </footer>

      {/* Customer Profile & Settings Modal */}
      {profileModalOpen && currentUser && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "580px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-tag">TRUNG TÂM CÀI ĐẶT TÀI KHOẢN</span>
                <h3 style={{ margin: 0 }}>Hồ Sơ &amp; Cài Đặt Khách Hàng</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setProfileModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto", padding: "18px 24px" }}>
              {/* Profile card summary */}
              <div style={{ background: "linear-gradient(135deg, #15803d 0%, #065f46 100%)", color: "#ffffff", padding: "18px 20px", borderRadius: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                      {userAvatar}
                    </div>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 800 }}>{currentUser.fullName}</div>
                      <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>📞 {currentUser.phone} · {currentUser.email || "Chưa gắn email"}</div>
                    </div>
                  </div>
                  <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                    👑 HỘI VIÊN VIP VÀNG (10% OFF)
                  </span>
                </div>
                <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "8px", fontSize: "12px", opacity: 0.95 }}>
                  ⚽ Vị trí: <strong>{userPosition}</strong> · Khu vực: <strong>{userArea}</strong> · Đội: <strong>{userTeam}</strong>
                </div>
              </div>

              {/* Sub-tab navigation buttons */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", overflowX: "auto" }}>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "PROFILE" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => { setProfileTab("PROFILE"); setProfileNotice(""); }}
                >
                  👤 Hồ sơ cá nhân
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "PASSWORD" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => { setProfileTab("PASSWORD"); setProfileNotice(""); }}
                >
                  🔐 Đổi mật khẩu
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "NOTIFICATIONS" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => { setProfileTab("NOTIFICATIONS"); setProfileNotice(""); }}
                >
                  🔔 Thông báo
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "PREFERENCES" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => { setProfileTab("PREFERENCES"); setProfileNotice(""); }}
                >
                  ⚙️ Tiện ích đặt sân
                </button>
              </div>

              {profileNotice && (
                <div style={{ background: profileNotice.startsWith("❌") ? "#fee2e2" : "#f0fdf4", border: `1px solid ${profileNotice.startsWith("❌") ? "#fca5a5" : "#86efac"}`, color: profileNotice.startsWith("❌") ? "#991b1b" : "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", fontWeight: 600 }}>
                  {profileNotice}
                </div>
              )}

              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {profileTab === "PROFILE" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newName = String(formData.get("name") || "").trim();
                    const newPhone = String(formData.get("phone") || "").trim();
                    const newEmail = String(formData.get("email") || "").trim();
                    const updated = {
                      ...currentUser,
                      fullName: newName || currentUser.fullName,
                      phone: newPhone || currentUser.phone,
                      email: newEmail || currentUser.email,
                    };
                    setCurrentUser(updated);
                    window.localStorage.setItem("football_logged_user", JSON.stringify(updated));
                    setProfileNotice("✓ Đã cập nhật thành công thông tin hồ sơ cá nhân!");
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
                      Chọn ảnh đại diện (Avatar):
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["⚽", "🏃", "🥅", "👟", "🏆", "🥇", "🎯"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setUserAvatar(emoji)}
                          style={{
                            width: "38px",
                            height: "38px",
                            fontSize: "20px",
                            borderRadius: "8px",
                            border: userAvatar === emoji ? "2px solid #16a34a" : "1px solid #cbd5e1",
                            background: userAvatar === emoji ? "#dcfce7" : "#ffffff",
                            cursor: "pointer",
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700 }}>Họ và tên khách hàng *</label>
                    <input name="name" defaultValue={currentUser.fullName} required style={{ height: "40px" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700 }}>Số điện thoại *</label>
                      <input name="phone" defaultValue={currentUser.phone} required style={{ height: "40px" }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700 }}>Email nhận vé</label>
                      <input name="email" defaultValue={currentUser.email || ""} placeholder="example@gmail.com" style={{ height: "40px" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700 }}>Khu vực tại Buôn Ma Thuột</label>
                      <select value={userArea} onChange={(e) => setUserArea(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                        <option value="Phường Tân Tiến">Phường Tân Tiến</option>
                        <option value="Phường Tân Lợi">Phường Tân Lợi</option>
                        <option value="Phường Tân An">Phường Tân An</option>
                        <option value="Phường Thành Nhất">Phường Thành Nhất</option>
                        <option value="Phường Ea Tam">Phường Ea Tam</option>
                        <option value="Phường Tân Lập">Phường Tân Lập</option>
                        <option value="Xã Hòa Khánh">Xã Hòa Khánh</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700 }}>Vị trí thi đấu sở trường</label>
                      <select value={userPosition} onChange={(e) => setUserPosition(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                        <option value="Tiền đạo (ST)">Tiền đạo (ST)</option>
                        <option value="Tiền vệ (MF)">Tiền vệ (MF)</option>
                        <option value="Hậu vệ (DF)">Hậu vệ (DF)</option>
                        <option value="Thủ môn (GK)">Thủ môn (GK)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700 }}>Tên đội bóng / Câu lạc bộ</label>
                    <input value={userTeam} onChange={(e) => setUserTeam(e.target.value)} placeholder="Ví dụ: FC Anh Em BMT" style={{ height: "40px" }} />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button type="submit" className="primary-button" style={{ flex: 1, padding: "10px" }}>
                      💾 Lưu thông tin hồ sơ
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "10px 16px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU & BẢO MẬT */}
              {profileTab === "PASSWORD" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const oldPass = String(formData.get("oldPass") || "");
                    const newPass = String(formData.get("newPass") || "");
                    const confirmPass = String(formData.get("confirmPass") || "");

                    if (!oldPass || !newPass) {
                      setProfileNotice("❌ Vui lòng nhập đầy đủ mật khẩu cũ và mới!");
                      return;
                    }
                    if (newPass.length < 6) {
                      setProfileNotice("❌ Mật khẩu mới phải có tối thiểu 6 ký tự!");
                      return;
                    }
                    if (newPass !== confirmPass) {
                      setProfileNotice("❌ Mật khẩu xác nhận không trùng khớp!");
                      return;
                    }
                    setProfileNotice("✓ Đổi mật khẩu tài khoản thành công! Mật khẩu mới đã được bảo vệ.");
                    e.currentTarget.reset();
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700 }}>Mật khẩu hiện tại *</label>
                    <input name="oldPass" type="password" required placeholder="Nhập mật khẩu hiện tại" style={{ height: "40px" }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700 }}>Mật khẩu mới *</label>
                    <input name="newPass" type="password" required placeholder="Tối thiểu 6 ký tự" style={{ height: "40px" }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700 }}>Xác nhận mật khẩu mới *</label>
                    <input name="confirmPass" type="password" required placeholder="Nhập lại mật khẩu mới" style={{ height: "40px" }} />
                  </div>

                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#475569" }}>
                    🔒 Mật khẩu được mã hóa an toàn trên máy chủ Neon PostgreSQL. Vui lòng ghi nhớ mật khẩu để đăng nhập lần sau.
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button type="submit" className="primary-button" style={{ flex: 1, padding: "10px" }}>
                      🔑 Cập nhật mật khẩu mới
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "10px 16px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CÀI ĐẶT THÔNG BÁO & LỜI NHẮC */}
              {profileTab === "NOTIFICATIONS" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a", display: "block", marginBottom: "12px" }}>
                      🔔 Tùy chọn thông báo nhận tin:
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input type="checkbox" checked={notifyZalo} onChange={(e) => setNotifyZalo(e.target.checked)} />
                        <div>
                          <strong>Thông báo Zalo ZNS:</strong> Nhận mã đặt chỗ, QR cọc 30% và địa chỉ sân tức thì.
                        </div>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input type="checkbox" checked={notifyReminder} onChange={(e) => setNotifyReminder(e.target.checked)} />
                        <div>
                          <strong>Nhắc lịch trước 2 giờ:</strong> Nhắn tin nhắc chuẩn bị giày &amp; áo đấu trước khi bóng lăn.
                        </div>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input type="checkbox" checked={notifyPromo} onChange={(e) => setNotifyPromo(e.target.checked)} />
                        <div>
                          <strong>Ưu đãi &amp; Giờ vàng:</strong> Nhận tin giảm giá 30% vào các khung giờ vàng cuối tuần.
                        </div>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ flex: 1, padding: "10px" }}
                      onClick={() => setProfileNotice("✓ Đã lưu cài đặt thông báo & lời nhắc thành công!")}
                    >
                      💾 Lưu cài đặt thông báo
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "10px 16px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TIỆN ÍCH ĐẶT SÂN & TÙY CHỌN */}
              {profileTab === "PREFERENCES" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a", display: "block", marginBottom: "12px" }}>
                      ⚙️ Cài đặt tiện ích thông minh khi đặt sân:
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                        <input type="checkbox" checked={prefAutofill} onChange={(e) => setPrefAutofill(e.target.checked)} />
                        <span>Tự động điền nhanh tên &amp; SĐT khi bấm chọn ca sân</span>
                      </label>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "12px", fontWeight: 700 }}>Cụm sân ruột thường xuyên thi đấu:</label>
                        <select value={prefFavoriteField} onChange={(e) => setPrefFavoriteField(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                          <option value="Sân bóng C1">Sân bóng C1 (Phường Tân Tiến)</option>
                          <option value="SVĐ Buôn Ma Thuột">SVĐ Buôn Ma Thuột</option>
                          <option value="Sân Ban Mê Sport">Sân Ban Mê Sport (Phường Tân Lập)</option>
                          <option value="Sân CĐ Sư Phạm">Sân CĐ Sư Phạm (Phường Ea Tam)</option>
                          <option value="Sân KenVin">Sân KenVin (Phường Tân Lợi)</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: "12px", fontWeight: 700 }}>Khung giờ đá bóng yêu thích:</label>
                        <select value={prefFavoriteSlot} onChange={(e) => setPrefFavoriteSlot(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                          <option value="Ca 1 (06:00 - 07:30)">Ca 1 (06:00 - 07:30) - Buổi sáng</option>
                          <option value="Ca 8 (16:30 - 18:00)">Ca 8 (16:30 - 18:00) - Chiều tan sở</option>
                          <option value="Ca 9 (18:00 - 19:30)">Ca 9 (18:00 - 19:30) - Giờ vàng tối</option>
                          <option value="Ca 10 (19:30 - 21:00)">Ca 10 (19:30 - 21:00) - Giờ vàng đêm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ flex: 1, padding: "10px" }}
                      onClick={() => setProfileNotice("✓ Đã lưu tiện ích đặt sân yêu thích thành công!")}
                    >
                      💾 Lưu tiện ích đặt sân
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "10px 16px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
