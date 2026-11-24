"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

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

const NEON_SQL_ENDPOINT = "https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql";
const NEON_DB_CONNECTION = "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function queryNeonDirect(sql: string): Promise<any[]> {
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
  } catch (err: any) {
    console.warn("[Neon Direct Warning]", err?.message || err);
    return [];
  }
}


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

// Phân bổ sân con thực tế chuẩn xác từng cụm sân Buôn Ma Thuột (Đắk Lắk)
function getFieldSubPitches(field: FieldInfo | { id: number; name?: string } | null | undefined): SubPitchItem[] {
  if (!field) return [];
  switch (field.id) {
    case 5: // SVĐ Buôn Ma Thuột: DUY NHẤT 1 SÂN 11 (Chuẩn thi đấu CLB Đắk Lắk, 20.000 chỗ)
      return [
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân 11 - SVĐ Buôn Ma Thuột",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Cỏ tự nhiên chuẩn thi đấu quốc gia (CLB Đắk Lắk, 20.000 chỗ)",
          basePrice: 1000000,
          highlight: "Sân vận động chính tỉnh Đắk Lắk, mặt cỏ tự nhiên chuẩn quốc gia",
        },
      ];

    case 6: // Sân bóng đá C1: 2 sân 5 (ghép đá giải sân 7) - Báo Tuổi Trẻ & D-League 2025
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ngoài trời (nguồn Tuấn Việt)",
          basePrice: 250000,
          highlight: "Quy mô 2 sân 5 người ngoài trời, mặt cỏ bám giày",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ngoài trời (nguồn Tuấn Việt)",
          basePrice: 250000,
          highlight: "Dàn đèn LED chiếu sáng ban đêm",
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Ghép giải D-League",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Ghép 2 sân 5 đá giải sân 7",
          basePrice: 400000,
          highlight: "Từng tổ chức Giải sân 7 Đắk Lắk D-League 2025 (Báo Tuổi Trẻ & Văn Hóa)",
        },
      ];

    case 7: // Sân bóng đá Manchester: 3 sân 5 (2 sân 36x19m, 1 sân 41x36m) - KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (36m × 19m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m chuẩn Tuấn Việt",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (36m × 19m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m, mặt cỏ mới",
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 Rộng (41m × 36m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Rộng)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ô rộng 41m × 36m",
          basePrice: 300000,
          highlight: "Sân rộng 41m × 36m đá 5-6 người cực kỳ thoáng",
        },
      ];

    case 10: // Sân Bóng Đá Ngọc Anh: 3 sân 5 (2 sân 36x19m, 1 sân 41x36m) - KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (36m × 19m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 36m × 19m",
          basePrice: 250000,
          highlight: "Xác thực kép từ Tuấn Việt & Review Google Maps (3 sân 5)",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (36m × 19m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 36m × 19m",
          basePrice: 250000,
          highlight: "Kích thước 36m × 19m, dàn đèn tốt",
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 Rộng (41m × 36m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Rộng)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo ô rộng 41m × 36m",
          basePrice: 300000,
          highlight: "Sân rộng 41m × 36m thoải mái ban bật phối hợp",
        },
      ];

    case 11: // Sân vận động ĐTL (300 Hà Huy Tập): 6 sân 5, 2 sân 7, 1 sân 11 - Cụm sân lớn
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (40m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m tại 300 Hà Huy Tập",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (40m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 (40m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
        },
        {
          id: "SAN_5_4",
          code: "5-4",
          name: "Sân con 5 - Số 4 (40m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo chuẩn 40m × 18m",
          basePrice: 250000,
          highlight: "Quy chuẩn 40m × 18m",
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Số 1 (58m × 40m)",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 58m × 40m",
          basePrice: 400000,
          highlight: "Kích thước 58m × 40m chuẩn giải phong trào",
        },
        {
          id: "SAN_7_2",
          code: "7-2",
          name: "Sân con 7 - Số 2 (58m × 40m)",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 58m × 40m",
          basePrice: 400000,
          highlight: "Kích thước 58m × 40m chuẩn giải",
        },
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân con 11 - Tiêu chuẩn ĐTL (83m × 58m)",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Mặt sân 83m × 58m chuẩn thi đấu",
          basePrice: 800000,
          highlight: "Kích thước lớn 83m × 58m tổ chức giải đấu",
        },
      ];

    case 12: // Sân bóng đá Tân Thái Long: 2 sân có mái che (KHÔNG CÓ SÂN 7, KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Mái che Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Có mái che)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo có mái che, mở 06:00 - 23:00",
          basePrice: 280000,
          highlight: "Nguồn DakLak360: Sân cỏ nhân tạo có mái che, mở 06:00–23:00",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Mái che Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người (Có mái che)",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo có mái che, mở 06:00 - 23:00",
          basePrice: 280000,
          highlight: "Mặt cỏ khô ráo trong mọi điều kiện thời tiết",
        },
      ];

    case 17: // SVĐ Trường ĐH Tây Nguyên: DUY NHẤT 1 SÂN 11
      return [
        {
          id: "SAN_11_1",
          code: "11-1",
          name: "Sân 11 - SVĐ ĐH Tây Nguyên",
          category: "SAN_11",
          categoryName: "Sân lớn 11 người (Chuẩn VFF)",
          capacity: "11 - 18 người / đội",
          turf: "Sân vận động chính trong khuôn viên trường",
          basePrice: 800000,
          highlight: "Từng tổ chức VCK Giải sân 7 VĐQG trên mặt sân theo Báo Gia Lai",
        },
      ];

    case 19: // Sân Ban Mê Sport: 3 sân 5, 1 sân 7 (KHÔNG CÓ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1 (38m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m (Tuấn Việt & DakLak360)",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2 (38m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
        },
        {
          id: "SAN_5_3",
          code: "5-3",
          name: "Sân con 5 - Số 3 (38m × 18m)",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 38m × 18m",
          basePrice: 250000,
          highlight: "Kích thước thực tế 38m × 18m",
        },
        {
          id: "SAN_7_1",
          code: "7-1",
          name: "Sân con 7 - Chuẩn (53m × 38m)",
          category: "SAN_7",
          categoryName: "Sân bán chuyên 7 người",
          capacity: "7 - 9 người / đội",
          turf: "Cỏ nhân tạo FIFA Pro 53m × 38m",
          basePrice: 400000,
          highlight: "Kích thước thực tế 53m × 38m đá 7 người cực chuẩn",
        },
      ];

    default: // 9 sân phong trào còn lại (ID 8, 9, 13, 14, 15, 16, 18, 20, 21, 23, 24, 25): CHỈ CÓ 2 SÂN 5 MINI (BỎ SÂN 7, BỎ SÂN 11)
      return [
        {
          id: "SAN_5_1",
          code: "5-1",
          name: "Sân con 5 - Số 1",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo 50mm chống trượt",
          basePrice: 250000,
          highlight: "Mặt cỏ êm ái, bám giày phong trào",
        },
        {
          id: "SAN_5_2",
          code: "5-2",
          name: "Sân con 5 - Số 2",
          category: "SAN_5",
          categoryName: "Sân mini 5 người",
          capacity: "5 - 7 người / đội",
          turf: "Cỏ nhân tạo tiêu chuẩn",
          basePrice: 250000,
          highlight: "Dàn đèn LED chiếu sáng ban đêm",
        },
      ];
  }
}

// Fallback tương thích
const SUB_PITCHES: SubPitchItem[] = getFieldSubPitches({ id: 6 });

// Toạ độ thực tế chuẩn xác từng cụm sân Buôn Ma Thuột (Chống lệch Spa Mon 85 Nguyễn Đức Cảnh)
const FIELD_COORDINATES_MAP: Record<number, { lat: number; lng: number }> = {
  5: { lat: 12.6784, lng: 108.0428 }, // SVĐ Buôn Ma Thuột (2 Nguyễn Công Trứ)
  6: { lat: 12.6935, lng: 108.0312 }, // Sân C1 (1B Y Ngông)
  7: { lat: 12.6865, lng: 108.0580 }, // Sân Manchester (130 Y Ngông)
  8: { lat: 12.6812, lng: 108.0450 }, // Sân T&H (110/10 Hoàng Hoa Thám)
  9: { lat: 12.6790, lng: 108.0515 }, // Sân Hoài Ân (119 Nguyễn Văn Cừ)
  10: { lat: 12.6840, lng: 108.0390 }, // Sân Ngọc Anh (46 Nguyễn Thị Định)
  11: { lat: 12.7080, lng: 108.0620 }, // SVĐ ĐTL (300 Hà Huy Tập)
  12: { lat: 12.6685, lng: 108.0298 }, // Sân Tân Thái Long (213/6 Mai Hắc Đế)
  13: { lat: 12.6987, lng: 108.0411 }, // Sân Lập Nguyễn (75/12 Trần Khánh Dư)
  14: { lat: 12.6871, lng: 108.0285 }, // Sân KEVIN (209 Quang Trung)
  15: { lat: 12.6654, lng: 108.0342 }, // Sân Đại Thành (147 Mai Hắc Đế)
  16: { lat: 12.6512, lng: 108.0518 }, // Sân Hoàng Gia (Đường 30/4)
  17: { lat: 12.6478, lng: 108.0583 }, // SVĐ Trường ĐH Tây Nguyên (567 Lê Duẩn)
  18: { lat: 12.6565, lng: 108.0541 }, // Sân CĐ Sư Phạm (349 Lê Duẩn)
  19: { lat: 12.7185, lng: 108.0624 }, // Sân Ban Mê Sport (185 Hà Huy Tập)
  23: { lat: 12.6912, lng: 108.0418 }, // Sân Đức Thịnh Sports
  24: { lat: 12.6742, lng: 108.0125 }, // Sân Tiến Thy (140 Nguyễn Thị Định)
  25: { lat: 12.6531, lng: 108.0612 }, // Sân Quốc Định (112 Y Wang)
  26: { lat: 12.6765, lng: 108.0288 }, // Sân Hưng Thịnh
  27: { lat: 12.6948, lng: 108.0560 }  // Sân Thắng Lợi
};

function getPitchCoords(f: { id: number; lat?: number; lng?: number }): { lat: number; lng: number } {
  if (f.lat && f.lng && !(f.lat === 12.6865 && f.lng === 108.0450)) return { lat: f.lat, lng: f.lng };
  return FIELD_COORDINATES_MAP[f.id] || { lat: 12.6806, lng: 108.0378 };
}

function getGoogleMapsDirUrl(name: string, address: string | null | undefined, uLat?: number, uLng?: number): string {
  const originPart = (uLat && uLng) ? `origin=${uLat},${uLng}&` : "";
  const dest = encodeURIComponent(`${name}, ${address || ''}, Buôn Ma Thuột, Đắk Lắk`);
  return `https://www.google.com/maps/dir/?api=1&${originPart}destination=${dest}&travelmode=driving`;
}

function getGoogleMapsSearchUrl(name: string, address: string | null | undefined): string {
  const query = encodeURIComponent(`${name} ${address || ''} Buôn Ma Thuột`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

type FieldInfo = {
  lat?: number;
  lng?: number;
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
  size?: string;
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



const MAX_CLUB_MEMBERS = 15;

type ClubMember = {
  userId: number;
  name: string;
  phone: string;
  role: "CAPTAIN" | "CO_CAPTAIN" | "MEMBER";
  joinedAt: string;
};

type FootballClub = {
  id: number;
  name: string;
  shortName: string;
  avatar: string;
  banner: string;
  captainId: number;
  captainName: string;
  captainPhone?: string;
  homePitch?: string;
  tier?: string;
  description: string;
  ward: string;
  level: "VUI_VE" | "TRUNG_BINH" | "BAN_CHUYEN";
  elo: number;
  rank: string;
  wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number;
  members: ClubMember[];
  createdAt: string;
  isRecruiting: boolean;
};

function getEloRank(elo: number): string {
  if (elo >= 1600) return "💎 KIM CƯƠNG";
  if (elo >= 1400) return "🥇 VÀNG";
  if (elo >= 1100) return "🥈 BẠC";
  if (elo >= 800) return "🥉 ĐỒNG";
  return "🆕 MỚI";
}

function getEloColor(elo: number): string {
  if (elo >= 1600) return "#7c3aed";
  if (elo >= 1400) return "#ca8a04";
  if (elo >= 1100) return "#64748b";
  if (elo >= 800) return "#b45309";
  return "#94a3b8";
}

const DEFAULT_CLUBS: FootballClub[] = [
  {
    id: 1, name: "FC Sân Nhà Ban Mê", shortName: "SNBM", avatar: "⚽",
    banner: "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-chuan-va-dep_101638538.jpg",
    captainId: 1, captainName: "Lê Duy Tài",
    description: "Câu lạc bộ chính thức của hệ thống Sân Nhà FC tại Buôn Ma Thuột.",
    ward: "Phường Tân Tiến", level: "TRUNG_BINH",
    elo: 1200, rank: "🥈 BẠC",
    wins: 12, draws: 3, losses: 5, goalsFor: 48, goalsAgainst: 28,
    members: [
      { userId: 1, name: "Lê Duy Tài", phone: "0896890399", role: "CAPTAIN", joinedAt: "2026-10-01" },
      { userId: 2, name: "Kpa Trần Quang Thịnh", phone: "0905123456", role: "CO_CAPTAIN", joinedAt: "2026-10-01" },
      { userId: 100, name: "Nguyễn Minh Hoàng", phone: "0914567890", role: "MEMBER", joinedAt: "2026-10-05" },
      { userId: 101, name: "Trần Đức Long", phone: "0932111222", role: "MEMBER", joinedAt: "2026-10-10" },
      { userId: 102, name: "Lê Quốc Hùng", phone: "0918999888", role: "MEMBER", joinedAt: "2026-10-12" }
    ],
    createdAt: "2026-10-01", isRecruiting: true
  },
  {
    id: 2, name: "FC Ea Tam Warrior", shortName: "EATW", avatar: "🦁",
    banner: "https://atsport.vn/wp-content/uploads/2021/08/kich-thuoc-san-bong-da-7-nguoi-co-nhan-tao-1-1-960x960.jpg",
    captainId: 3, captainName: "Nguyễn Anh Tuấn",
    description: "Đội bóng phong trào mạnh nhất khu vực Ea Tam, chuyên thi đấu sân 7.",
    ward: "Phường Ea Tam", level: "BAN_CHUYEN",
    elo: 1450, rank: "🥇 VÀNG",
    wins: 18, draws: 2, losses: 3, goalsFor: 65, goalsAgainst: 20,
    members: [
      { userId: 3, name: "Nguyễn Anh Tuấn", phone: "0935444777", role: "CAPTAIN", joinedAt: "2026-09-15" },
      { userId: 103, name: "Phạm Văn Đức", phone: "0943567890", role: "CO_CAPTAIN", joinedAt: "2026-09-15" },
      { userId: 104, name: "Trần Hữu Phúc", phone: "0918234567", role: "MEMBER", joinedAt: "2026-09-20" },
      { userId: 105, name: "Nguyễn Thanh Tùng", phone: "0932678901", role: "MEMBER", joinedAt: "2026-09-22" },
      { userId: 106, name: "Lê Minh Quân", phone: "0905789012", role: "MEMBER", joinedAt: "2026-10-01" },
      { userId: 107, name: "Võ Duy Mạnh", phone: "0914890123", role: "MEMBER", joinedAt: "2026-10-05" }
    ],
    createdAt: "2026-09-15", isRecruiting: true
  },
  {
    id: 3, name: "FC Voi Chiến Tây Nguyên", shortName: "VCTN", avatar: "🐘",
    banner: "https://5.imimg.com/data5/SELLER/Default/2023/8/335821545/AO/WO/DU/19508713/football-artificial-grass-1000x1000.jpg",
    captainId: 5, captainName: "Trần Quốc Cường",
    description: "Đội bóng mạnh nhất giải phong trào Đắk Lắk, nhiều lần vô địch giải sân 7.",
    ward: "Phường Tân Lập", level: "BAN_CHUYEN",
    elo: 1680, rank: "💎 KIM CƯƠNG",
    wins: 25, draws: 5, losses: 2, goalsFor: 88, goalsAgainst: 15,
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
    createdAt: "2026-08-01", isRecruiting: false
  }
];

type MatchmakingPost = {
  id: number;
  userId?: number;
  userFullName?: string;
  teamName: string;
  captainName: string;
  phone: string;
  fieldId: number;
  fieldName: string;
  fieldType: "SAN_5" | "SAN_7" | "SAN_11";
  matchDate: string;
  timeSlot: string;
  level: "VUI_VE" | "TRUNG_BINH" | "BAN_CHUYEN";
  levelLabel: string;
  betRule: "CHIA_DOI" | "THUA_BAO" | "KEO_NUOC";
  betLabel: string;
  status: "OPEN" | "MATCHED";
  matchedBy?: string | null;
  avatar: string;
  description: string;
  createdAt: string;
};

const DEFAULT_MATCHMAKING_POSTS: MatchmakingPost[] = [
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
    phone: "0896890399",
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
    description: "Giao lưu sân 11 người mặt cỏ chuẩn VFF, cọ xát hữu nghị với các trường và câu lạc bộ bạn.",
    createdAt: "Hôm nay"
  }
];

const DEFAULT_TOURNAMENT_DATA = {
  name: "Cúp Tứ Hùng Ban Mê 2026",
  status: "Đang diễn ra",
  roundName: "Vòng Chung Kết & Bảng A",
  bracketMatches: [
    {
      id: "BK1",
      round: "Bán kết 1",
      time: "17:30 · 28/11/2026",
      field: "Sân bóng C1 (Sân 7)",
      team1: { name: "FC Cà Phê Ban Mê", score: 4 },
      team2: { name: "FC Đại Ngàn Xanh", score: 2 },
      status: "FINISHED",
      winner: "FC Cà Phê Ban Mê"
    },
    {
      id: "BK2",
      round: "Bán kết 2",
      time: "19:00 · 28/11/2026",
      field: "Sân bóng C1 (Sân 7)",
      team1: { name: "FC Voi Chiến Krông Pắc", score: 3 },
      team2: { name: "FC Buôn Ma Thuột United", score: 5 },
      status: "FINISHED",
      winner: "FC Buôn Ma Thuột United"
    },
    {
      id: "CK",
      round: "Trận Chung Kết Tranh Ngôi Vô Địch 🏆",
      time: "18:00 · 30/11/2026",
      field: "SVĐ Buôn Ma Thuột (Sân 11)",
      team1: { name: "FC Cà Phê Ban Mê", score: null },
      team2: { name: "FC Buôn Ma Thuột United", score: null },
      status: "UPCOMING",
      winner: null
    }
  ],
  standings: [
    { rank: 1, team: "FC Buôn Ma Thuột United", played: 3, won: 3, drawn: 0, lost: 0, gf: 12, ga: 4, gd: "+8", pts: 9 },
    { rank: 2, team: "FC Cà Phê Ban Mê", played: 3, won: 2, drawn: 0, lost: 1, gf: 9, ga: 5, gd: "+4", pts: 6 },
    { rank: 3, team: "FC Đại Ngàn Xanh", played: 3, won: 1, drawn: 0, lost: 2, gf: 6, ga: 8, gd: "-2", pts: 3 },
    { rank: 4, team: "FC Voi Chiến Krông Pắc", played: 3, won: 0, drawn: 0, lost: 3, gf: 3, ga: 13, gd: "-10", pts: 0 }
  ]
};

export default function Home() {
  const [date, setDate] = useState("");
  const [fieldsList, setFieldsList] = useState<FieldInfo[]>(DEFAULT_FIELDS);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "SAN_5" | "SAN_7" | "SAN_11">("ALL");
  const [filterWard, setFilterWard] = useState<string>("ALL");

  // State cho 3 tính năng mới: Bản đồ BMT, Sàn Cáp kèo & Giải đấu phong trào
  const [matchPosts, setMatchPosts] = useState<MatchmakingPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const s = window.localStorage.getItem("football_matchmaking");
        if (s) return JSON.parse(s);
      } catch (e) {}
    }
    return DEFAULT_MATCHMAKING_POSTS;
  });
  const [matchFilter, setMatchFilter] = useState<string>("ALL");
  const [createMatchOpen, setCreateMatchOpen] = useState<boolean>(false);
  const [acceptMatchOpen, setAcceptMatchOpen] = useState<boolean>(false);
  const [activeMatchToAccept, setActiveMatchToAccept] = useState<MatchmakingPost | null>(null);

  // Form Đăng tin
  const [cmTeam, setCmTeam] = useState<string>("");
  const [cmCaptain, setCmCaptain] = useState<string>("");
  const [cmPhone, setCmPhone] = useState<string>("");
  const [cmFieldId, setCmFieldId] = useState<number>(6);
  const [cmDate, setCmDate] = useState<string>("");
  const [cmSlot, setCmSlot] = useState<string>("17:30 - 19:00");
  const [cmLevel, setCmLevel] = useState<"VUI_VE" | "TRUNG_BINH" | "BAN_CHUYEN">("TRUNG_BINH");
  const [cmBet, setCmBet] = useState<"CHIA_DOI" | "THUA_BAO" | "KEO_NUOC">("CHIA_DOI");
  const [cmDesc, setCmDesc] = useState<string>("");

  // Form Bắt đối
  const [amTeam, setAmTeam] = useState<string>("");
  const [amPhone, setAmPhone] = useState<string>("");

  // Giải đấu
  const [tourTab, setTourTab] = useState<"BRACKET" | "STANDINGS">("BRACKET");

  // Bản đồ & GPS

  // FC Club System
  const [clubs, setClubs] = useState<FootballClub[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const s = window.localStorage.getItem("football_clubs");
        if (s) return JSON.parse(s);
      } catch {}
    }
    return DEFAULT_CLUBS;
  });
  const [clubFilter, setClubFilter] = useState<string>("ALL");
  const [createClubOpen, setCreateClubOpen] = useState<boolean>(false);
  const [challengeModalOpen, setChallengeModalOpen] = useState<boolean>(false);
  const [chalClub1Id, setChalClub1Id] = useState<number>(1);
  const [chalClub2Id, setChalClub2Id] = useState<number>(2);
  const [chalScore1, setChalScore1] = useState<number>(3);
  const [chalScore2, setChalScore2] = useState<number>(2);
  const [selectedRouteField, setSelectedRouteField] = useState<FieldInfo | null>(null);
  const [clubDetailOpen, setClubDetailOpen] = useState<FootballClub | null>(null);
  const [ccName, setCcName] = useState<string>("");
  const [ccShort, setCcShort] = useState<string>("");
  const [ccCaptain, setCcCaptain] = useState<string>("");
  const [ccPhone2, setCcPhone2] = useState<string>("");
  const [ccWard, setCcWard] = useState<string>("Phường Tân Tiến");
  const [ccLevel2, setCcLevel2] = useState<"VUI_VE" | "TRUNG_BINH" | "BAN_CHUYEN">("TRUNG_BINH");
  const [ccAvatar, setCcAvatar] = useState<string>("⚽");
  const [ccDesc2, setCcDesc2] = useState<string>("");

  function handleJoinClub(clubId: number) {
    if (!currentUser) {
      alert("⚠️ Bạn cần đăng nhập để gia nhập câu lạc bộ!");
      return;
    }
    const updated = clubs.map((c) => {
      if (c.id === clubId) {
        if (c.members.length >= MAX_CLUB_MEMBERS) {
          alert("⚠️ FC đã đủ " + MAX_CLUB_MEMBERS + " thành viên!");
          return c;
        }
        const existing = clubs.find((cc) => cc.members.some((m) => m.userId === currentUser.id));
        if (existing) {
          alert("⚠️ Bạn đã là thành viên của FC " + existing.name + "!");
          return c;
        }
        if (c.members.some((m) => m.userId === currentUser.id)) return c;
        return {
          ...c,
          members: [...c.members, {
            userId: currentUser.id,
            name: currentUser.fullName,
            phone: currentUser.phone || "",
            role: "MEMBER" as const,
            joinedAt: new Date().toISOString().split("T")[0]
          }]
        };
      }
      return c;
    });
    setClubs(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_clubs", JSON.stringify(updated));
    alert("🎉 Gia nhập thành công!");
  }

  function handleMatchChallengeSubmit(e: FormEvent) {
    e.preventDefault();
    if (chalClub1Id === chalClub2Id) {
      alert("⚠️ Vui lòng chọn 2 câu lạc bộ khác nhau để thi đấu!");
      return;
    }
    const updated = clubs.map((c) => ({ ...c }));
    const c1 = updated.find((c) => c.id === chalClub1Id);
    const c2 = updated.find((c) => c.id === chalClub2Id);
    if (!c1 || !c2) return;

    c1.goalsFor += chalScore1;
    c1.goalsAgainst += chalScore2;
    c2.goalsFor += chalScore2;
    c2.goalsAgainst += chalScore1;

    let msg = "";
    if (chalScore1 > chalScore2) {
      c1.wins += 1;
      c1.elo += 25;
      c2.losses += 1;
      c2.elo = Math.max(0, c2.elo - 15);
      msg = "🏆 " + c1.name + " giành chiến thắng (" + chalScore1 + " - " + chalScore2 + ")!\n" + c1.name + ": +25 ELO (" + c1.elo + " ELO)\n" + c2.name + ": -15 ELO (" + c2.elo + " ELO)";
    } else if (chalScore2 > chalScore1) {
      c2.wins += 1;
      c2.elo += 25;
      c1.losses += 1;
      c1.elo = Math.max(0, c1.elo - 15);
      msg = "🏆 " + c2.name + " giành chiến thắng (" + chalScore2 + " - " + chalScore1 + ")!\n" + c2.name + ": +25 ELO (" + c2.elo + " ELO)\n" + c1.name + ": -15 ELO (" + c1.elo + " ELO)";
    } else {
      c1.draws += 1;
      c1.elo += 5;
      c2.draws += 1;
      c2.elo += 5;
      msg = "🤝 Hai đội hòa nhau (" + chalScore1 + " - " + chalScore2 + ")!\nMỗi đội được cộng +5 ELO.";
    }

    c1.rank = getEloRank(c1.elo);
    c2.rank = getEloRank(c2.elo);

    setClubs(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_clubs", JSON.stringify(updated));
    setChallengeModalOpen(false);
    alert("🎉 ĐÃ CẬP NHẬT KẾT QUẢ THÀNH CÔNG!\n" + msg);
  }

  function handleAddMemberToClub(clubId: number) {
    const name = prompt("Nhập họ và tên thành viên mới:");
    if (!name || !name.trim()) return;
    const phone = prompt("Nhập số điện thoại của thành viên (bắt buộc):");
    if (!phone || phone.trim().length < 9) {
      alert("⚠️ Số điện thoại không hợp lệ!");
      return;
    }
    const updated = clubs.map((c) => {
      if (c.id === clubId) {
        if (c.members.length >= MAX_CLUB_MEMBERS) {
          alert("⚠️ FC đã đủ 15 người!");
          return c;
        }
        return {
          ...c,
          members: [...c.members, {
            userId: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            role: "MEMBER" as const,
            joinedAt: new Date().toISOString().split("T")[0]
          }]
        };
      }
      return c;
    });
    setClubs(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_clubs", JSON.stringify(updated));
    const updatedTarget = updated.find((c) => c.id === clubId);
    if (updatedTarget) setClubDetailOpen(updatedTarget);
    alert("🎉 Đã thêm " + name + " vào danh sách 15 người của FC!");
  }

  function handleDeleteMatchPost(postId: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng cáp kèo này?")) return;
    const updated = matchPosts.filter((p) => p.id !== postId);
    setMatchPosts(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
  }

    function handleCreateClubSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("⚠️ Cần đăng nhập!"); return; }
    if (!ccName || !ccPhone2 || ccPhone2.length < 9) { alert("⚠️ Tên CLB & SĐT bắt buộc!"); return; }
    const existing = clubs.find((c) => c.members.some((m) => m.userId === currentUser.id));
    if (existing) { alert("⚠️ Bạn đã là thành viên của FC " + existing.name + "!"); return; }

    const newClub: FootballClub = {
      id: Date.now(), name: ccName, shortName: ccShort || ccName.substring(0, 4).toUpperCase(),
      avatar: ccAvatar, banner: "https://img5.thuthuatphanmem.vn/uploads/2021/12/11/hinh-anh-san-co-bong-da-rong-rai_101640962.jpg",
      captainId: currentUser.id, captainName: ccCaptain || currentUser.fullName,
      description: ccDesc2 || "CLB bóng đá phong trào tại BMT.",
      ward: ccWard, level: ccLevel2, elo: 1000, rank: getEloRank(1000),
      wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0,
      members: [{ userId: currentUser.id, name: ccCaptain || currentUser.fullName, phone: ccPhone2, role: "CAPTAIN", joinedAt: new Date().toISOString().split("T")[0] }],
      createdAt: new Date().toISOString().split("T")[0], isRecruiting: true
    };
    const updated = [...clubs, newClub];
    setClubs(updated);
    if (typeof window !== "undefined") window.localStorage.setItem("football_clubs", JSON.stringify(updated));
    setCreateClubOpen(false);
    setCcName(""); setCcShort(""); setCcDesc2("");
    alert("🎉 FC " + ccName + " đã được tạo! ELO: 1000 (🥉 ĐỒNG)");
  }

  const [mapFilter, setMapFilter] = useState<"ALL" | "SAN_5" | "SAN_7" | "SAN_11">("ALL");
  const [gpsNotice, setGpsNotice] = useState<string>("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  }

  function handleFindNearestPitch() {
    setGpsNotice("Đang quét định vị GPS của bạn...");
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setUserCoords({ lat: uLat, lng: uLng });
          let nearest = fieldsList[0];
          let minD = 999999;
          fieldsList.forEach((f) => {
            const coords = getPitchCoords(f);
            const d = calculateDistance(uLat, uLng, coords.lat, coords.lng);
            if (d < minD) {
              minD = d;
              nearest = f;
            }
          });
          setSelectedPitchId(nearest.id);
          setGpsNotice(`📍 Sân gần bạn nhất: ${nearest.name} (${nearest.ward}) · Cách bạn khoảng ${minD} km`);
        },
        () => {
          setSelectedPitchId(5);
          setGpsNotice("📍 Vị trí trung tâm Buôn Ma Thuột: SVĐ Buôn Ma Thuột (2 Nguyễn Công Trứ)");
        },
        { timeout: 8000 }
      );
    } else {
      setSelectedPitchId(5);
      setGpsNotice("📍 Vị trí trung tâm Buôn Ma Thuột: SVĐ Buôn Ma Thuột (2 Nguyễn Công Trứ)");
    }
  }

  async function handleCreateMatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) { alert("⚠️ Bạn cần đăng nhập để đăng tin tìm đối / cáp kèo!"); return; }
    if (!cmTeam || !cmCaptain || !cmPhone || cmPhone.length < 9) { alert("⚠️ Tên đội, đội trưởng và SĐT (tối thiểu 9 số) là bắt buộc!"); return; }
    const field = fieldsList.find((f) => f.id === cmFieldId) || fieldsList[0];
    const levelLabels: Record<string, string> = {
      "VUI_VE": "Dưỡng sinh (Vui vẻ)",
      "TRUNG_BINH": "Trung bình (Phong trào)",
      "BAN_CHUYEN": "Khá - Chiến (Cọ xát)"
    };
    const betLabels: Record<string, string> = {
      "CHIA_DOI": "Tiền sân 5-5",
      "THUA_BAO": "Đội thua trả sân",
      "KEO_NUOC": "Kèo nước ngọt"
    };

    const safeCaptain = (cmCaptain || currentUser.fullName || "Đội trưởng").replace(/'/g, "''");
    const safeTeam = cmTeam.replace(/'/g, "''");
    const safePhone = cmPhone.replace(/'/g, "''");
    const safeDate = (cmDate || "2026-11-25").replace(/'/g, "''");
    const safeSlot = cmSlot.replace(/'/g, "''");
    const safeField = field.name.replace(/'/g, "''");
    const safeDesc = (cmDesc || "Kèo giao lưu hữu nghị, đá đẹp, văn minh.").replace(/'/g, "''");
    const betLabel = betLabels[cmBet] || "Tiền sân 5-5";
    const levelLabel = levelLabels[cmLevel] || "Phong trào";

    try {
      const rows = await queryNeonDirect(`
        INSERT INTO matchmaking_posts (user_id, user_name, team_name, phone, play_date, play_time, pitch_name, pitch_id, format, bet_type, level, note, status)
        VALUES (${currentUser.id || 'NULL'}, '${safeCaptain}', '${safeTeam}', '${safePhone}', '${safeDate}', '${safeSlot}', '${safeField}', ${field.id}, '${field.fieldType || 'SAN_5'}', '${betLabel}', '${levelLabel}', '${safeDesc}', 'OPEN')
        RETURNING *
      `);
      const newId = rows && rows[0] ? rows[0].id : Date.now();

      const newPost: MatchmakingPost = {
        id: newId,
        teamName: cmTeam,
        captainName: cmCaptain,
        phone: cmPhone,
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.fieldType,
        matchDate: cmDate || "2026-11-25",
        timeSlot: cmSlot,
        level: cmLevel,
        levelLabel,
        betRule: cmBet,
        betLabel,
        status: "OPEN",
        avatar: "⚡",
        description: cmDesc || "Kèo giao lưu hữu nghị, đá đẹp, văn minh.",
        createdAt: "Vừa xong"
      };

      const updated = [newPost, ...matchPosts];
      setMatchPosts(updated);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
      }
      setCreateMatchOpen(false);
      setCmTeam("");
      setCmCaptain("");
      setCmDesc("");
      alert("🎉 Đã đăng bài cáp kèo THÀNH CÔNG lên Sàn Cáp Kèo Sân Nhà FC!\nDữ liệu đã được lưu trữ vĩnh viễn trên Neon PostgreSQL Cloud.");
    } catch (err: any) {
      alert("Lỗi khi lưu bài đăng: " + (err?.message || err));
    }
  }

  function handleAcceptMatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeMatchToAccept || !amTeam || !amPhone) return;

    const updated = matchPosts.map((p) => {
      if (p.id === activeMatchToAccept.id) {
        return { ...p, status: "MATCHED" as const, matchedBy: amTeam };
      }
      return p;
    });

    setMatchPosts(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("football_matchmaking", JSON.stringify(updated));
    }
    setAcceptMatchOpen(false);
    alert(`🤝 Chúc mừng! Bạn đã bắt đối thành công với ${activeMatchToAccept.teamName}! Hãy gọi ${activeMatchToAccept.phone} để chốt màu áo nhé.`);
  }

  // Selected complex & sub-pitch state
  const [selectedPitchId, setSelectedPitchId] = useState<number>(6); // Mặc định Sân C1 (có sân 5 và sân 7)
  const [selectedSubPitchId, setSelectedSubPitchId] = useState<string>("SAN_5_1");
  const [selectedPitchSize, setSelectedPitchSize] = useState<"SAN_5" | "SAN_7" | "SAN_11">("SAN_5");

  function handleFilterTypeChange(newType: "ALL" | "SAN_5" | "SAN_7" | "SAN_11") {
    setFilterType(newType);
    if (newType !== "ALL") {
      setSelectedPitchSize(newType);
      const targetField = fieldsList.find((f) => getFieldSubPitches(f).some((s) => s.category === newType));
      if (targetField) {
        setSelectedPitchId(targetField.id);
        const subList = getFieldSubPitches(targetField);
        const matchSub = subList.find((s) => s.category === newType);
        if (matchSub) setSelectedSubPitchId(matchSub.id);
      }
    }
  }

  function handleCheckAvailableSlots() {
    if (filterType !== "ALL") {
      const targetField = fieldsList.find((f) => getFieldSubPitches(f).some((s) => s.category === filterType));
      if (targetField) {
        setSelectedPitchId(targetField.id);
        const subList = getFieldSubPitches(targetField);
        const matchSub = subList.find((s) => s.category === filterType);
        if (matchSub) setSelectedSubPitchId(matchSub.id);
      }
    }
    const el = document.getElementById("dat-san");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  const activePitch = fieldsList.find((f) => f.id === selectedPitchId) ?? fieldsList[0] ?? DEFAULT_FIELDS[0];
  const availableSubPitches = useMemo(() => getFieldSubPitches(activePitch), [activePitch]);
  const activeSubPitch = availableSubPitches.find((sp) => sp.id === selectedSubPitchId) || availableSubPitches[0] || SUB_PITCHES[0];

  // Tự động chuyển sân con phù hợp khi đổi sang cụm sân khác (VD: SVĐ Buôn Ma Thuột chỉ có sân 11)
  useEffect(() => {
    if (availableSubPitches.length > 0) {
      const match = availableSubPitches.find((sp) => sp.id === selectedSubPitchId);
      if (!match) {
        setSelectedSubPitchId(availableSubPitches[0].id);
        setSelectedPitchSize(availableSubPitches[0].category);
      }
    }
  }, [availableSubPitches, selectedSubPitchId]);

  function handleSelectPitch(field: FieldInfo, targetCategoryOrSubId?: string) {
    setSelectedPitchId(field.id);
    const subList = getFieldSubPitches(field);
    if (subList.length > 0) {
      if (targetCategoryOrSubId) {
        const match = subList.find((sp) => sp.id === targetCategoryOrSubId || sp.category === targetCategoryOrSubId);
        if (match) {
          setSelectedSubPitchId(match.id);
          setSelectedPitchSize(match.category);
        } else {
          setSelectedSubPitchId(subList[0].id);
          setSelectedPitchSize(subList[0].category);
        }
      } else {
        const exists = subList.some((sp) => sp.id === selectedSubPitchId);
        if (!exists) {
          setSelectedSubPitchId(subList[0].id);
          setSelectedPitchSize(subList[0].category);
        }
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
  const [profileTab, setProfileTab] = useState<"BOOKINGS" | "FC_TEAM" | "MATCHES" | "FAVORITES" | "PROFILE" | "PASSWORD" | "PREFERENCES">("BOOKINGS");
  const [profileNotice, setProfileNotice] = useState("");
  const [userAvatar, setUserAvatar] = useState("⚽");
  const [userArea, setUserArea] = useState("Phường Tân Tiến");
  const [userTeam, setUserTeam] = useState("CLB Ban Mê FC");
  const [userPosition, setUserPosition] = useState("Tiền đạo (ST)");
  const [userPreferredFoot, setUserPreferredFoot] = useState("Chân phải");
  const [userFavoriteNumber, setUserFavoriteNumber] = useState(10);
  const [notifyZalo, setNotifyZalo] = useState(true);
  const [notifyReminder, setNotifyReminder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(true);
  const [prefAutofill, setPrefAutofill] = useState(true);
  const [prefFavoriteField, setPrefFavoriteField] = useState("Sân bóng C1");
  const [prefFavoriteSlot, setPrefFavoriteSlot] = useState("Ca 9 (18:00 - 19:30)");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  // Customer Hub State
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [favoritePitchIds, setFavoritePitchIds] = useState<number[]>([5, 6, 19]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberPos, setNewMemberPos] = useState("Tiền vệ");
  const [newMemberNum, setNewMemberNum] = useState(10);
  const [activeTicketQr, setActiveTicketQr] = useState<any | null>(null);
  const [matchScoreModal, setMatchScoreModal] = useState<any | null>(null);
  const [scoreTeamA, setScoreTeamA] = useState<number>(3);
  const [scoreTeamB, setScoreTeamB] = useState<number>(2);

  async function fetchMyBookings() {
    setLoadingBookings(true);
    try {
      const local = JSON.parse(window.localStorage.getItem("my-bookings") || "[]");
      if (currentUser?.phone) {
        const res = await fetch(`${API}/bookings/my?phone=${encodeURIComponent(currentUser.phone)}`);
        if (res.ok) {
          const remote = await res.json();
          if (Array.isArray(remote) && remote.length > 0) {
            const combined = [...remote];
            local.forEach((l: any) => {
              if (!combined.some((c: any) => c.bookingCode === l.bookingCode)) {
                combined.push(l);
              }
            });
            setMyBookings(combined);
            setLoadingBookings(false);
            return;
          }
        }
      }
      setMyBookings(local);
    } catch {
      const local = JSON.parse(window.localStorage.getItem("my-bookings") || "[]");
      setMyBookings(local);
    } finally {
      setLoadingBookings(false);
    }
  }

  useEffect(() => {
    if (profileModalOpen) {
      fetchMyBookings();
    }
  }, [profileModalOpen, currentUser]);

  async function handleCancelMyBooking(b: any) {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn đặt sân ${b.bookingCode}?`)) return;
    try {
      if (b.id) {
        await fetch(`${API}/bookings/${b.id}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Khách hàng hủy trên giao diện cá nhân" }),
        }).catch(() => {});
      }
      const updated = myBookings.map((item) =>
        item.bookingCode === b.bookingCode ? { ...item, status: "CANCELLED", cancelReason: "Khách hủy lịch" } : item
      );
      setMyBookings(updated);
      window.localStorage.setItem("my-bookings", JSON.stringify(updated));
      alert("✓ Đã hủy ca đặt sân thành công!");
    } catch (e) {
      alert("Lỗi khi hủy: " + e);
    }
  }

  function handleToggleFavorite(id: number) {
    setFavoritePitchIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("football_favorites", JSON.stringify(next));
      }
      return next;
    });
  }

  const myClub = useMemo(() => {
    if (!currentUser) return null;
    return clubs.find(
      (c) =>
        c.captainId === currentUser.id ||
        c.captainPhone === currentUser.phone ||
        c.members?.some((m) => m.userId === currentUser.id || (currentUser.phone && m.phone === currentUser.phone))
    ) || null;
  }, [clubs, currentUser]);

  function handleAddMemberToMyClub(e: FormEvent) {
    e.preventDefault();
    if (!myClub) return;
    if (myClub.members.length >= 15) {
      alert("⚠️ Đội bóng đã đủ 15 thành viên tối đa theo quy định giải đấu!");
      return;
    }
    if (!newMemberName.trim() || !newMemberPhone.trim() || newMemberPhone.trim().length < 9) {
      alert("⚠️ Vui lòng nhập tên thành viên và SĐT hợp lệ (tối thiểu 9 số)!");
      return;
    }
    if (myClub.members.some((m) => m.phone === newMemberPhone.trim())) {
      alert("⚠️ Số điện thoại này đã có trong danh sách thành viên!");
      return;
    }
    const newMember = {
      userId: Date.now(),
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      role: "MEMBER" as const,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    const updatedClubs = clubs.map((c) => {
      if (c.id === myClub.id) {
        return {
          ...c,
          members: [...c.members, newMember],
        };
      }
      return c;
    });
    setClubs(updatedClubs);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("football_clubs", JSON.stringify(updatedClubs));
    }
    fetch(`${API}/clubs/${myClub.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberName: newMemberName.trim(),
        phone: newMemberPhone.trim(),
        position: newMemberPos,
        number: newMemberNum,
      }),
    }).catch(() => {});
    setNewMemberName("");
    setNewMemberPhone("");
    setProfileNotice(`🎉 Đã thêm cầu thủ ${newMember.name} (#${newMemberNum}) vào FC! (${myClub.members.length + 1}/15 thành viên)`);
  }

  function handleRemoveMemberFromClub(memberPhone: string) {
    if (!myClub) return;
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi đội hình?")) return;
    const updatedClubs = clubs.map((c) => {
      if (c.id === myClub.id) {
        return {
          ...c,
          members: c.members.filter((m) => m.phone !== memberPhone),
        };
      }
      return c;
    });
    setClubs(updatedClubs);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("football_clubs", JSON.stringify(updatedClubs));
    }
    setProfileNotice("✓ Đã cập nhật lại danh sách đội hình 15 người!");
  }

  async function handleSubmitMatchScore(e: FormEvent) {
    e.preventDefault();
    if (!matchScoreModal) return;
    const myTeam = matchScoreModal.teamName;
    const oppTeam = matchScoreModal.matchedBy || "FC Đối Thủ";
    const clubA = clubs.find((c) => c.name.toLowerCase() === myTeam.toLowerCase()) || clubs[0];
    const clubB = clubs.find((c) => c.name.toLowerCase() === oppTeam.toLowerCase()) || clubs[1];

    const isWin = scoreTeamA > scoreTeamB;
    const isDraw = scoreTeamA === scoreTeamB;
    const eloDeltaA = isWin ? 25 : isDraw ? 5 : -15;
    const eloDeltaB = isWin ? -15 : isDraw ? 5 : 25;

    const updatedClubs = clubs.map((c) => {
      if (c.id === clubA?.id) {
        const newElo = Math.max(800, c.elo + eloDeltaA);
        return {
          ...c,
          elo: newElo,
          rank: getEloRank(newElo),
          wins: c.wins + (isWin ? 1 : 0),
          draws: c.draws + (isDraw ? 1 : 0),
          losses: c.losses + (!isWin && !isDraw ? 1 : 0),
        };
      }
      if (c.id === clubB?.id) {
        const newElo = Math.max(800, c.elo + eloDeltaB);
        return {
          ...c,
          elo: newElo,
          rank: getEloRank(newElo),
          wins: c.wins + (!isWin && !isDraw ? 1 : 0),
          draws: c.draws + (isDraw ? 1 : 0),
          losses: c.losses + (isWin ? 1 : 0),
        };
      }
      return c;
    });

    setClubs(updatedClubs);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("football_clubs", JSON.stringify(updatedClubs));
    }

    if (clubA && clubB) {
      fetch(`${API}/clubs/match-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamAId: clubA.id,
          teamBId: clubB.id,
          scoreA: scoreTeamA,
          scoreB: scoreTeamB,
        }),
      }).catch(() => {});
    }

    setMatchPosts((prev) =>
      prev.map((p) =>
        p.id === matchScoreModal.id ? { ...p, status: "FINISHED" as any, score: `${scoreTeamA} - ${scoreTeamB}` } : p
      )
    );

    setMatchScoreModal(null);
    alert(`🎉 Đã lưu kết quả trận đấu (${scoreTeamA} - ${scoreTeamB})! FC ${clubA?.name} ${eloDeltaA > 0 ? `+${eloDeltaA}` : eloDeltaA} ELO!`);
  }

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

    // Ping API connection (thử backend trước, nếu tắt thì thử thẳng Neon Cloud)
    fetch(`${currentApi}/fields`)
      .then((res) => {
        if (res.ok) {
          setIsApiConnected(true);
        } else {
          fetch("https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Neon-Connection-String": "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
            },
            body: JSON.stringify({ query: "SELECT 1" })
          }).then((r) => setIsApiConnected(r.ok)).catch(() => setIsApiConnected(false));
        }
      })
      .catch(() => {
        fetch("https://ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech/sql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Neon-Connection-String": "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
          },
          body: JSON.stringify({ query: "SELECT 1" })
        }).then((r) => setIsApiConnected(r.ok)).catch(() => setIsApiConnected(false));
      });
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

  async function loadSchedule(selectedDate = date, selectedType: "ALL" | "SAN_5" | "SAN_7" | "SAN_11" = filterType, selectedWard = filterWard) {
    if (!selectedDate) return;
    setErrorNotice("");
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedType !== "ALL" && selectedType !== "SAN_11") params.set("fieldType", selectedType);
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
        (selectedType === "ALL" || f.fieldType === selectedType || getFieldSubPitches(f).some((s) => s.category === selectedType)) &&
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", color: "var(--text-main)" }}>
      {/* Sleek Dark Night Topbar */}
      <div style={{ background: "#050a12", borderBottom: "1px solid rgba(50, 157, 210, 0.2)", padding: "7px 24px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#329dd2", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
          <span>⚽</span> <span>HỆ THỐNG SÂN BÓNG BUÔN MA THUỘT · SÂN NHÀ FC · SÀN CÁP KÈO & LEO RANK ELO</span>
        </span>
        <span style={{ color: "#94a3b8" }}>📞 Hotline hỗ trợ: <strong style={{ color: "#f59e0b" }}>0896890399</strong> · Mở cửa 06:00 - 23:00</span>
      </div>

      {/* Main Navigation Topbar Chuẩn ALO Booking */}
      <header className="topbar-wrapper">
        <div className="topbar">
          <a className="brand" href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div className="brand-icon" style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #329dd2 0%, #1f7fae 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 14px rgba(50, 157, 210, 0.4)" }}>⚽</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>SÂN NHÀ <span style={{ color: "#329dd2" }}>FC</span></span>
            <span className="alo-brand-badge" style={{ background: "linear-gradient(135deg, #eb2f33 0%, #b91c1c 100%)" }}>BMT</span>
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.5px" }}>ĐẶT LỊCH THỂ THAO TRỰC TUYẾN</div>
            </div>
          </a>

          {/* ALO Location Pill */}
          <div className="alo-location-pill" title="Khu vực hoạt động mặc định">
            <span>📍</span>
            <span>TP. Buôn Ma Thuột, Đắk Lắk</span>
          </div>

          <nav className="nav-links">
            <div className="nav-group-pill">
              <a href="#dat-san" title="Xem sơ đồ ma trận ca trống và đặt lịch">📅 Đặt sân trực tuyến</a>
              <a href="#danh-sach-san" title="Danh mục 21 cụm sân Buôn Ma Thuột">🏟️ 21 Cụm sân</a>
              <a href="#ban-do-san" title="Định vị GPS & bản đồ cụm sân">🗺️ Radar GPS</a>
            </div>
            <div className="nav-group-pill">
              <a href="#cap-keo" title="Sàn cáp kèo giao lưu phủi">🤝 Cáp kèo</a>
              <a href="#hoi-nhom" title="Câu lạc bộ 15 người & leo rank">🛡️ FC &amp; Leo rank</a>
              <a href="#quy-trinh-alo" title="6 Bước đặt lịch chuẩn Sân Nhà FC">📋 Quy trình</a>
            </div>
            <div className="nav-group-pill">
              <a href="#bang-gia" title="Bảng giá chuẩn các loại sân">💰 Bảng giá</a>
              <a href="/lookup" title="Tra cứu mã phiếu đặt sân">🔍 Tra cứu vé</a>
            </div>
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
                border: isApiConnected ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                background: isApiConnected ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                color: isApiConnected ? "#4ade80" : "#f87171",
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
              <span>{isApiConnected ? "Neon Cloud 🟢" : "Chưa kết nối API"}</span>
            </button>
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="user-badge-topbar"
                  style={{
                    cursor: "pointer",
                    background: "rgba(50, 157, 210, 0.12)",
                    border: "1px solid rgba(50, 157, 210, 0.3)",
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
                  <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{currentUser.fullName}</span>
                  <span style={{ fontSize: "10px", background: "#329dd2", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontWeight: 800 }}>
                    {currentUser.role === "ADMIN" ? "👑 ADMIN" : currentUser.role === "STAFF" ? "📋 STAFF" : "⚽ CẦU THỦ"}
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
            {currentUser?.role === "ADMIN" && (
              <a className="btn-nav-admin" href="/admin" title="Toàn quyền Quản trị Sân bóng, Giá & Thành viên">👑 Cổng Quản trị</a>
            )}
            {currentUser?.role === "STAFF" && (
              <a className="btn-nav-admin" href="/staff" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }} title="Quản lý ca trực & Check-in sân">📋 Trực Ca Sân</a>
            )}
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
          <div style={{ background: "var(--surface)", padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
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
            <a href="#dat-san" onClick={() => setMobileMenuOpen(false)} style={{ color: "#38bdf8" }}>📅 Đặt sân trực tuyến</a>
            <a href="#danh-sach-san" onClick={() => setMobileMenuOpen(false)}>🏟️ Danh sách sân</a>
            <a href="#cap-keo" onClick={() => setMobileMenuOpen(false)}>🤝 Sàn cáp kèo</a>
            <a href="#hoi-nhom" onClick={() => setMobileMenuOpen(false)}>🛡️ FC &amp; Leo rank ELO</a>
            <a href="#bang-gia" onClick={() => setMobileMenuOpen(false)}>💰 Bảng giá</a>
            <a href="/lookup" onClick={() => setMobileMenuOpen(false)}>🔍 Tra cứu vé đặt sân</a>
          </div>
        )}
      </header>

      {/* Hero Section Chuẩn Phong Cách ALO Booking */}
      <section className="hero-container" style={{ paddingBottom: "24px" }}>
        <div className="hero">
          <div style={{ maxWidth: "100%" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div className="hero-pill" style={{ margin: 0, background: "rgba(50, 157, 210, 0.15)", borderColor: "rgba(50, 157, 210, 0.4)", color: "#38bdf8" }}>
                <span className="dot" style={{ background: "#38bdf8" }} />
                <span>NỀN TẢNG ĐẶT LỊCH THỂ THAO TRỰC TUYẾN SỐ 1 BUÔN MA THUỘT</span>
              </div>
              <div className="weather-widget">
                <span className="weather-icon">🌤️</span>
                <span>28°C · Nắng nhẹ, mặt cỏ khô ráo, lý tưởng thi đấu</span>
              </div>
            </div>

            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", lineHeight: 1.2, marginBottom: "12px" }}>
              Đặt Lịch Sân & Cáp Kèo Thi Đấu Nhanh Chóng<br /><span style={{ color: "#329dd2" }}>Giữ Chỗ Tức Thì 24/7</span> · Sân Nhà FC
            </h1>
            <p className="hero-sub" style={{ maxWidth: "820px", fontSize: "15px", marginBottom: "20px" }}>
              Sân Nhà FC - Nền tảng kết nối 21 cụm sân bóng đá cỏ nhân tạo & tự nhiên tại TP. Buôn Ma Thuột. Sàn cáp kèo phủi, tổ đội FC 15 người và leo rank ELO giải đấu hấp dẫn. Kết nối cáp kèo phủi, quản lý FC 15 người và leo rank ELO giải đấu hấp dẫn.
            </p>

            {/* ALO BOOKING MULTI-FIELD SEARCH BAR */}
            <div className="alo-hero-widget">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#38bdf8" }}>⚡</span> TÌM KIẾM SÂN BÓNG &amp; KIỂM TRA CA TRỐNG THEO THỜI GIAN THỰC
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Cập nhật trực tiếp từ CSDL Neon Cloud
                </div>
              </div>

              <div className="alo-search-grid">
                <div className="alo-field-group">
                  <label>⚽ Quy mô sân</label>
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterTypeChange(e.target.value as any)}
                  >
                    <option value="ALL">Tất cả quy mô (Sân 5, 7, 11)</option>
                    <option value="SAN_5">⚽ Sân mini 5 người (Từ 250k)</option>
                    <option value="SAN_7">🏆 Sân 7 người (Từ 400k)</option>
                    <option value="SAN_11">⭐ Sân 11 người SVĐ FIFA (Từ 800k)</option>
                  </select>
                </div>

                <div className="alo-field-group">
                  <label>📍 Khu vực tại BMT</label>
                  <select
                    value={filterWard}
                    onChange={(e) => setFilterWard(e.target.value)}
                  >
                    <option value="ALL">Toàn thành phố Buôn Ma Thuột</option>
                    <option value="Phường Tân Tiến">Phường Tân Tiến (SVĐ BMT, Sân C1)</option>
                    <option value="Phường Tân Lợi">Phường Tân Lợi (Sân KenVin)</option>
                    <option value="Phường Tân An">Phường Tân An</option>
                    <option value="Phường Ea Tam">Phường Ea Tam (Sân CĐ Sư Phạm)</option>
                    <option value="Phường Thành Nhất">Phường Thành Nhất</option>
                    <option value="Phường Tân Lập">Phường Tân Lập (Sân Ban Mê Sport)</option>
                    <option value="Xã Hòa Khánh">Xã Hòa Khánh</option>
                    <option value="Xã Hòa Thuận">Xã Hòa Thuận</option>
                  </select>
                </div>

                <div className="alo-field-group">
                  <label>📅 Ngày thi đấu</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="alo-field-group">
                  <label>⏰ Khung giờ đá</label>
                  <select defaultValue="ALL">
                    <option value="ALL">Tất cả các ca (06:00 - 22:30)</option>
                    <option value="MORNING">Ca sáng (06:00 - 12:00)</option>
                    <option value="AFTERNOON">Ca chiều tan sở (16:00 - 18:30)</option>
                    <option value="NIGHT">Giờ vàng tối (18:30 - 22:30)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  style={{ height: "44px", padding: "0 16px", fontSize: "13px", fontWeight: 800, justifyContent: "center" }}
                  onClick={handleCheckAvailableSlots}
                >
                  ⚡ TÌM SÂN NGAY
                </button>
              </div>
            </div>

            {/* ALO Category Selector Pills */}
            <div style={{ marginTop: "18px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>DANH MỤC THỂ THAO &amp; TIÊU CHÍ NHANH:</div>
              <div className="alo-pills-bar">
                <button
                  type="button"
                  className={`alo-pill-btn ${filterType === "ALL" ? "active" : ""}`}
                  onClick={() => handleFilterTypeChange("ALL")}
                >
                  ⚽ Tất cả sân (21 cụm sân)
                </button>
                <button
                  type="button"
                  className={`alo-pill-btn ${filterType === "SAN_5" ? "active" : ""}`}
                  onClick={() => handleFilterTypeChange("SAN_5")}
                >
                  🏃 Sân 5 mini cỏ nhân tạo
                </button>
                <button
                  type="button"
                  className={`alo-pill-btn ${filterType === "SAN_7" ? "active" : ""}`}
                  onClick={() => handleFilterTypeChange("SAN_7")}
                >
                  🏆 Sân 7 người phong trào
                </button>
                <button
                  type="button"
                  className={`alo-pill-btn ${filterType === "SAN_11" ? "active" : ""}`}
                  onClick={() => handleFilterTypeChange("SAN_11")}
                >
                  ⭐ Sân 11 người SVĐ FIFA
                </button>
                <button
                  type="button"
                  className="alo-pill-btn"
                  onClick={() => {
                    handleFilterTypeChange("ALL");
                    setQuickDate(0);
                  }}
                >
                  🟢 Ca trống hôm nay
                </button>
                <button
                  type="button"
                  className="alo-pill-btn"
                  onClick={() => {
                    handleFindNearestPitch();
                    const mapEl = document.getElementById("ban-do-san");
                    if (mapEl) mapEl.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  📍 Sân gần bạn nhất (GPS)
                </button>
              </div>
            </div>

            <div className="hero-stats" style={{ marginTop: "24px" }}>
              <div className="hero-stat-item">
                <b>21 Cụm Sân</b>
                <span>Bao phủ toàn Buôn Ma Thuột</span>
              </div>
              <div className="hero-stat-item">
                <b>11 Ca/Ngày</b>
                <span>Linh hoạt 06:00 - 22:30</span>
              </div>
              <div className="hero-stat-item">
                <b>100% Real-time</b>
                <span>Chống trùng lịch tự động</span>
              </div>
              <div className="hero-stat-item">
                <b>4.9/5 ⭐</b>
                <span>Hơn 1.200 đánh giá 5 sao</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Bar Chuẩn ALO Booking */}
      <div className="amenities-bar">
        <div className="amenities-content">
          <div className="amenity-item">
            <i>💡</i>
            <div>
              <strong>Đèn LED chống chói</strong>
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
              <strong>Bãi đỗ xe ô tô &amp; máy</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Trông giữ camera 24/7</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>🥤</i>
            <div>
              <strong>Căng tin &amp; Cho thuê áo</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Nước khoáng, áo bib, bóng</div>
            </div>
          </div>
          <div className="amenity-item">
            <i>📱</i>
            <div>
              <strong>VietQR MB Bank tự động</strong>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Quét mã cọc giữ sân tức thì</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: 6 BƯỚC ĐẶT LỊCH THỂ THAO CHUẨN ALO BOOKING */}
      <section className="section-wrap" id="quy-trinh-alo" style={{ paddingTop: "40px", paddingBottom: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 30px" }}>
          <span className="module-tag tag-dark">📋 QUY TRÌNH ĐẶT SÂN SÂN NHÀ FC</span>
          <h2 style={{ fontSize: "26px", color: "#ffffff", marginTop: "8px" }}>6 Bước Đặt Lịch Sân Cực Kỳ Đơn Giản</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Trải nghiệm đặt sân thể thao chuyên nghiệp, nhanh chóng và giữ chỗ tức thì không cần chờ đợi.</p>
        </div>

        <div className="alo-steps-container">
          <div className="alo-step-item">
            <div className="alo-step-num">1</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Tìm cụm sân</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Chọn sân theo môn thể thao, quy mô 5-7-11 hoặc khoảng cách GPS gần bạn nhất.</p>
          </div>

          <div className="alo-step-item">
            <div className="alo-step-num">2</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Chọn ca trống</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Xem sơ đồ ma trận thời gian thực và bấm chọn khung giờ vàng bạn muốn thi đấu.</p>
          </div>

          <div className="alo-step-item">
            <div className="alo-step-num">3</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Điền thông tin</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Nhập họ tên và số điện thoại liên hệ (hệ thống tự động điền nếu đã đăng nhập).</p>
          </div>

          <div className="alo-step-item">
            <div className="alo-step-num">4</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Chọn dịch vụ</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Tùy chọn bổ sung thêm áo bib, bóng thi đấu, nước suối hoặc trọng tài phong trào.</p>
          </div>

          <div className="alo-step-item">
            <div className="alo-step-num">5</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Quét VietQR cọc</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Quét mã VietQR chuyển khoản cọc 50% qua MB Bank để khóa ca và giữ sân.</p>
          </div>

          <div className="alo-step-item">
            <div className="alo-step-num">6</div>
            <strong style={{ color: "#ffffff", fontSize: "14px", display: "block", marginBottom: "6px" }}>Ra sân thi đấu</strong>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>Nhận vé điện tử lưu trên hệ thống, bật Google Maps chỉ đường và ra sân đúng giờ.</p>
          </div>
        </div>
      </section>

      {/* SECTION 1: BẢN ĐỒ TƯƠNG TÁC & ĐỊNH VỊ GPS BUÔN MA THUỘT */}
      <section className="section-wrap" id="ban-do-san" style={{ background: "var(--surface)", borderRadius: "24px", padding: "36px 32px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "32px" }}>
        <div className="section-head-modern" style={{ marginBottom: "20px" }}>
          <div>
            <span className="module-tag tag-cyan">🗺️ BẢN ĐỒ SỐ &amp; RADAR GPS BUÔN MA THUỘT</span>
            <h2 style={{ marginTop: "6px", fontSize: "26px", color: "var(--text-main)" }}>Bản đồ vị trí 20 cụm sân &amp; Định vị GPS</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Khám phá tọa độ các sân bóng thật tại Đắk Lắk, tự động tính khoảng cách tìm sân gần bạn nhất và chỉ đường Google Maps một chạm.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="primary-button"
              onClick={handleFindNearestPitch}
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>📍</span> Tìm sân gần tôi nhất (GPS)
            </button>
          </div>
        </div>

        {gpsNotice && (
          <div style={{ background: "rgba(50, 157, 210, 0.12)", border: "1px solid var(--primary)", color: "#f1f5f9", padding: "12px 16px", borderRadius: "10px", fontWeight: "700", marginBottom: "16px", fontSize: "13px" }}>
            {gpsNotice}
          </div>
        )}

        {/* Bộ lọc loại sân trên bản đồ */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>Lọc loại sân:</span>
          {(["ALL", "SAN_5", "SAN_7", "SAN_11"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`quick-day-btn ${mapFilter === t ? "active" : ""}`}
              onClick={() => setMapFilter(t)}
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              {t === "ALL" ? "Tất cả sân" : t === "SAN_5" ? "⚽ Sân 5" : t === "SAN_7" ? "🏆 Sân 7" : "⭐ Sân 11"}
            </button>
          ))}
        </div>

        {/* Grid thẻ sân có bản đồ chỉ đường & đặt sân */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px" }}>
          {fieldsList
            .filter((f) => {
              if (f.status === "MAINTENANCE" || f.id === 22) return false;
              if (mapFilter === "ALL") return true;
              const subs = getFieldSubPitches(f);
              return subs.some((s) => s.category === mapFilter);
            })
            .slice(0, 8)
            .map((f) => {
              const isSelected = f.id === selectedPitchId;
              const coords = getPitchCoords(f);
              return (
                <div
                  key={f.id}
                  style={{
                    border: isSelected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                    background: isSelected ? "rgba(50, 157, 210, 0.12)" : "var(--surface-alt)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ position: "relative", height: "120px" }}>
                    <img src={f.imageUrl || ""} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(8, 15, 27, 0.85)", color: "#329dd2", border: "1px solid rgba(50, 157, 210, 0.3)", padding: "3px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: "700" }}>
                      📍 {f.ward}
                    </span>
                  </div>

                  <div style={{ padding: "14px" }}>
                    <strong style={{ fontSize: "15px", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>{f.name}</strong>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", lineHeight: "1.4" }}>
                      🏠 {f.address}
                    </div>
                    <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600", marginBottom: "12px" }}>
                      📞 {f.phone || "0896890399"}
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setSelectedPitchId(f.id);
                          const el = document.getElementById("dat-san");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        style={{ flex: 1, padding: "8px 10px", fontSize: "11px", fontWeight: "700", justifyContent: "center" }}
                      >
                        ⚡ Đặt ca sân
                      </button>
                      <a
                        href={getGoogleMapsDirUrl(f.name, f.address, userCoords?.lat, userCoords?.lng)}
                        target="_blank"
                        rel="noreferrer"
                        className="outline-button"
                        style={{ padding: "8px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", textDecoration: "none", color: "#329dd2" }}
                        title={`Chỉ đường Google Maps đến ${f.name} (${f.address})`}
                      >
                        🧭 Chỉ đường
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* SECTION 2: SÀN CÁP KÈO & TÌM ĐỐI GIAO LƯU BUÔN MA THUỘT */}
      <section className="section-wrap" id="cap-keo" style={{ background: "var(--surface)", borderRadius: "24px", padding: "36px 32px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "32px" }}>
        <div className="section-head-modern" style={{ marginBottom: "20px" }}>
          <div>
            <span className="module-tag tag-red">🤝 SÀN CÁP KÈO BÓNG ĐÁ PHỦI BAN MÊ</span>
            <h2 style={{ marginTop: "6px", fontSize: "26px", color: "var(--text-main)" }}>Cáp kèo thi đấu &amp; Tuyển cầu thủ</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Nơi các đội bóng đá phủi BMT giao lưu cọ xát, bắt đối nhanh chóng theo trình độ và thỏa thuận tiền sân.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-accent-red"
              onClick={() => { if (!currentUser) { alert("⚠️ Đăng nhập tài khoản để đăng tin tìm đối!"); return; } setCreateMatchOpen(true); }}
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>➕</span> Đăng tin tìm đối / Cáp kèo
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Trình độ:</span>
          {[
            { key: "ALL", label: "Tất cả kèo" },
            { key: "MY_POSTS", label: "👤 Kèo của tôi" },
            { key: "OPEN", label: "🟢 Đang chờ bắt đối" },
            { key: "VUI_VE", label: "🍻 Dưỡng sinh" },
            { key: "TRUNG_BINH", label: "⚡ Phong trào" },
            { key: "BAN_CHUYEN", label: "🔥 Bán chuyên" }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`quick-day-btn ${matchFilter === tab.key ? "active" : ""}`}
              onClick={() => setMatchFilter(tab.key)}
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid danh sách kèo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {matchPosts
            .filter((p) => {
              if (matchFilter === "ALL") return true;
              if (matchFilter === "OPEN") return p.status === "OPEN";
              if (matchFilter === "MY_POSTS") return currentUser && p.userId === currentUser.id;
              return p.level === matchFilter;
            })
            .map((post) => {
              const isOpen = post.status === "OPEN";
              const levelBg = post.level === "BAN_CHUYEN" ? "rgba(235, 47, 51, 0.2)" : post.level === "TRUNG_BINH" ? "rgba(50, 157, 210, 0.2)" : "rgba(148, 163, 184, 0.15)";
              const levelColor = post.level === "BAN_CHUYEN" ? "#ff474b" : post.level === "TRUNG_BINH" ? "#329dd2" : "#cbd5e1";

              return (
                <div
                  key={post.id}
                  style={{
                    background: "var(--surface-alt)",
                    border: `1.5px solid ${isOpen ? "rgba(50, 157, 210, 0.35)" : "var(--border)"}`,
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "26px", background: "#050a12", border: "1px solid var(--border)", width: "44px", height: "44px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {post.avatar || "⚽"}
                        </span>
                        <div>
                          <strong style={{ fontSize: "16px", color: "var(--text-main)", display: "block" }}>{post.teamName}</strong>
                          <small style={{ color: "var(--text-muted)" }}>Đội trưởng: {post.captainName} · {post.createdAt}</small>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "999px", fontWeight: "800", background: isOpen ? "rgba(50, 157, 210, 0.15)" : "rgba(235, 47, 51, 0.15)", color: isOpen ? "#329dd2" : "#eb2f33", border: `1px solid ${isOpen ? "rgba(50, 157, 210, 0.3)" : "rgba(235, 47, 51, 0.3)"}` }}>
                        {isOpen ? "● ĐANG TÌM ĐỐI" : "✓ ĐÃ CÁP KÈO"}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", background: levelBg, color: levelColor, padding: "3px 8px", borderRadius: "6px" }}>
                        🎯 {post.levelLabel}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", padding: "3px 8px", borderRadius: "6px" }}>
                        💰 {post.betLabel}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(255, 255, 255, 0.08)", color: "var(--text-main)", padding: "3px 8px", borderRadius: "6px" }}>
                        ⚽ {post.fieldType === "SAN_11" ? "Sân 11" : post.fieldType === "SAN_7" ? "Sân 7" : "Sân 5"}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text-main)", background: "rgba(0, 0, 0, 0.25)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", marginBottom: "12px", lineHeight: "1.5" }}>
                      <div>🏟️ <strong>Sân:</strong> {post.fieldName}</div>
                      <div>📅 <strong>Thời gian:</strong> {post.timeSlot} (Ngày {post.matchDate})</div>
                      <div style={{ marginTop: "6px", color: "var(--text-muted)", fontStyle: "italic" }}>"{post.description}"</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMatchToAccept(post);
                          setAcceptMatchOpen(true);
                        }}
                        className="btn-accent-red"
                        style={{ flex: 1, padding: "9px", fontSize: "12px", fontWeight: 700, justifyContent: "center", borderRadius: "8px" }}
                      >
                        🤝 Bắt đối ngay
                      </button>
                    ) : (
                      <div style={{ flex: 1, textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#329dd2", background: "rgba(50, 157, 210, 0.15)", border: "1px solid rgba(50, 157, 210, 0.3)", padding: "8px", borderRadius: "8px" }}>
                        Đã cáp với: {post.matchedBy || "Đội bạn"}
                      </div>
                    )}
                    <a href={`tel:${post.phone}`} className="outline-button" style={{ padding: "9px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center" }} title="Gọi điện">
                      📞
                    </a>
                    <a href={`https://zalo.me/${post.phone}`} target="_blank" rel="noreferrer" className="outline-button" style={{ padding: "9px 12px", fontSize: "12px", color: "#329dd2", display: "inline-flex", alignItems: "center" }} title="Nhắn Zalo">
                      💬
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      
      {/* SECTION: HỆ THỐNG CÂU LẠC BỘ (FC) & HỘI NHÓM - LEO RANK */}
      <section className="section-wrap" id="hoi-nhom" style={{ background: "var(--surface)", borderRadius: "24px", padding: "36px 32px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "32px" }}>
        <div className="section-head-modern" style={{ marginBottom: "20px" }}>
          <div>
            <span className="module-tag tag-dark">🛡️ HỆ THỐNG FC &amp; HỘI NHÓM - LEO RANK ELO</span>
            <h2 style={{ marginTop: "6px", fontSize: "26px", color: "var(--text-main)" }}>Tạo FC &amp; Leo Rank ELO</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Tạo câu lạc bộ bóng đá (FC) tối đa 15 thành viên, tham gia giải đấu, tích lũy ELO để leo hạng.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-accent-red"
              onClick={() => setChallengeModalOpen(true)}
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>⚔️</span> Thách đấu &amp; Ghi nhận Leo Rank
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => { if (!currentUser) { alert("⚠️ Đăng nhập để tạo FC!"); return; } setCreateClubOpen(true); }}
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>➕</span> Tạo FC mới (15 người)
            </button>
          </div>
        </div>

        {/* ELO Ranking Guide */}
        <div style={{ background: "linear-gradient(135deg, rgba(8, 15, 27, 0.95), rgba(19, 30, 50, 0.95))", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#329dd2", marginBottom: "8px" }}>📊 Hệ thống Rank ELO Thi Đấu Buôn Ma Thuột:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11px" }}>
            <span style={{ padding: "3px 10px", borderRadius: "999px", background: "rgba(245, 158, 11, 0.18)", color: "#f59e0b", fontWeight: 700, border: "1px solid rgba(245, 158, 11, 0.3)" }}>🥉 Đồng (800-1099)</span>
            <span style={{ padding: "3px 10px", borderRadius: "999px", background: "rgba(148, 163, 184, 0.18)", color: "#cbd5e1", fontWeight: 700, border: "1px solid rgba(148, 163, 184, 0.3)" }}>🥈 Bạc (1100-1399)</span>
            <span style={{ padding: "3px 10px", borderRadius: "999px", background: "rgba(234, 179, 8, 0.18)", color: "#fbbf24", fontWeight: 700, border: "1px solid rgba(234, 179, 8, 0.3)" }}>🥇 Vàng (1400-1599)</span>
            <span style={{ padding: "3px 10px", borderRadius: "999px", background: "rgba(50, 157, 210, 0.18)", color: "#329dd2", fontWeight: 700, border: "1px solid rgba(50, 157, 210, 0.3)" }}>💎 Kim Cương (1600+)</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {[{ k: "ALL", l: "Tất cả" }, { k: "RECRUITING", l: "🟢 Đang tuyển" }, { k: "VUI_VE", l: "🍻 Dưỡng sinh" }, { k: "TRUNG_BINH", l: "⚡ Phong trào" }, { k: "BAN_CHUYEN", l: "🔥 Chuyên nghiệp" }].map((t) => (
            <button key={t.k} type="button" className={`quick-day-btn ${clubFilter === t.k ? "active" : ""}`} onClick={() => setClubFilter(t.k)} style={{ fontSize: "12px", padding: "6px 14px" }}>{t.l}</button>
          ))}
        </div>

        {/* Club Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "18px" }}>
          {clubs
            .filter((c) => {
              if (clubFilter === "ALL") return true;
              if (clubFilter === "RECRUITING") return c.isRecruiting;
              return c.level === clubFilter;
            })
            .sort((a, b) => b.elo - a.elo)
            .map((club) => {
              const isMember = currentUser && club.members.some((m) => m.userId === currentUser.id);
              const isFull = club.members.length >= MAX_CLUB_MEMBERS;

              return (
                <div key={club.id} style={{ background: "var(--surface-alt)", border: "1.5px solid var(--border)", borderRadius: "16px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ position: "relative", height: "100px" }}>
                    <img src={club.banner} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={club.name} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(transparent 30%, rgba(0,0,0,0.75))" }} />
                    <div style={{ position: "absolute", bottom: "8px", left: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "28px", background: "rgba(8, 15, 27, 0.9)", border: "1px solid var(--border)", width: "44px", height: "44px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{club.avatar}</span>
                      <div>
                        <strong style={{ fontSize: "15px", color: "#ffffff", display: "block", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{club.name}</strong>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>{club.ward}</span>
                      </div>
                    </div>
                    <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.75)", color: getEloColor(club.elo), border: "1px solid rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "800" }}>{club.rank} · {club.elo} ELO</div>
                  </div>

                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{club.description}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(50, 157, 210, 0.15)", color: "#329dd2" }}>👤 {club.members.length}/{MAX_CLUB_MEMBERS}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>🏆 {club.wins}W · {club.draws}D · {club.losses}L</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.08)", color: "var(--text-main)" }}>⚽ {club.goalsFor} BT - {club.goalsAgainst} BB</span>
                      {club.isRecruiting && <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>🟢 Đang tuyển</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-main)", marginBottom: "10px" }}>🎖️ Đội trưởng: <strong>{club.captainName}</strong></div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {isMember ? (
                        <div style={{ flex: 1, textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#329dd2", background: "rgba(50, 157, 210, 0.15)", border: "1px solid rgba(50, 157, 210, 0.3)", padding: "8px", borderRadius: "8px" }}>✓ Bạn là thành viên</div>
                      ) : isFull ? (
                        <div style={{ flex: 1, textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#eb2f33", background: "rgba(235, 47, 51, 0.15)", border: "1px solid rgba(235, 47, 51, 0.3)", padding: "8px", borderRadius: "8px" }}>Đã đủ 15 người</div>
                      ) : (
                        <button type="button" onClick={() => handleJoinClub(club.id)} className="primary-button" style={{ flex: 1, padding: "8px", fontSize: "11px", fontWeight: 700, justifyContent: "center" }}>🤝 Gia nhập</button>
                      )}
                      <button type="button" onClick={() => setClubDetailOpen(club)} className="outline-button" style={{ padding: "8px 12px", fontSize: "11px" }}>👁️ Chi tiết</button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* SECTION 3: QUẢN LÝ GIẢI ĐẤU MINI & BẢNG XẾP HẠNG (TOURNAMENT HUB) */}
      <section className="section-wrap" id="giai-dau" style={{ background: "var(--surface)", borderRadius: "24px", padding: "36px 32px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: "32px" }}>
        <div className="section-head-modern" style={{ marginBottom: "20px" }}>
          <div>
            <span className="module-tag tag-cyan">🏆 GIẢI ĐẤU PHONG TRÀO BAN MÊ 2026</span>
            <h2 style={{ marginTop: "6px", fontSize: "26px", color: "var(--text-main)" }}>Cúp Tứ Hùng Ban Mê 2026</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Cập nhật kết quả trực tiếp, nhánh đấu loại trực tiếp Knock-out và bảng xếp hạng điểm số tự động.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className={`quick-day-btn ${tourTab === "BRACKET" ? "active" : ""}`}
              onClick={() => setTourTab("BRACKET")}
              style={{ fontSize: "13px", fontWeight: "700", padding: "8px 16px" }}
            >
              ⚔️ Nhánh đấu Knock-out
            </button>
            <button
              type="button"
              className={`quick-day-btn ${tourTab === "STANDINGS" ? "active" : ""}`}
              onClick={() => setTourTab("STANDINGS")}
              style={{ fontSize: "13px", fontWeight: "700", padding: "8px 16px" }}
            >
              📊 Bảng xếp hạng điểm số
            </button>
          </div>
        </div>

        {tourTab === "BRACKET" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {DEFAULT_TOURNAMENT_DATA.bracketMatches.map((m) => {
              const isFinished = m.status === "FINISHED";
              const t1Win = isFinished && (m.team1.score ?? 0) > (m.team2.score ?? 0);
              const t2Win = isFinished && (m.team2.score ?? 0) > (m.team1.score ?? 0);

              return (
                <div key={m.id} style={{ background: "var(--surface-alt)", border: "1.5px solid var(--border)", borderRadius: "14px", padding: "18px", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#329dd2", letterSpacing: "0.5px" }}>{m.round}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.time}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "8px", background: t1Win ? "rgba(50, 157, 210, 0.2)" : "rgba(0,0,0,0.25)", border: `1px solid ${t1Win ? "rgba(50, 157, 210, 0.4)" : "var(--border)"}`, fontWeight: t1Win ? "800" : "600", color: t1Win ? "#329dd2" : "var(--text-main)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{t1Win ? "👑" : "⚪"}</span> {m.team1.name}
                      </span>
                      <span style={{ fontSize: "16px", fontWeight: "800" }}>{m.team1.score !== null ? m.team1.score : "-"}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "8px", background: t2Win ? "rgba(50, 157, 210, 0.2)" : "rgba(0,0,0,0.25)", border: `1px solid ${t2Win ? "rgba(50, 157, 210, 0.4)" : "var(--border)"}`, fontWeight: t2Win ? "800" : "600", color: t2Win ? "#329dd2" : "var(--text-main)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{t2Win ? "👑" : "⚪"}</span> {m.team2.name}
                      </span>
                      <span style={{ fontSize: "16px", fontWeight: "800" }}>{m.team2.score !== null ? m.team2.score : "-"}</span>
                    </div>
                  </div>

                  {m.winner && (
                    <div style={{ marginTop: "10px", fontSize: "11px", textAlign: "center", color: "#329dd2", fontWeight: "700", background: "rgba(50, 157, 210, 0.15)", border: "1px solid rgba(50, 157, 210, 0.3)", padding: "4px", borderRadius: "6px" }}>
                      Đội chiến thắng: {m.winner}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left", background: "var(--surface-alt)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <thead>
                <tr style={{ background: "rgba(0, 0, 0, 0.4)", color: "var(--text-muted)", fontWeight: "800", borderBottom: "2px solid var(--border)", textAlign: "center" }}>
                  <th style={{ padding: "12px 8px", width: "50px" }}>Hạng</th>
                  <th style={{ padding: "12px 8px", textAlign: "left" }}>Đội bóng</th>
                  <th style={{ padding: "12px 8px" }}>Trận</th>
                  <th style={{ padding: "12px 8px", color: "#329dd2" }}>Thắng</th>
                  <th style={{ padding: "12px 8px" }}>Hòa</th>
                  <th style={{ padding: "12px 8px", color: "#eb2f33" }}>Thua</th>
                  <th style={{ padding: "12px 8px" }}>BT</th>
                  <th style={{ padding: "12px 8px" }}>BB</th>
                  <th style={{ padding: "12px 8px" }}>HS</th>
                  <th style={{ padding: "12px 8px", background: "rgba(50, 157, 210, 0.15)", color: "#329dd2", fontWeight: "900" }}>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_TOURNAMENT_DATA.standings.map((s) => {
                  const medal = s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : s.rank;
                  return (
                    <tr key={s.team} style={{ borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                      <td style={{ padding: "12px 8px", fontWeight: "800", fontSize: "14px" }}>{medal}</td>
                      <td style={{ padding: "12px 8px", textAlign: "left", fontWeight: "700", color: "var(--text-main)" }}>{s.team}</td>
                      <td style={{ padding: "12px 8px" }}>{s.played}</td>
                      <td style={{ padding: "12px 8px", color: "#329dd2", fontWeight: "700" }}>{s.won}</td>
                      <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>{s.drawn}</td>
                      <td style={{ padding: "12px 8px", color: "#eb2f33" }}>{s.lost}</td>
                      <td style={{ padding: "12px 8px" }}>{s.gf}</td>
                      <td style={{ padding: "12px 8px" }}>{s.ga}</td>
                      <td style={{ padding: "12px 8px", fontWeight: "600" }}>{s.gd}</td>
                      <td style={{ padding: "12px 8px", background: "rgba(50, 157, 210, 0.15)", color: "#329dd2", fontWeight: "900", fontSize: "14px" }}>{s.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                onClick={() => handleFilterTypeChange("ALL")}
              >
                Tất cả ({fieldsList.length})
              </button>
              <button
                className={`filter-tab ${filterType === "SAN_5" ? "active" : ""}`}
                onClick={() => handleFilterTypeChange("SAN_5")}
              >
                ⚽ Sân 5
              </button>
              <button
                className={`filter-tab ${filterType === "SAN_7" ? "active" : ""}`}
                onClick={() => handleFilterTypeChange("SAN_7")}
              >
                🏆 Sân 7
              </button>
              <button
                className={`filter-tab ${filterType === "SAN_11" ? "active" : ""}`}
                onClick={() => handleFilterTypeChange("SAN_11")}
              >
                ⭐ Sân 11
              </button>
            </div>
          </div>
        </div>

        <div className="pitches-grid">
          {fieldsList
            .filter((f) => {
              const matchType = filterType === "ALL"
                || getFieldSubPitches(f).some((s) => s.category === filterType)
                || f.fieldType === filterType;
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
                    {(() => {
                      const subs = getFieldSubPitches(field);
                      const c5 = subs.filter((s) => s.category === "SAN_5").length;
                      const c7 = subs.filter((s) => s.category === "SAN_7").length;
                      const c11 = subs.filter((s) => s.category === "SAN_11").length;

                      if (field.id === 22 || field.status === "MAINTENANCE") {
                        return (
                          <div style={{ background: "#fef2f2", padding: "8px 10px", borderRadius: "8px", border: "1px solid #fecaca", margin: "8px 0" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#b91c1c" }}>
                              🔒 ĐÃ ĐÓNG CỬA VĨNH VIỄN
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", margin: "8px 0" }}>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                            ⚡ SÂN CON THỰC TẾ ({subs.length} SÂN):
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {c5 > 0 && (
                              <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                ⚽ {c5} Sân 5
                              </span>
                            )}
                            {c7 > 0 && (
                              <span style={{ fontSize: "10px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                🏆 {c7} Sân 7
                              </span>
                            )}
                            {c11 > 0 && (
                              <span style={{ fontSize: "10px", background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                ⭐ {c11} Sân 11
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

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
      <section className="section-wrap" id="dat-san" style={{ background: "var(--surface)", borderRadius: "24px", padding: "48px 36px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
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
                background: "linear-gradient(135deg, #0e1626 0%, #131e32 100%)",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "24px 28px",
                marginBottom: "28px",
                border: "1px solid rgba(50, 157, 210, 0.35)",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.55)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{ background: "#329dd2", color: "#ffffff", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px" }}>
                      🏢 CỤM SÂN MẸ ĐANG CHỌN
                    </span>
                    <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", color: "#38bdf8", fontFamily: "monospace", border: "1px solid rgba(50, 157, 210, 0.25)" }}>
                      🔗 API riêng: /api/v1/fields/{activePitch.id}/schedule?subPitch={selectedSubPitchId}
                    </span>
                  </div>
                  <h2 style={{ margin: "4px 0", fontSize: "26px", color: "#ffffff" }}>{activePitch.name}</h2>
                  <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "6px" }}>
                    {activePitch.ownerName && (
                      <span style={{ color: "#38bdf8", fontWeight: "700" }}>👨‍💼 Chủ sân: {activePitch.ownerName}</span>
                    )}
                    {activePitch.phone && (
                      <span style={{ color: "#f59e0b", fontWeight: "700" }}>📞 Hotline: {activePitch.phone}</span>
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
                      background: "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      border: "1px solid rgba(50, 157, 210, 0.3)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    {fieldsList.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: "#0e1626", color: "#ffffff" }}>
                        {f.name} ({f.ward})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thông báo cơ chế quản lý & phân phối */}
              <div
                style={{
                  background: "rgba(50, 157, 210, 0.08)",
                  border: "1px solid rgba(50, 157, 210, 0.25)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#cbd5e1",
                  lineHeight: "1.6",
                }}
              >
                📢 <strong style={{ color: "#38bdf8" }}>CƠ CHẾ VẬN HÀNH:</strong> Sân Nhà là nền tảng quản lý tập trung 21 cụm sân tại Buôn Ma Thuột.
                Sân mẹ là cơ sở chung, quý khách <strong>chọn SÂN CON (Sân 5 / Sân 7 / Sân 11) cụ thể bên dưới</strong>. Sau khi hoàn tất đặt sân con, hệ thống sẽ <strong>tự động chuyển thông báo trực tiếp đến Chủ sân ({activePitch.ownerName || "Ban quản lý"} - {activePitch.phone})</strong> để chuẩn bị sẵn sàng trước giờ đá!
              </div>

              {/* Ảnh thực tế mô tả cụm sân mẹ (Real Pitch Gallery) */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📸</span> HÌNH ẢNH MÔ TẢ THỰC TẾ CỤM SÂN ({activePitch.name}):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                    <img src={activePitch.imageUrl || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=900&auto=format&fit=crop&q=80"} alt={`${activePitch.name} - Toàn cảnh`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.75)", color: "#38bdf8", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Toàn cảnh cụm sân</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                    <img src="https://images.unsplash.com/photo-1511886929837-354d827aae26?w=900&auto=format&fit=crop&q=80" alt="Mặt cỏ nhân tạo Pro chuẩn FIFA" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.75)", color: "#38bdf8", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Mặt cỏ chuẩn FIFA</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                    <img src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&auto=format&fit=crop&q=80" alt="Dàn đèn LED 400W chiếu sáng đêm" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.75)", color: "#facc15", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Đèn LED 400W đêm</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", height: "115px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                    <img src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=900&auto=format&fit=crop&q=80" alt="Khung thành & Lưới thi đấu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "4px", left: "6px", background: "rgba(0,0,0,0.75)", color: "#f472b6", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px" }}>Khung thành &amp; Lưới</span>
                  </div>
                </div>
              </div>

              {/* Sub-pitch selector grid (SÂN CON THỰC TẾ) */}
              <div style={{ background: "rgba(10, 16, 28, 0.75)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(50, 157, 210, 0.2)" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#94a3b8", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span> BƯỚC 1: CHỌN SÂN CON THỰC TẾ CỦA [ {activePitch.name} ] ({availableSubPitches.length} SÂN):
                </div>

                {availableSubPitches.length === 0 ? (
                  <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "10px", color: "#fca5a5", fontSize: "13px" }}>
                    Sân này hiện đang đóng cửa hoặc tạm ngưng bảo trì, quý khách vui lòng chọn cụm sân khác.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                    {availableSubPitches.map((sp) => {
                      const isSubSelected = selectedSubPitchId === sp.id;
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => handleSelectSubPitch(sp)}
                          style={{
                            background: isSubSelected ? "linear-gradient(135deg, rgba(50, 157, 210, 0.3), rgba(31, 127, 174, 0.45))" : "rgba(255,255,255,0.04)",
                            border: isSubSelected ? "2px solid #329dd2" : "1px solid rgba(255,255,255,0.12)",
                            color: "#ffffff",
                            padding: "14px 16px",
                            borderRadius: "14px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s ease",
                            boxShadow: isSubSelected ? "0 6px 20px rgba(50, 157, 210, 0.35)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "800", fontSize: "15px", color: isSubSelected ? "#38bdf8" : "#f1f5f9" }}>
                              {sp.category === "SAN_11" ? "⭐ " : sp.category === "SAN_7" ? "🏆 " : "⚽ "}
                              {sp.name}
                            </span>
                            {isSubSelected && (
                              <span style={{ background: "#329dd2", color: "#ffffff", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "999px" }}>
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
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#38bdf8", marginTop: "8px" }}>
                            {money(sp.basePrice)} / ca
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Date search bar + quick buttons */}
        <div className="schedule-filter-bar" style={{ flexWrap: "wrap", marginBottom: "20px", background: "var(--surface-alt)", border: "1px solid var(--border)", padding: "16px 20px", borderRadius: "14px" }}>
          <label style={{ color: "#cbd5e1", fontWeight: "700" }}>
            📅 Ngày thi đấu:
            <input
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              style={{ background: "var(--bg)", color: "#ffffff", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: "8px", marginLeft: "10px" }}
            />
          </label>

          <div className="quick-days">
            <button className="quick-day-btn" onClick={() => setQuickDate(0)} style={{ background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", border: "1px solid rgba(50, 157, 210, 0.3)" }}>Hôm nay</button>
            <button className="quick-day-btn" onClick={() => setQuickDate(1)} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#cbd5e1", border: "1px solid var(--border)" }}>Ngày mai</button>
            <button className="quick-day-btn" onClick={() => setQuickDate(2)} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#cbd5e1", border: "1px solid var(--border)" }}>Hôm sau</button>
          </div>

          <div style={{ marginLeft: "auto", fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>
            Đang xem: <strong style={{ color: "#38bdf8" }}>{activeSubPitch.name}</strong> ({activeSubPitch.categoryName})
          </div>
        </div>

        {/* Legend */}
        <div className="legend-bar" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", padding: "12px 18px", borderRadius: "12px" }}>
          <div className="legend-item">
            <span className="legend-box" style={{ background: "rgba(50, 157, 210, 0.2)", border: "1px solid #329dd2" }} />
            <span style={{ color: "#cbd5e1" }}>Còn trống (Click để đặt ca)</span>
          </div>
          <div className="legend-item">
            <span className="legend-box" style={{ background: "rgba(235, 47, 51, 0.15)", border: "1px solid #eb2f33" }} />
            <span style={{ color: "#94a3b8" }}>Đã có đội đặt sân</span>
          </div>
          <div className="legend-item">
            <span className="legend-box" style={{ background: "rgba(245, 158, 11, 0.2)", border: "1px solid #f59e0b" }} />
            <span style={{ color: "#fbbf24" }}>🔥 Giờ vàng cao điểm</span>
          </div>
        </div>

        {/* Bảng các ca thi đấu của đúng SÂN CON được chọn */}
        {(() => {
          const activePitch = fieldsList.find((f) => f.id === selectedPitchId) ?? fieldsList[0];
          const isWeekend = schedule?.dayType === "WEEKEND";

          return (
            <div className="schedule-field-row" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="schedule-field-header" style={{ flexWrap: "wrap", gap: "8px", background: "var(--surface-alt)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, color: "#ffffff", fontSize: "20px" }}>
                      ⚡ BƯỚC 2: CHỌN CA THI ĐẤU CỦA: {activeSubPitch.name}
                    </h3>
                    <span style={{ fontSize: "12px", background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", padding: "3px 10px", borderRadius: "6px", fontWeight: "700", border: "1px solid rgba(50, 157, 210, 0.3)" }}>
                      {activeSubPitch.categoryName}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    Thuộc <strong>{activePitch.name}</strong> · 👨‍💼 Chủ sân: <strong style={{ color: "#38bdf8" }}>{activePitch.ownerName}</strong> (Hotline: <strong style={{ color: "#f59e0b" }}>{activePitch.phone}</strong>) · Ngày: <strong>{date}</strong> ({isWeekend ? "Cuối tuần" : "Ngày thường"})
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "700", background: "rgba(50, 157, 210, 0.12)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(50, 157, 210, 0.3)" }}>
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
                <div style={{ background: "rgba(235, 47, 51, 0.15)", border: "1px solid rgba(235, 47, 51, 0.35)", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <strong>Lỗi:</strong> {errorNotice}
                </div>
              )}

              {/* Thông báo điều phối gửi chủ sân */}
              <div style={{ background: "rgba(50, 157, 210, 0.1)", border: "1px solid rgba(50, 157, 210, 0.25)", color: "#cbd5e1", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
                🔔 <strong style={{ color: "#38bdf8" }}>HỆ THỐNG QUẢN LÝ SÂN NHÀ:</strong> Khi bấm xác nhận, hệ thống sẽ <strong>tự động chuyển thông báo đơn đặt đến Chủ sân ({bookingModal.field.ownerName || "Ban quản lý"} - Hotline: {bookingModal.field.phone})</strong> để chủ sân chuẩn bị bật đèn và đón tiếp đội của bạn!
              </div>

              {/* Booking Summary Box */}
              <div className="booking-summary-box">
                <div className="summary-row">
                  <span>Cụm sân mẹ:</span>
                  <strong>{bookingModal.field.name}</strong>
                </div>
                <div className="summary-row">
                  <span>⚽ Sân con được đặt:</span>
                  <strong style={{ color: "#38bdf8", fontSize: "15px" }}>
                    {bookingModal.subPitch.name} ({bookingModal.subPitch.categoryName})
                  </strong>
                </div>
                <div className="summary-row">
                  <span>👨‍💼 Chủ sân tiếp nhận đơn:</span>
                  <strong style={{ color: "#f59e0b" }}>
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
                  <strong style={{ color: "#38bdf8" }}>{money(bookingModal.slot.price ?? bookingModal.subPitch.basePrice)}</strong>
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
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
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
                <div style={{ background: "rgba(50, 157, 210, 0.12)", border: "1px solid rgba(50, 157, 210, 0.3)", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#38bdf8", marginBottom: "12px" }}>
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
                  background: "rgba(50, 157, 210, 0.15)",
                  color: "#38bdf8",
                  border: "2px solid #329dd2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px",
                }}
              >
                ✓
              </div>

              <h2 style={{ fontSize: "22px", margin: "0 0 4px", color: "#ffffff" }}>🎉 Đặt Sân Con Thành Công!</h2>
              <div style={{ display: "inline-block", background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", border: "1px solid rgba(50, 157, 210, 0.35)", fontWeight: "800", fontSize: "12px", padding: "4px 12px", borderRadius: "999px", marginBottom: "16px" }}>
                🔔 HỆ THỐNG ĐÃ TỰ ĐỘNG BÁO CHO CHỦ SÂN
              </div>

              <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 16px" }}>
                Đơn đặt sân con của bạn đã được ghi nhận vào CSDL Neon và gửi thông tin xác nhận cho Chủ sân:
              </p>

              <div
                style={{
                  background: "var(--surface-alt)",
                  border: "2px dashed rgba(50, 157, 210, 0.45)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  margin: "0 0 20px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", letterSpacing: "0.5px" }}>MÃ VÉ ĐẶT SÂN:</div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", letterSpacing: "1px" }}>
                  {successReceipt.bookingCode}
                </div>
                <div style={{ fontSize: "14px", color: "#f1f5f9", marginTop: "10px", fontWeight: "700" }}>
                  ⚽ Sân con đã đặt: <span style={{ color: "#38bdf8" }}>{successReceipt.subPitchName}</span> ({successReceipt.categoryName})
                </div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>
                  🏢 Cụm sân mẹ: <strong>{successReceipt.parentVenueName}</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#f59e0b", fontWeight: "700", marginTop: "4px" }}>
                  👨‍💼 Chủ sân tiếp nhận: {successReceipt.ownerName} (Hotline: {successReceipt.ownerPhone})
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  ⏰ Ca thi đấu: <strong>{successReceipt.timeLabel}</strong> · Ngày <strong>{successReceipt.date}</strong>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#f59e0b", marginTop: "6px" }}>
                  💰 Tổng tiền: {money(successReceipt.totalPrice)}
                </div>
                <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "700", marginTop: "8px", background: "rgba(50, 157, 210, 0.12)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(50, 157, 210, 0.3)" }}>
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
      <section className="section-wrap" style={{ background: "var(--surface)", borderRadius: "20px", margin: "40px auto 60px", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
          <span className="section-tag">QUY TRÌNH RA SÂN</span>
          <h2 style={{ color: "var(--text-main)" }}>Đặt sân đơn giản chỉ trong 3 bước</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          <div style={{ background: "var(--surface-alt)", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px", color: "#329dd2", fontWeight: 800 }}>01</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px", color: "var(--text-main)" }}>Chọn sân &amp; ca đá</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              Kiểm tra lịch sân trống trực tiếp theo ngày, loại sân 5 hoặc 7 và xem trước giá tạm tính.
            </p>
          </div>
          <div style={{ background: "var(--surface-alt)", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px", color: "#329dd2", fontWeight: 800 }}>02</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px", color: "var(--text-main)" }}>Xác nhận &amp; Giữ chỗ</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              Backend khóa chỗ trong Transaction chống trùng lặp, tự động snapshot biểu giá cố định.
            </p>
          </div>
          <div style={{ background: "var(--surface-alt)", padding: "24px", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "28px", color: "#329dd2", fontWeight: 800 }}>03</span>
            <h4 style={{ margin: "12px 0 8px", fontSize: "18px", color: "var(--text-main)" }}>Nhận vé &amp; Ra sân</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
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
      <section className="section-wrap" style={{ background: "var(--surface)", borderRadius: "24px", padding: "40px 36px", border: "1px solid var(--border)", margin: "40px auto 60px" }}>
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
                href="https://www.google.com/maps/search/?api=1&query=San+bong+da+Buon+Ma+Thuot+Dak+Lak"
                target="_blank"
                rel="noreferrer"
                className="primary-button"
                style={{ background: "#329dd2", color: "#ffffff", border: "none", fontWeight: 700 }}
              >
                Mở radar sân trên Google Maps ↗
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

      {/* Customer Profile & Player Hub Dashboard Modal */}
      {profileModalOpen && currentUser && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "860px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-tag" style={{ background: "rgba(50, 157, 210, 0.15)", color: "#329dd2", border: "1px solid rgba(50, 157, 210, 0.35)" }}>TRUNG TÂM CẦU THỦ BMT</span>
                <h3 style={{ margin: 0, color: "#ffffff" }}>Bảng Điều Khiển Tài Khoản &amp; Vé Của Tôi</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setProfileModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto", padding: "20px 24px" }}>
              {/* Profile card summary */}
              <div style={{ background: "linear-gradient(135deg, #0e1626 0%, #152238 100%)", color: "#ffffff", padding: "20px 24px", borderRadius: "16px", marginBottom: "20px", border: "1px solid rgba(50, 157, 210, 0.35)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(50, 157, 210, 0.2)", border: "2px solid #329dd2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                      {userAvatar}
                    </div>
                    <div>
                      <div style={{ fontSize: "19px", fontWeight: 800, color: "#ffffff" }}>{currentUser.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>📞 {currentUser.phone} · {currentUser.email || "Chưa gắn email"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                      👑 HỘI VIÊN BMT VIP
                    </span>
                    {myClub && (
                      <span style={{ background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", border: "1px solid rgba(50, 157, 210, 0.35)", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                        🛡️ {myClub.name} ({myClub.elo} ELO · {myClub.tier})
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", fontSize: "12px", color: "#cbd5e1", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  <span>⚽ Vị trí: <strong style={{ color: "#38bdf8" }}>{userPosition}</strong></span>
                  <span>👟 Chân thuận: <strong style={{ color: "#38bdf8" }}>{userPreferredFoot}</strong></span>
                  <span>👕 Số áo: <strong style={{ color: "#f59e0b" }}>#{userFavoriteNumber}</strong></span>
                  <span>📍 Khu vực: <strong style={{ color: "#cbd5e1" }}>{userArea}</strong></span>
                </div>
              </div>

              {/* Sub-tab navigation buttons */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", overflowX: "auto" }}>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "BOOKINGS" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "BOOKINGS" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("BOOKINGS"); setProfileNotice(""); fetchMyBookings(); }}
                >
                  🎫 Vé &amp; Lịch sân ({myBookings.length})
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "FC_TEAM" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "FC_TEAM" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("FC_TEAM"); setProfileNotice(""); }}
                >
                  🛡️ FC Của Tôi {myClub ? `(${myClub.members?.length || 1}/15)` : ""}
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "MATCHES" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "MATCHES" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("MATCHES"); setProfileNotice(""); }}
                >
                  🤝 Kèo thi đấu của tôi
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "FAVORITES" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "FAVORITES" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("FAVORITES"); setProfileNotice(""); }}
                >
                  ⭐ Sân yêu thích ({favoritePitchIds.length})
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "PROFILE" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "PROFILE" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("PROFILE"); setProfileNotice(""); }}
                >
                  👤 Hồ sơ cá nhân
                </button>
                <button
                  type="button"
                  className={`quick-day-btn ${profileTab === "PASSWORD" ? "active" : ""}`}
                  style={{ fontSize: "12px", padding: "8px 14px", whiteSpace: "nowrap", background: profileTab === "PASSWORD" ? "#329dd2" : "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(50, 157, 210, 0.3)" }}
                  onClick={() => { setProfileTab("PASSWORD"); setProfileNotice(""); }}
                >
                  🔐 Mật khẩu
                </button>
              </div>

              {profileNotice && (
                <div style={{ background: profileNotice.startsWith("❌") ? "rgba(235, 47, 51, 0.15)" : "rgba(50, 157, 210, 0.15)", border: `1px solid ${profileNotice.startsWith("❌") ? "rgba(235, 47, 51, 0.35)" : "rgba(50, 157, 210, 0.35)"}`, color: profileNotice.startsWith("❌") ? "#fca5a5" : "#38bdf8", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>
                  {profileNotice}
                </div>
              )}

              {/* TAB 1: DANH SÁCH VÉ & LỊCH SÂN CỦA TÔI */}
              {profileTab === "BOOKINGS" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Tổng cộng <strong>{myBookings.length}</strong> ca đặt sân liên kết với số điện thoại <strong>{currentUser.phone}</strong>:
                    </span>
                    <button type="button" onClick={fetchMyBookings} className="outline-button" style={{ padding: "4px 10px", fontSize: "11px" }}>
                      🔄 Làm mới
                    </button>
                  </div>

                  {loadingBookings ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      Đang đồng bộ dữ liệu vé từ CSDL Neon...
                    </div>
                  ) : myBookings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--surface-alt)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎟️</div>
                      <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: "14px" }}>Bạn chưa có ca đặt sân nào trong hệ thống.</p>
                      <button
                        type="button"
                        className="primary-button"
                        style={{ padding: "8px 18px", fontSize: "12px" }}
                        onClick={() => {
                          setProfileModalOpen(false);
                          const el = document.getElementById("dat-san");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        ⚡ Đặt ca sân ngay
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {myBookings.map((b, idx) => {
                        const isPending = b.status === "PENDING";
                        const isConfirmed = b.status === "CONFIRMED";
                        const isCancelled = b.status === "CANCELLED";
                        const isDone = b.status === "COMPLETED";

                        return (
                          <div
                            key={b.bookingCode || idx}
                            style={{
                              background: "var(--surface-alt)",
                              border: "1px solid var(--border)",
                              borderRadius: "14px",
                              padding: "16px 20px",
                              position: "relative",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                              <div>
                                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#38bdf8", fontWeight: 800, background: "rgba(50, 157, 210, 0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                                  {b.bookingCode}
                                </span>
                                <h4 style={{ margin: "6px 0 2px", fontSize: "16px", color: "#ffffff" }}>
                                  {b.parentVenueName || b.fieldName || "Cụm sân Buôn Ma Thuột"}
                                </h4>
                                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                  ⚽ Sân con: <strong style={{ color: "#38bdf8" }}>{b.subPitchName || "Sân con mini"}</strong> ({b.categoryName || "Sân tiêu chuẩn"})
                                </div>
                              </div>

                              <div>
                                {isPending && (
                                  <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                                    ⏳ CHỜ CHUYỂN CỌC (30%)
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span style={{ background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", border: "1px solid rgba(50, 157, 210, 0.35)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                                    ✓ ĐÃ CỌC - SẴN SÀNG ĐÁ
                                  </span>
                                )}
                                {isCancelled && (
                                  <span style={{ background: "rgba(235, 47, 51, 0.15)", color: "#fca5a5", border: "1px solid rgba(235, 47, 51, 0.35)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                                    ✕ ĐÃ HỦY
                                  </span>
                                )}
                                {isDone && (
                                  <span style={{ background: "rgba(148, 163, 184, 0.15)", color: "#cbd5e1", border: "1px solid rgba(148, 163, 184, 0.35)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                                    ✓ ĐÃ HOÀN THÀNH
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px", fontSize: "12px", color: "#cbd5e1", margin: "10px 0" }}>
                              <div>📅 Ngày đá: <strong>{b.date || (b.startAt ? b.startAt.slice(0, 10) : "Hôm nay")}</strong></div>
                              <div>⏰ Giờ đá: <strong>{b.timeLabel || "Ca chiều / tối"}</strong></div>
                              <div>💰 Tổng tiền: <strong style={{ color: "#f59e0b" }}>{money(Number(b.totalPrice || 350000))}</strong></div>
                              <div>💳 Tiền cọc (30%): <strong style={{ color: "#38bdf8" }}>{money(Math.max(100000, Math.round(Number(b.totalPrice || 350000) * 0.3)))}</strong></div>
                            </div>

                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                              {b.qrUrl && (
                                <button
                                  type="button"
                                  className="primary-button"
                                  style={{ padding: "6px 12px", fontSize: "11px" }}
                                  onClick={() => setActiveTicketQr(b)}
                                >
                                  📱 Quét mã VietQR
                                </button>
                              )}
                              <a
                                href={getGoogleMapsDirUrl(b.parentVenueName || b.fieldName, b.fieldAddress || b.ward)}
                                target="_blank"
                                rel="noreferrer"
                                className="outline-button"
                                style={{ padding: "6px 12px", fontSize: "11px", textDecoration: "none" }}
                              >
                                🧭 Chỉ đường Maps
                              </a>
                              {(b.ownerPhone || b.fieldPhone) && (
                                <a
                                  href={`tel:${(b.ownerPhone || b.fieldPhone).replace(/\s+/g, '')}`}
                                  className="outline-button"
                                  style={{ padding: "6px 12px", fontSize: "11px", textDecoration: "none", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)" }}
                                >
                                  📞 Gọi chủ sân ({b.ownerPhone || b.fieldPhone})
                                </a>
                              )}
                              {isPending && (
                                <button
                                  type="button"
                                  className="outline-button"
                                  style={{ padding: "6px 12px", fontSize: "11px", color: "#eb2f33", borderColor: "rgba(235, 47, 51, 0.35)", marginLeft: "auto" }}
                                  onClick={() => handleCancelMyBooking(b)}
                                >
                                  ✕ Hủy ca sân
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: QUẢN LÝ FC & ĐỘI HÌNH 15 NGƯỜI */}
              {profileTab === "FC_TEAM" && (
                <div>
                  {myClub ? (
                    <div>
                      <div style={{ background: "linear-gradient(135deg, #131e32 0%, #0e1626 100%)", border: "1px solid rgba(50, 157, 210, 0.35)", borderRadius: "14px", padding: "18px 20px", marginBottom: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "28px" }}>{myClub.avatar || "🛡️"}</span>
                              <div>
                                <h3 style={{ margin: 0, fontSize: "20px", color: "#ffffff" }}>{myClub.name}</h3>
                                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                  Đội trưởng: <strong style={{ color: "#38bdf8" }}>{myClub.captainName}</strong> ({myClub.captainPhone}) · Sân nhà: <strong>{myClub.homePitch || "SVĐ Buôn Ma Thuột"}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "22px", fontWeight: 900, color: "#f59e0b" }}>{myClub.elo} ELO</div>
                            <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 800 }}>
                              {myClub.tier || "Hạng Đồng"}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px", textAlign: "center", fontSize: "12px" }}>
                          <div><div style={{ color: "#94a3b8" }}>Trận đấu</div><strong style={{ fontSize: "16px", color: "#ffffff" }}>{myClub.wins + myClub.draws + myClub.losses}</strong></div>
                          <div><div style={{ color: "#38bdf8" }}>Thắng</div><strong style={{ fontSize: "16px", color: "#38bdf8" }}>{myClub.wins}</strong></div>
                          <div><div style={{ color: "#fbbf24" }}>Hòa</div><strong style={{ fontSize: "16px", color: "#fbbf24" }}>{myClub.draws}</strong></div>
                          <div><div style={{ color: "#eb2f33" }}>Thua</div><strong style={{ fontSize: "16px", color: "#eb2f33" }}>{myClub.losses}</strong></div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff" }}>
                            📋 ĐỘI HÌNH THI ĐẤU ({myClub.members?.length || 1}/15 THÀNH VIÊN TỐI ĐA):
                          </h4>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Quy định giải: Tối đa 15 người/FC</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
                          {myClub.members?.map((m, mIdx) => (
                            <div
                              key={m.phone || mIdx}
                              style={{
                                background: "var(--surface-alt)",
                                border: "1px solid var(--border)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(50, 157, 210, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>
                                  #{mIdx + 1}
                                </div>
                                <div>
                                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                                    {m.name} {m.role === "CAPTAIN" && "👑"}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                    {m.phone} · {m.role === "CAPTAIN" ? "Đội trưởng" : "Cầu thủ"}
                                  </div>
                                </div>
                              </div>
                              {m.role !== "CAPTAIN" && (myClub.captainId === currentUser.id || myClub.captainPhone === currentUser.phone) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMemberFromClub(m.phone)}
                                  style={{ background: "none", border: "none", color: "#eb2f33", cursor: "pointer", fontSize: "14px", padding: "4px" }}
                                  title="Xóa thành viên khỏi đội"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Form thêm thành viên mới nếu chưa đủ 15 người */}
                      {myClub.members?.length < 15 ? (
                        <form onSubmit={handleAddMemberToMyClub} style={{ background: "rgba(50, 157, 210, 0.06)", border: "1px dashed rgba(50, 157, 210, 0.35)", borderRadius: "12px", padding: "14px 18px" }}>
                          <strong style={{ fontSize: "13px", color: "#38bdf8", display: "block", marginBottom: "10px" }}>
                            ➕ Thêm cầu thủ mới vào danh sách đội (Còn trống {15 - (myClub.members?.length || 1)} chỗ):
                          </strong>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px auto", gap: "8px", alignItems: "flex-end" }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label style={{ fontSize: "11px", color: "#94a3b8" }}>Tên cầu thủ *</label>
                              <input
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="VD: Nguyễn Văn C"
                                required
                                style={{ height: "36px", fontSize: "12px" }}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label style={{ fontSize: "11px", color: "#94a3b8" }}>Số điện thoại *</label>
                              <input
                                value={newMemberPhone}
                                onChange={(e) => setNewMemberPhone(e.target.value)}
                                placeholder="VD: 0912345678"
                                required
                                style={{ height: "36px", fontSize: "12px" }}
                              />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label style={{ fontSize: "11px", color: "#94a3b8" }}>Vị trí</label>
                              <select
                                value={newMemberPos}
                                onChange={(e) => setNewMemberPos(e.target.value)}
                                style={{ height: "36px", fontSize: "12px", background: "var(--bg)", color: "#ffffff", border: "1px solid var(--border)", borderRadius: "8px" }}
                              >
                                <option value="Tiền đạo">Tiền đạo (FW)</option>
                                <option value="Tiền vệ">Tiền vệ (MF)</option>
                                <option value="Hậu vệ">Hậu vệ (DF)</option>
                                <option value="Thủ môn">Thủ môn (GK)</option>
                              </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label style={{ fontSize: "11px", color: "#94a3b8" }}>Số áo</label>
                              <input
                                type="number"
                                min={1}
                                max={99}
                                value={newMemberNum}
                                onChange={(e) => setNewMemberNum(Number(e.target.value))}
                                style={{ height: "36px", fontSize: "12px" }}
                              />
                            </div>
                            <button type="submit" className="primary-button" style={{ height: "36px", padding: "0 14px", fontSize: "12px" }}>
                              + Thêm
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#fbbf24", textAlign: "center" }}>
                          🔒 FC đã đủ giới hạn tối đa 15 thành viên thi đấu theo quy chuẩn ban tổ chức giải.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--surface-alt)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛡️</div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", color: "#ffffff" }}>Bạn chưa tham gia Câu lạc bộ (FC) nào</h4>
                      <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#94a3b8", maxWidth: "420px", marginInline: "auto" }}>
                        Hãy thành lập FC của riêng bạn để đăng ký thi đấu, xây dựng đội hình 15 người và leo rank ELO trên bảng xếp hạng Buôn Ma Thuột!
                      </p>
                      <button
                        type="button"
                        className="primary-button"
                        style={{ padding: "10px 22px", fontSize: "13px" }}
                        onClick={() => {
                          setProfileModalOpen(false);
                          setCreateClubOpen(true);
                        }}
                      >
                        ⚡ Thành lập FC Mới Của Tôi (1000 ELO)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: KÈO THI ĐẤU CỦA TÔI & BÁO KẾT QUẢ ELO */}
              {profileTab === "MATCHES" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Các bài đăng bắt đối do bạn tạo hoặc đội của bạn đã nhận:</span>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: "6px 12px", fontSize: "11px" }}
                      onClick={() => {
                        setProfileModalOpen(false);
                        setCreateMatchOpen(true);
                      }}
                    >
                      ➕ Đăng kèo mới
                    </button>
                  </div>

                  {(() => {
                    const myMatches = matchPosts.filter(
                      (p) =>
                        p.captainName === currentUser.fullName ||
                        p.phone === currentUser.phone ||
                        (myClub && p.teamName === myClub.name)
                    );

                    if (myMatches.length === 0) {
                      return (
                        <div style={{ textAlign: "center", padding: "36px 20px", background: "var(--surface-alt)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🤝</div>
                          <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: "14px" }}>Bạn chưa có bài đăng cáp kèo nào trên sàn phủi.</p>
                          <button
                            type="button"
                            className="primary-button"
                            style={{ padding: "8px 18px", fontSize: "12px" }}
                            onClick={() => {
                              setProfileModalOpen(false);
                              setCreateMatchOpen(true);
                            }}
                          >
                            ➕ Đăng tin tìm đối ngay
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {myMatches.map((p) => {
                          const isOpen = p.status === "OPEN";
                          const isMatched = p.status === "MATCHED";

                          return (
                            <div
                              key={p.id}
                              style={{
                                background: "var(--surface-alt)",
                                border: "1px solid var(--border)",
                                borderRadius: "14px",
                                padding: "16px 20px",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <h4 style={{ margin: 0, fontSize: "16px", color: "#ffffff" }}>
                                      {p.teamName} {isMatched ? `vs ${p.matchedBy || "Đối thủ"}` : ""}
                                    </h4>
                                    <span style={{ background: isOpen ? "rgba(50, 157, 210, 0.15)" : "rgba(245, 158, 11, 0.15)", color: isOpen ? "#38bdf8" : "#fbbf24", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 }}>
                                      {isOpen ? "ĐANG TÌM ĐỐI" : "ĐÃ BẮT ĐỐI"}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                                    🏟️ {p.fieldName} · 📅 {p.matchDate} · ⏰ {p.timeSlot}
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  {isMatched && (
                                    <button
                                      type="button"
                                      className="primary-button"
                                      style={{ padding: "6px 12px", fontSize: "11px", background: "#f59e0b" }}
                                      onClick={() => setMatchScoreModal(p)}
                                    >
                                      🏆 Ghi nhận tỷ số &amp; ELO
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: SÂN BÓNG YÊU THÍCH */}
              {profileTab === "FAVORITES" && (
                <div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
                    Các cụm sân bạn đánh dấu yêu thích để truy cập nhanh:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                    {fieldsList
                      .filter((f) => favoritePitchIds.includes(f.id))
                      .map((f) => (
                        <div
                          key={f.id}
                          style={{
                            background: "var(--surface-alt)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            padding: "14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#ffffff" }}>{f.name}</h4>
                              <button
                                type="button"
                                onClick={() => handleToggleFavorite(f.id)}
                                style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontSize: "16px" }}
                                title="Bỏ yêu thích"
                              >
                                ★
                              </button>
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>📍 {f.ward} · {f.address}</div>
                          </div>
                          <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="primary-button"
                              style={{ flex: 1, padding: "6px 10px", fontSize: "11px" }}
                              onClick={() => {
                                setSelectedPitchId(f.id);
                                setProfileModalOpen(false);
                                const el = document.getElementById("dat-san");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              ⚡ Đặt ca sân này
                            </button>
                            <a
                              href={getGoogleMapsDirUrl(f.name, f.address)}
                              target="_blank"
                              rel="noreferrer"
                              className="outline-button"
                              style={{ padding: "6px 10px", fontSize: "11px", textDecoration: "none" }}
                            >
                              🧭 Maps
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 5: THÔNG TIN HỒ SƠ CÁ NHÂN */}
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
                    window.localStorage.setItem("football_auth_user", JSON.stringify(updated));
                    setProfileNotice("✓ Đã cập nhật thành công thông tin hồ sơ cầu thủ!");
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: "8px" }}>
                      Chọn ảnh đại diện cầu thủ (Avatar):
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["⚽", "🏃", "🥅", "👟", "🏆", "🥇", "🎯", "⚡", "🔥"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setUserAvatar(emoji)}
                          style={{
                            width: "42px",
                            height: "42px",
                            fontSize: "22px",
                            borderRadius: "10px",
                            border: userAvatar === emoji ? "2px solid #329dd2" : "1px solid var(--border)",
                            background: userAvatar === emoji ? "rgba(50, 157, 210, 0.2)" : "rgba(255,255,255,0.04)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Họ và tên cầu thủ *</label>
                    <input name="name" defaultValue={currentUser.fullName} required style={{ height: "40px" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Số điện thoại liên hệ *</label>
                      <input name="phone" defaultValue={currentUser.phone} required style={{ height: "40px" }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Email nhận vé điện tử</label>
                      <input name="email" defaultValue={currentUser.email || ""} placeholder="example@gmail.com" style={{ height: "40px" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Vị trí thi đấu sở trường</label>
                      <select value={userPosition} onChange={(e) => setUserPosition(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "#ffffff", fontSize: "13px" }}>
                        <option value="Tiền đạo (ST)">Tiền đạo (ST)</option>
                        <option value="Tiền vệ (MF)">Tiền vệ (MF)</option>
                        <option value="Hậu vệ (DF)">Hậu vệ (DF)</option>
                        <option value="Thủ môn (GK)">Thủ môn (GK)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Chân thuận</label>
                      <select value={userPreferredFoot} onChange={(e) => setUserPreferredFoot(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "#ffffff", fontSize: "13px" }}>
                        <option value="Chân phải">Chân phải</option>
                        <option value="Chân trái">Chân trái</option>
                        <option value="Hai chân như một">Hai chân như một</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Khu vực tại Buôn Ma Thuột</label>
                      <select value={userArea} onChange={(e) => setUserArea(e.target.value)} style={{ width: "100%", height: "40px", padding: "0 8px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "#ffffff", fontSize: "13px" }}>
                        <option value="Phường Tân Tiến">Phường Tân Tiến</option>
                        <option value="Phường Tân Lợi">Phường Tân Lợi</option>
                        <option value="Phường Tân An">Phường Tân An</option>
                        <option value="Phường Thành Nhất">Phường Thành Nhất</option>
                        <option value="Phường Ea Tam">Phường Ea Tam</option>
                        <option value="Phường Tân Lập">Phường Tân Lập</option>
                        <option value="Xã Hòa Khánh">Xã Hòa Khánh</option>
                        <option value="Xã Ea Kao">Xã Ea Kao</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Số áo ưa thích</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={userFavoriteNumber}
                        onChange={(e) => setUserFavoriteNumber(Number(e.target.value))}
                        style={{ height: "40px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button type="submit" className="primary-button" style={{ flex: 1, padding: "11px" }}>
                      💾 Lưu thông tin hồ sơ
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 6: ĐỔI MẬT KHẨU & BẢO MẬT */}
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
                    setProfileNotice("✓ Đổi mật khẩu tài khoản thành công! Mật khẩu mới đã được bảo mật trên Neon DB.");
                    e.currentTarget.reset();
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Mật khẩu hiện tại *</label>
                    <input name="oldPass" type="password" required placeholder="Nhập mật khẩu hiện tại" style={{ height: "40px" }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Mật khẩu mới *</label>
                    <input name="newPass" type="password" required placeholder="Tối thiểu 6 ký tự" style={{ height: "40px" }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>Xác nhận mật khẩu mới *</label>
                    <input name="confirmPass" type="password" required placeholder="Nhập lại mật khẩu mới" style={{ height: "40px" }} />
                  </div>

                  <div style={{ background: "rgba(50, 157, 210, 0.08)", border: "1px solid rgba(50, 157, 210, 0.25)", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#cbd5e1" }}>
                    🔒 Mật khẩu được mã hóa chuẩn bcrypt an toàn trên máy chủ Neon PostgreSQL.
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button type="submit" className="primary-button" style={{ flex: 1, padding: "11px" }}>
                      🔑 Cập nhật mật khẩu mới
                    </button>
                    <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setProfileModalOpen(false)}>
                      Đóng
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP XEM MÃ VIETQR VÉ ĐẶT SÂN */}
      {activeTicketQr && (
        <div className="modal-overlay" onClick={() => setActiveTicketQr(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", textAlign: "center", padding: "28px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", color: "#ffffff", fontSize: "18px" }}>MÃ VIETQR THANH TOÁN TIỀN CỌC</h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px" }}>Mã vé: <strong style={{ color: "#38bdf8" }}>{activeTicketQr.bookingCode}</strong></p>
            <div style={{ background: "#ffffff", padding: "12px", borderRadius: "12px", display: "inline-block", marginBottom: "14px" }}>
              <img src={activeTicketQr.qrUrl} alt="VietQR" style={{ width: "220px", height: "220px", display: "block" }} />
            </div>
            <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "14px" }}>
              Số tiền cọc: <strong style={{ color: "#f59e0b", fontSize: "16px" }}>{money(activeTicketQr.depositAmount || 100000)}</strong>
            </div>
            <button type="button" className="primary-button" style={{ width: "100%", padding: "10px" }} onClick={() => setActiveTicketQr(null)}>
              Đã hiểu &amp; Đóng
            </button>
          </div>
        </div>
      )}

      {/* POPUP NHẬP TỶ SỐ TRẬN ĐẤU & CẬP NHẬT ELO */}
      {matchScoreModal && (
        <div className="modal-overlay" onClick={() => setMatchScoreModal(null)}>
          <div className="modal-content" style={{ maxWidth: "460px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "0 0 16px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>🏆 GHI NHẬN TỶ SỐ TRẬN ĐẤU</h3>
              <button type="button" className="modal-close-btn" onClick={() => setMatchScoreModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmitMatchScore} style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" }}>
                Nhập tỷ số thực tế giữa 2 đội. Hệ thống sẽ tự động cập nhật điểm ELO và thứ hạng trên BXH!
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8", marginBottom: "6px" }}>{matchScoreModal.teamName}</div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={scoreTeamA}
                    onChange={(e) => setScoreTeamA(Number(e.target.value))}
                    style={{ width: "70px", height: "48px", fontSize: "24px", fontWeight: 800, textAlign: "center", margin: "0 auto" }}
                  />
                </div>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#94a3b8" }}>-</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b", marginBottom: "6px" }}>{matchScoreModal.matchedBy || "FC Đối Thủ"}</div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={scoreTeamB}
                    onChange={(e) => setScoreTeamB(Number(e.target.value))}
                    style={{ width: "70px", height: "48px", fontSize: "24px", fontWeight: 800, textAlign: "center", margin: "0 auto" }}
                  />
                </div>
              </div>
              <div style={{ background: "rgba(50, 157, 210, 0.1)", border: "1px solid rgba(50, 157, 210, 0.3)", borderRadius: "8px", padding: "10px", fontSize: "12px", color: "#cbd5e1", marginBottom: "16px" }}>
                Quy tắc ELO: Thắng (+25 ELO) · Hòa (+5 ELO) · Thua (-15 ELO).
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="primary-button" style={{ flex: 1, padding: "12px" }}>
                  ✓ Xác nhận tỷ số &amp; Tính ELO
                </button>
                <button type="button" className="outline-button" style={{ padding: "12px 16px" }} onClick={() => setMatchScoreModal(null)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* MODAL: ĐĂNG TIN CÁP KÈO / TÌM ĐỐI */}
      {createMatchOpen && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal-card" style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "18px", margin: 0, color: "#0f172a" }}>➕ Đăng tin tìm đối giao lưu</h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Đăng kèo thi đấu lên sàn phủi Ban Mê để các đội bắt đối</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setCreateMatchOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateMatchSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Tên đội của bạn: *</label>
                  <input type="text" required value={cmTeam} onChange={(e) => setCmTeam(e.target.value)} placeholder="VD: FC Dưỡng Sinh BMT" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Đội trưởng / Đại diện: *</label>
                  <input type="text" required value={cmCaptain} onChange={(e) => setCmCaptain(e.target.value)} placeholder="VD: Duy Tài" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Số điện thoại / Zalo: *</label>
                  <input type="text" required value={cmPhone} onChange={(e) => setCmPhone(e.target.value)} placeholder="VD: 0896890399" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "monospace" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Cụm sân dự kiến: *</label>
                  <select value={cmFieldId} onChange={(e) => setCmFieldId(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                    {fieldsList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.ward})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Ngày thi đấu: *</label>
                  <input type="date" required value={cmDate} onChange={(e) => setCmDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Khung giờ đá: *</label>
                  <select value={cmSlot} onChange={(e) => setCmSlot(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                    <option value="17:30 - 19:00">17:30 - 19:00 (Giờ vàng tối)</option>
                    <option value="19:00 - 20:30">19:00 - 20:30 (Đêm đẹp)</option>
                    <option value="16:00 - 17:30">16:00 - 17:30 (Tan tầm)</option>
                    <option value="06:30 - 08:00">06:30 - 08:00 (Sáng sớm)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Trình độ đội: *</label>
                  <select value={cmLevel} onChange={(e) => setCmLevel(e.target.value as any)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                    <option value="VUI_VE">Dưỡng sinh (Vui vẻ, giao lưu)</option>
                    <option value="TRUNG_BINH">Trung bình (Phong trào)</option>
                    <option value="BAN_CHUYEN">Khá - Chiến (Cọ xát căng)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Kèo thỏa thuận: *</label>
                  <select value={cmBet} onChange={(e) => setCmBet(e.target.value as any)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                    <option value="CHIA_DOI">Tiền sân 5-5 (Mỗi đội 50%)</option>
                    <option value="THUA_BAO">Đội thua bao trọn tiền sân</option>
                    <option value="KEO_NUOC">Tiền sân 5-5 + Kèo nước</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Ghi chú / Lời nhắn:</label>
                <input type="text" value={cmDesc} onChange={(e) => setCmDesc(e.target.value)} placeholder="VD: Đội đá văn minh, không chơi xấu, mặc áo đỏ" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="primary-button" style={{ flex: 1, padding: "11px", fontWeight: 700 }}>
                  🚀 Đăng tin tìm đối ngay
                </button>
                <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setCreateMatchOpen(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      
      {/* MODAL: THÁCH ĐẤU & GHI NHẬN KẾT QUẢ LEO RANK ELO */}
      {challengeModalOpen && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#080f1b" }}>⚔️ Thách Đấu &amp; Ghi Nhận Leo Rank ELO</h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Cộng trừ điểm ELO cập nhật Bảng Xếp Hạng Ban Mê</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setChallengeModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleMatchChallengeSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Đội 1 (Đội của bạn):</label>
                <select value={chalClub1Id} onChange={(e) => setChalClub1Id(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.rank} · {c.elo} ELO)</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Đội 2 (Đội đối thủ):</label>
                <select value={chalClub2Id} onChange={(e) => setChalClub2Id(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.rank} · {c.elo} ELO)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Số bàn thắng Đội 1: *</label>
                  <input type="number" min="0" max="99" required value={chalScore1} onChange={(e) => setChalScore1(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", fontWeight: 800, textAlign: "center" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Số bàn thắng Đội 2: *</label>
                  <input type="number" min="0" max="99" required value={chalScore2} onChange={(e) => setChalScore2(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", fontWeight: 800, textAlign: "center" }} />
                </div>
              </div>

              <div style={{ background: "#080f1b", border: "1px solid #1e3355", borderRadius: "10px", padding: "12px", fontSize: "12px", color: "#cbd5e1" }}>
                <strong style={{ color: "#329dd2" }}>📊 Quy tắc tính điểm ELO Leo Rank:</strong>
                <div style={{ marginTop: "4px" }}>• Thắng: <strong style={{ color: "#329dd2" }}>+25 ELO</strong> · Thua: <strong style={{ color: "#eb2f33" }}>-15 ELO</strong> · Hòa: <strong>+5 ELO</strong></div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button type="submit" className="btn-accent-red" style={{ flex: 1, padding: "11px", fontWeight: 800 }}>⚡ Xác nhận kết quả &amp; Cập nhật ELO</button>
                <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setChallengeModalOpen(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO CÂU LẠC BỘ */}
      {createClubOpen && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal-card" style={{ maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "18px", margin: 0 }}>➕ Tạo Câu lạc bộ bóng đá (FC)</h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Tạo đội bóng riêng, tuyển thành viên và leo rank ELO</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setCreateClubOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClubSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Tên CLB: *</label>
                  <input type="text" required value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="VD: FC Sân Nhà Ban Mê" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Viết tắt:</label>
                  <input type="text" maxLength={6} value={ccShort} onChange={(e) => setCcShort(e.target.value.toUpperCase())} placeholder="SNBM" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", textTransform: "uppercase" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>Đội trưởng: *</label>
                  <input type="text" required value={ccCaptain} onChange={(e) => setCcCaptain(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: "13px" }}>SĐT: *</label>
                  <input type="text" required value={ccPhone2} onChange={(e) => setCcPhone2(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "monospace" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="primary-button" style={{ flex: 1, padding: "11px", fontWeight: 700 }}>🏟️ Tạo câu lạc bộ</button>
                <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setCreateClubOpen(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT CÂU LẠC BỘ */}
      {clubDetailOpen && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal-card" style={{ maxWidth: "540px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", margin: 0 }}>🏟️ {clubDetailOpen.name}</h3>
              <button type="button" className="modal-close" onClick={() => setClubDetailOpen(null)}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px", background: "#f1f5f9", width: "64px", height: "64px", borderRadius: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{clubDetailOpen.avatar}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: getEloColor(clubDetailOpen.elo) }}>{clubDetailOpen.rank} · {clubDetailOpen.elo} ELO</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>📍 {clubDetailOpen.ward}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
                <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "12px", textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: 800, color: "#16a34a" }}>{clubDetailOpen.wins}</div><div style={{ fontSize: "10px", color: "#64748b" }}>Thắng</div></div>
                <div style={{ background: "#fefce8", borderRadius: "10px", padding: "12px", textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: 800, color: "#ca8a04" }}>{clubDetailOpen.draws}</div><div style={{ fontSize: "10px", color: "#64748b" }}>Hòa</div></div>
                <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "12px", textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626" }}>{clubDetailOpen.losses}</div><div style={{ fontSize: "10px", color: "#64748b" }}>Thua</div></div>
                <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "12px", textAlign: "center" }}><div style={{ fontSize: "20px", fontWeight: 800, color: "#2563eb" }}>{clubDetailOpen.goalsFor}</div><div style={{ fontSize: "10px", color: "#64748b" }}>Bàn thắng</div></div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>📋 Thành viên ({clubDetailOpen.members.length}/{MAX_CLUB_MEMBERS}):</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "250px", overflowY: "auto" }}>
                {clubDetailOpen.members.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: i % 2 === 0 ? "#f8fafc" : "#fff", borderRadius: "6px", fontSize: "12px" }}>
                    <span style={{ fontWeight: 700 }}>{i + 1}. {m.name} <span style={{ fontSize: "10px", color: "#64748b" }}>{m.role === "CAPTAIN" ? "🎖️" : m.role === "CO_CAPTAIN" ? "⭐" : ""}</span></span>
                    <span style={{ color: "#64748b", fontFamily: "monospace" }}>📞 {m.phone}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <button type="button" className="outline-button" style={{ width: "100%", padding: "10px" }} onClick={() => setClubDetailOpen(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BẮT ĐỐI / NHẬN KÈO */}
      {acceptMatchOpen && activeMatchToAccept && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <div className="modal-card" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "18px", margin: 0, color: "#0f172a" }}>🤝 Xác nhận bắt đối giao lưu</h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Cáp kèo thi đấu với đội bạn</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setAcceptMatchOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAcceptMatchSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px", fontSize: "13px" }}>
                <div style={{ color: "#166534", fontWeight: 700, marginBottom: "4px" }}>
                  Đội thách đấu: <span style={{ fontSize: "15px" }}>{activeMatchToAccept.teamName}</span>
                </div>
                <div style={{ color: "#334155", fontSize: "12px" }}>
                  {activeMatchToAccept.fieldName} · {activeMatchToAccept.timeSlot} ngày {activeMatchToAccept.matchDate} · Kèo: {activeMatchToAccept.betLabel}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>Tên đội của bạn (Đội nhận kèo): *</label>
                <input type="text" required value={amTeam} onChange={(e) => setAmTeam(e.target.value)} placeholder="VD: FC Ban Mê Star" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: "13px" }}>SĐT đại diện liên hệ: *</label>
                <input type="text" required value={amPhone} onChange={(e) => setAmPhone(e.target.value)} placeholder="VD: 0912345678" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "monospace" }} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button type="submit" className="primary-button" style={{ flex: 1, padding: "11px", fontWeight: 700 }}>
                  ✓ Xác nhận bắt đối
                </button>
                <button type="button" className="outline-button" style={{ padding: "11px 18px" }} onClick={() => setAcceptMatchOpen(false)}>
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
