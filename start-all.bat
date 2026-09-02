@echo off
title LUNA E-Commerce Launcher
echo ===================================================
echo   LUNA 3D E-Commerce Platform Launcher
echo ===================================================
echo Starting Backend and Frontend servers...

start "LUNA Backend API (:5000)" cmd /k "cd backend && python app.py"
start "LUNA Frontend (:5173)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo Both servers are launching!
echo Open your browser at: http://localhost:5173
echo ===================================================
pause
