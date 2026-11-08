import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lê Duy Tài | Software Engineer & Full-stack Developer (IT24M)',
  description:
    'Portfolio cá nhân của Lê Duy Tài (Lớp IT24M) - Software Engineer & Full-stack Developer chuyên về Next.js, NestJS, Neon Serverless PostgreSQL, kiến trúc hệ thống và tối ưu hóa cơ sở dữ liệu.',
  keywords: [
    'Lê Duy Tài',
    'leduytai',
    'IT24M',
    'Software Engineer',
    'Full-stack Developer',
    'NextJS',
    'NestJS',
    'Neon PostgreSQL',
    'Mã Nguồn Mở 2',
    'Đắk Lắk',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="icon" href="./avatar.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
