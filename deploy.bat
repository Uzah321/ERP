@echo off
REM Deploy Laravel Application to Live Server
REM Server: 77.93.154.83
REM User: administrator

setlocal enabledelayedexpansion

set SERVER_IP=77.93.154.83
set SSH_USER=administrator
set APP_PATH=/var/www/simbisa
set LOCAL_APP_PATH=c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app

echo ================================
echo Deploying to Live Server
echo ================================
echo Server: %SERVER_IP%
echo User: %SSH_USER%
echo.

REM Check if SSH and SCP are available
where scp >nul 2>nul
if errorlevel 1 (
    echo ERROR: SCP not found. Please install OpenSSH Client or Git Bash.
    pause
    exit /b 1
)

REM Create remote directory
echo Creating remote directories...
ssh %SSH_USER%@%SERVER_IP% "mkdir -p %APP_PATH% && chown %SSH_USER%:%SSH_USER% %APP_PATH%"

if errorlevel 1 (
    echo ERROR: Failed to connect to server. Check SSH credentials and server IP.
    pause
    exit /b 1
)

REM Upload application files
echo.
echo Uploading application files...
scp -r "%LOCAL_APP_PATH%\*" %SSH_USER%@%SERVER_IP%:%APP_PATH%/

if errorlevel 1 (
    echo ERROR: Failed to upload files.
    pause
    exit /b 1
)

scp -r "%LOCAL_APP_PATH%\.docker" %SSH_USER%@%SERVER_IP%:%APP_PATH%/

if errorlevel 1 (
    echo ERROR: Failed to upload .docker.
    pause
    exit /b 1
)

scp "%LOCAL_APP_PATH%\.env.production" %SSH_USER%@%SERVER_IP%:%APP_PATH%/.env.production

if errorlevel 1 (
    echo ERROR: Failed to upload .env.production.
    pause
    exit /b 1
)

echo.
echo ================================
echo Deployment Files Uploaded!
echo ================================
echo.

REM Remote commands
echo Now executing setup on remote server...
echo.

ssh %SSH_USER%@%SERVER_IP% "cd %APP_PATH%; if [ ! -f .env ]; then if [ -f .env.production ]; then cp .env.production .env; else echo 'ERROR: .env is missing and .env.production was not found.'; exit 1; fi; fi; if ! grep -q '^APP_KEY=base64:' .env; then echo 'ERROR: APP_KEY is missing in .env. Refusing to generate a new key during deployment.'; exit 1; fi; sudo docker-compose up -d --build --remove-orphans; sleep 15; sudo docker-compose exec -T app php artisan migrate --force; sudo docker-compose exec -T app php artisan optimize:clear; sudo docker-compose exec -T app php artisan config:cache; sudo docker-compose exec -T app php artisan route:cache; sudo docker-compose exec -T app php artisan view:cache; sudo docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache; docker-compose ps"

if errorlevel 1 (
    echo ERROR: Remote setup failed. Check Docker installation on server.
    pause
    exit /b 1
)

echo.
echo ================================
echo SUCCESS!
echo ================================
echo Your application is now deployed!
echo Visit: http://77.93.154.83
echo.
pause
