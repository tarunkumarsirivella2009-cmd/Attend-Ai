# PowerShell script to start AttendAI React Frontend
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting AttendAI React Frontend (Vite)  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"
npm.cmd run dev
