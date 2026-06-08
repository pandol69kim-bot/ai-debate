@echo off
echo ========================================
echo    AI Arena - Starting...
echo ========================================

if not exist .env (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and add your API keys.
    pause
    exit /b 1
)

echo [1/3] Pulling latest images...
docker-compose pull postgres redis nginx

echo [2/3] Building application images...
docker-compose build

echo [3/3] Starting all services...
docker-compose up -d

echo.
echo ========================================
echo    AI Arena is running!
echo.
echo    Frontend : http://localhost
echo    Backend  : http://localhost/api/v1
echo    API Docs : http://localhost/docs
echo ========================================
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
pause
