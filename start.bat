@echo off
echo =============================================================
echo   LoadLink - SIH 2026 Shared Freight & Logistics Platform
echo =============================================================
echo.

start "LoadLink Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && node src/index.js"
timeout /t 2 >nul
start "LoadLink Frontend App (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo  - Backend API: http://localhost:5000/api/health
echo  - Frontend UI: http://localhost:5173
echo.
echo Press any key to close this launcher window...
pause >nul
