@echo off
title AquaFlow Direct - Autonomous Dropshipping Empire OS
color 0B

echo ======================================================================
echo    AQUAFLOW DIRECT: FULL AUTOPILOT DROPSHIPPING EMPIRE
echo    "Earn Like Water In The Sea" - Turnkey Autonomous OS
echo ======================================================================
echo.
echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js.
    pause
    exit /b
)

echo [2/3] Launching AquaFlow Autopilot Server...
start "" http://localhost:3000/admin
start "" http://localhost:3000

echo [3/3] Server online! Press Ctrl+C in this window to stop the business.
echo.
node server/index.js
pause
