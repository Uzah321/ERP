@echo off
REM Deploy Laravel + Docker to Remote Server (Optimized)
setlocal enabledelayedexpansion

REM === CONFIGURATION ===
set SERVER_IP=77.93.154.83
set SSH_USER=administrator
set APP_PATH=/var/www/simbisa
set LOCAL_PATH=C:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app
set ARCHIVE=deploy-%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%.zip

echo 🚀 Starting optimized deployment...
echo Target: %SSH_USER%@%SERVER_IP%:%APP_PATH%
echo.

REM === PRE-FLIGHT CHECKS ===
where ssh >nul 2>nul || (echo ❌ Install OpenSSH Client & pause & exit /b 1)
where powershell >nul 2>nul || (echo ❌ PowerShell required & pause & exit /b 1)

REM === STEP 1: Create minimal archive ===
echo 📦 Building deployment archive...
pushd "%LOCAL_PATH%"

REM Essential paths only (excludes dev/cache files)
set "ESSENTIAL=app bootstrap config database public resources routes tests vendor composer.json composer.lock artisan .env.production docker-compose.yml .docker Dockerfile .dockerignore .gitignore"

powershell -Command ^
  "$inc = '%ESSENTIAL%'.Split(' ') | Where-Object {Test-Path $_}; ^
   $exc = @('node_modules','.git','storage/framework/cache/*','storage/logs/*','bootstrap/cache/*','*.log','.env'); ^
   Compress-Archive -Path $inc -DestinationPath '%ARCHIVE%' -Force -ErrorAction SilentlyContinue"

if not exist "%ARCHIVE%" (echo ❌ Archive failed & popd & pause & exit /b 1)
echo ✅ Created %ARCHIVE% (%~z0% bytes)
popd

REM === STEP 2: Upload & Extract ===
echo 🔐 Connecting to server...
ssh %SSH_USER%@%SERVER_IP% "mkdir -p %APP_PATH%" || (echo ❌ SSH failed & del "%ARCHIVE%" & pause & exit /b 1)

echo ⬆️  Uploading...
scp "%LOCAL_PATH%\%ARCHIVE%" %SSH_USER%@%SERVER_IP%:%APP_PATH%/ || (echo ❌ Upload failed & del "%ARCHIVE%" & pause & exit /b 1)

echo 🔧 Deploying on server...
ssh %SSH_USER%@%SERVER_IP% ^
"cd %APP_PATH% && ^
unzip -o %ARCHIVE% && ^
rm %ARCHIVE% && ^
[ -f .env.production ] && [ ! -f .env ] && cp .env.production .env && ^
grep -q '^APP_KEY=base64:' .env || (echo '❌ APP_KEY missing' && exit 1) && ^
docker-compose down --remove-orphans && ^
docker-compose pull && ^
docker-compose build --no-cache app worker scheduler && ^
docker-compose up -d && ^
sleep 8 && ^
docker-compose exec -T app php artisan migrate --force && ^
docker-compose exec -T app php artisan config:cache && ^
docker-compose exec -T app php artisan route:cache && ^
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache && ^
docker-compose ps && ^
echo '✅ Deploy complete'"

if errorlevel 1 (
    echo ❌ Remote deploy failed
    echo 💡 Debug: ssh %SSH_USER%@%SERVER_IP% 'cd %APP_PATH% && docker-compose logs app'
    del "%ARCHIVE%"
    pause
    exit /b 1
)

REM === CLEANUP ===
del "%ARCHIVE%"
echo.
echo 🎉 SUCCESS! Visit: http://%SERVER_IP%
echo 📋 Logs: ssh %SSH_USER%@%SERVER_IP% 'cd %APP_PATH% && docker-compose logs -f'
pause