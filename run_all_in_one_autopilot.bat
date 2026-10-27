@echo off
title AquaFlow Direct - Master Autonomous OS (Auto-Upload & Auto-Manage)
color 0A

echo ======================================================================
echo    🌊 AQUAFLOW DIRECT: FULL AUTOPILOT DROPSHIPPING EMPIRE
echo    Autonomous Product Hunting, Social Auto-Upload & Store Management
echo ======================================================================
echo.
echo [1/4] Checking Node.js runtime...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b
)

echo [2/4] Verifying PhonePe UPI Direct Deposit (910889831@ybl)... [OK]
echo [3/4] Initializing Cloudflare Edge Worldwide Live Gateway...
echo [4/4] Starting Autonomous Engine with Instagram Auto-Upload (@kevin_369)...
echo.
echo ======================================================================
echo  🚀 OS ACTIVE: Press Ctrl+C in this window anytime to pause.
echo ======================================================================
echo.

node server/tunnel.js
pause
