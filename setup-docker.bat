@echo off
REM Simbisa Docker Setup Script for Windows

echo ==========================================
echo Simbisa Asset Management - Docker Setup
echo ==========================================
echo.

REM Check Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    exit /b 1
)

echo OK Docker is running

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.docker...
    copy .env.docker .env
    echo OK .env file created
) else (
    echo OK .env file already exists
)

REM Generate app key
findstr /m "APP_KEY=base64:" .env >nul 2>&1
if errorlevel 1 (
    echo.
    echo Generating APP_KEY...
    docker compose run --rm app php artisan key:generate
) else (
    echo OK APP_KEY already set
)

REM Start services
echo.
echo Starting Docker services...
docker compose up -d

REM Wait for services
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak

REM Run migrations
echo.
echo Running database migrations...
docker compose exec -T app php artisan migrate --force
echo OK Migrations completed

REM Clear caches
echo.
echo Optimizing application...
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache
echo OK Caches optimized

echo.
echo ==========================================
echo OK Setup completed successfully!
echo ==========================================
echo.
echo Access your application at:
echo   Web: http://localhost:80
echo.
echo Useful commands:
echo   View logs:       docker compose logs -f app
echo   Bash shell:      docker compose exec app bash
echo   Artisan command: docker compose exec app php artisan [command]
echo   Database:        Connect to localhost:5432 (user: postgres, password: secret)
echo.
echo To stop: docker compose down
echo.
pause
