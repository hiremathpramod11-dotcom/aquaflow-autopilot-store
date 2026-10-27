@echo off
title AquaFlow Direct - Worldwide Public Access Link
color 0B

echo ======================================================================
echo    AQUAFLOW DIRECT: GENERATING WORLDWIDE LIVE PUBLIC LINK
echo ======================================================================
echo.
echo Connecting to global secure gateway on Port 3000...
echo.
node server/tunnel.js
pause
