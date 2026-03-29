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

echo.
echo ================================
echo Deployment Files Uploaded!
echo ================================
echo.

REM Remote commands
echo Now executing setup on remote server...
echo.

ssh %SSH_USER%@%SERVER_IP% << 'REMOTE_COMMANDS'
    cd /var/www/simbisa
    
    echo "Setting up environment..."
    cp .env.production .env
    
    echo "Generating APP_KEY..."
    docker-compose run --rm app php artisan key:generate
    
    echo "Building Docker containers..."
    sudo docker-compose up -d --build
    
    echo "Waiting for database to initialize..."
    sleep 15
    
    echo "Running migrations..."
    sudo docker-compose exec -T app php artisan migrate --force
    
    echo "Caching configuration..."
    sudo docker-compose exec -T app php artisan config:cache
    sudo docker-compose exec -T app php artisan route:cache
    
    echo "Setting permissions..."
    sudo docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache
    
    echo ""
    echo "================================"
    echo "Deployment Complete!"
    echo "================================"
    echo "Application URL: http://77.93.154.83"
    echo "Check status: docker-compose ps"
    
REMOTE_COMMANDS

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
