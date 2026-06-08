@echo off
echo ========================================
echo    AI Arena - Dev Mode
echo ========================================

if not exist .env (
    copy .env.example .env
    echo [INFO] Created .env from .env.example
    echo Please add your API keys to .env
    pause
    exit /b 1
)

echo Starting infrastructure (DB + Redis)...
docker-compose up -d postgres redis

echo.
echo Infrastructure ready!
echo.
echo Now start backend and frontend manually:
echo.
echo  [Backend]
echo   cd backend
echo   pip install -r requirements.txt
echo   uvicorn app.main:app --reload --port 8000
echo.
echo  [Frontend]
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo  URLs:
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo.
pause
