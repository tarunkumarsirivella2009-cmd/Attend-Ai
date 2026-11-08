# PowerShell script to start AttendAI FastAPI Backend
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting AttendAI FastAPI Backend Server " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"
& ".\venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload
