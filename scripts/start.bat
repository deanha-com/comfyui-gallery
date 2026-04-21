@echo off
echo Starting ComfyUI Gallery (dev mode)...
echo.
echo 1/2 - Starting FastAPI backend...
start "FastAPI" /b python -m uvicorn backend.main:app --reload --port 8000
timeout /t 3 >nul
echo.
echo 2/2 - Starting Vite frontend...
cd frontend
start "Frontend" /b npm run dev
cd ..
timeout /t 2 >nul
echo.
echo Opening browser...
start http://localhost:5173
echo.
echo ComfyUI Gallery is running!
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173
echo.
pause
