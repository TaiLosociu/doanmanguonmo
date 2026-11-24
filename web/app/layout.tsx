import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SÂN NHÀ FC · Đặt Lịch Sân Bóng Đá & Sàn Cáp Kèo Trực Tuyến Buôn Ma Thuột",
  description: "Sân Nhà FC - Nền tảng đặt sân bóng đá, sàn cáp kèo giao lưu phủi và bảng xếp hạng ELO tổ đội FC tại TP. Buôn Ma Thuột.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
