@echo off
chcp 65001 > nul
title Hệ Thống Portfolio Lê Duy Tài (IT24M)
cls
echo ======================================================================
echo   ĐỒ ÁN / BÀI TẬP 1: LANDING PAGE CÁ NHÂN (LÊ DUY TÀI - IT24M)
echo   NestJS API (Port 3000) + Next.js (Port 3001) + Neon PostgreSQL Cloud
echo ======================================================================
echo.

:: Tự động nhận diện Node.js trong hệ thống
set "NODE_CMD=node"
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Users\ADMIN\typescript\node.exe" (
        set "PATH=C:\Users\ADMIN\typescript;%PATH%"
    ) else if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else (
        echo [CẢNH BÁO] Không tìm thấy Node.js trong PATH!
        echo Vui lòng cài đặt Node.js từ https://nodejs.org để chạy chế độ Dev.
        echo.
        echo Hoặc bạn có thể mở xem trực tiếp bản dựng tại:
        echo %~dp0baitap1\index.html
        echo.
        pause
        exit /b 1
    )
)

echo [1/3] Đang kiểm tra kết nối Neon Serverless PostgreSQL Cloud...
echo Chuỗi kết nối: ep-wispy-hall-b4rtt92m-pooler.c-6.us-east-2.aws.neon.tech
echo.

echo [2/3] Đang khởi động Backend NestJS (Port 3000)...
start "Backend NestJS (Port 3000)" cmd /k "cd /d %~dp0backend && npm run start:dev"

timeout /t 4 /nobreak > nul

echo [3/3] Đang khởi động Frontend Next.js (Port 3001)...
start "Frontend NextJS (Port 3001)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ======================================================================
echo   🎉 HỆ THỐNG ĐÃ SẴN SÀNG!
echo   - Frontend:    http://localhost:3001
echo   - Backend API: http://localhost:3000/api/profile
echo   - DB Health:   http://localhost:3000/api/health
echo   - Hosting:     https://it24m.dak.edu.vn/leduytai/baitap1/
echo ======================================================================
echo.
echo Đang tự động mở trình duyệt...
start "" "http://localhost:3001"

echo Nhấn phím bất kỳ để đóng cửa sổ này (Backend & Frontend vẫn chạy nền)...
pause > nul
