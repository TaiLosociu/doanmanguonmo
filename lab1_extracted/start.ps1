# PowerShell script khởi động hệ thống
$env:PATH = "C:\Users\ADMIN\typescript;" + $env:PATH

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  KHỞI ĐỘNG HỆ THỐNG LANDING PAGE CÁ NHÂN (LÊ DUY TÀI)" -ForegroundColor Cyan
Write-Host "  NestJS API (Port 3000) + Next.js (Port 3001) + Neon DB" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Khởi động Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\ADMIN\typescript;' + `$env:PATH; cd '$scriptDir\backend'; npm run start:dev"

Start-Sleep -Seconds 3

# Khởi động Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Users\ADMIN\typescript;' + `$env:PATH; cd '$scriptDir\frontend'; npm run dev"

Write-Host "`nĐã mở 2 cửa sổ terminal cho Backend (Port 3000) và Frontend (Port 3001)." -ForegroundColor Green
Write-Host "Mở trình duyệt tại: http://localhost:3001`n" -ForegroundColor Yellow

