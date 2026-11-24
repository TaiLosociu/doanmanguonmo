@echo off
title San Nha FC - He Thong Dat San Truc Tuyen (Port 3001)
color 0B
echo ========================================================
echo    DANG KHOI DONG HE THONG SAN NHA FC (PORT 3001)
echo ========================================================
echo.

if not exist "node_modules" (
    echo [1/2] Dang cai dat thu vien (npm install)...
    call npm install
) else (
    echo [1/2] Thu vien node_modules da san sang.
)

echo.
echo [2/2] Dang khoi chay may chu Next.js tai cong 3001...
echo Website se mo tai: http://localhost:3001
echo Nhan Ctrl+C de dung may chu khi can thiet.
echo.

start "" "http://localhost:3001"
call npm run dev
pause
