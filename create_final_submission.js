const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    if (exclude.includes(item.name)) continue;
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const staging = path.join(__dirname, 'staging_submission');
if (fs.existsSync(staging)) {
  fs.rmSync(staging, { recursive: true, force: true });
}
fs.mkdirSync(staging, { recursive: true });

console.log('1. Copying Web Frontend (Next.js 3001)...');
const webDest = path.join(staging, 'SAN_NHA_FC_WEB');
copyDir('web', webDest, ['node_modules', '.next', 'out', 'node.exe', 'tsconfig.tsbuildinfo']);

console.log('2. Copying Backend API (NestJS)...');
const backendDest = path.join(staging, 'BACKEND_API');
fs.mkdirSync(backendDest, { recursive: true });
copyDir('src', path.join(backendDest, 'src'));
copyDir('prisma', path.join(backendDest, 'prisma'));
['package.json', 'tsconfig.json', 'nest-cli.json', '.env.example'].forEach(f => {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(backendDest, f));
});

console.log('3. Copying Database SQL...');
const sqlDest = path.join(staging, 'CO_SO_DU_LIEU_SQL');
fs.mkdirSync(sqlDest, { recursive: true });
['database_schema_complete.sql', 'database_backup_bmt_pitches.sql'].forEach(f => {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(sqlDest, f));
});

console.log('4. Creating root guide and start batch file...');
const rootGuide = `================================================================================
                    BÁO CÁO & HƯỚNG DẪN CHẠY ĐỒ ÁN MÃ NGUỒN MỞ
                 HỆ THỐNG ĐẶT SÂN BÓNG ĐÁ TRỰC TUYẾN - SÂN NHÀ FC
================================================================================

THÔNG TIN SINH VIÊN:
- Sinh viên thực hiện: Lê Duy Tài
- Đề tài: Hệ thống đặt lịch sân bóng đá và sàn cáp kèo trực tuyến (Sân Nhà FC)
- Nền tảng: Next.js 15, React 19, TypeScript, Tailwind CSS, Neon Cloud PostgreSQL

CẤU TRÚC THƯ MỤC NỘP BÀI:
1. SAN_NHA_FC_WEB/    : Mã nguồn ứng dụng Web chính thức (Cổng 3001)
2. BACKEND_API/       : Mã nguồn Backend REST API (NestJS, Prisma)
3. CO_SO_DU_LIEU_SQL/ : Bản sao lưu cấu trúc & dữ liệu Neon PostgreSQL

HƯỚNG DẪN KHỞI CHẠY (DÀNH CHO THẦY CÔ CHẤM ĐỒ ÁN):

--- CÁCH 1: KHỞI CHẠY TỰ ĐỘNG BẰNG 1-CLICK (KHUYẾN NGHỊ) ---
- Nhấp đúp vào file: CHAY_TOAN_BO_DO_AN.bat
- Trình duyệt sẽ tự động mở trang web tại: http://localhost:3001

--- CÁCH 2: CHẠY BẰNG DÒNG LỆNH (TERMINAL) ---
1. Mở thư mục SAN_NHA_FC_WEB:
   cd SAN_NHA_FC_WEB
2. Cài đặt thư viện:
   npm install
3. Khởi động ứng dụng:
   npm run dev
4. Mở trình duyệt truy cập:
   http://localhost:3001

LƯU Ý QUAN TRỌNG:
- Dự án đã tích hợp sẵn chuỗi kết nối đám mây Neon PostgreSQL (AWS Serverless),
  thầy cô có thể chạy và tương tác tạo cáp kèo, đặt sân mà không cần cài thêm DB local.
================================================================================
`;
fs.writeFileSync(path.join(staging, 'HUONG_DAN_NOP_BAI_VA_CHAY_DO_AN.txt'), rootGuide, 'utf8');

const runAllBat = `@echo off
title Khoi dong Do An San Nha FC (Port 3001)
color 0B
echo ========================================================
echo    DANG KHOI CHAY HE THONG SAN NHA FC (PORT 3001)
echo ========================================================
echo.
cd /d "%~dp0\\SAN_NHA_FC_WEB"

if not exist "node_modules" (
    echo [1/2] Dang cai dat thu vien npm...
    call npm install
)

echo [2/2] Dang khoi chay Next.js tai cong 3001...
start "" "http://localhost:3001"
call npm run dev
pause
`;
fs.writeFileSync(path.join(staging, 'CHAY_TOAN_BO_DO_AN.bat'), runAllBat, 'utf8');

console.log('5. Compressing into final ZIP packages...');
const zipOutProject = path.join(__dirname, 'DO_AN_SAN_NHA_FC_LE_DUY_TAI.zip');
if (fs.existsSync(zipOutProject)) fs.unlinkSync(zipOutProject);

execSync(`powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path '${staging}\\*' -DestinationPath '${zipOutProject}' -Force"`, { stdio: 'inherit' });

// Also copy to Desktop
const desktopPath = 'C:\\Users\\ADMIN\\OneDrive\\Máy tính';
if (fs.existsSync(desktopPath)) {
  const desktopZip = path.join(desktopPath, 'DO_AN_SAN_NHA_FC_LE_DUY_TAI.zip');
  fs.copyFileSync(zipOutProject, desktopZip);
  console.log(`Copied to Desktop: ${desktopZip}`);
}

// Clean staging
fs.rmSync(staging, { recursive: true, force: true });
console.log('SUCCESS: All files packaged cleanly!');
