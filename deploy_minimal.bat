@echo off
REM Minimal Deploy Script for Laravel Application
REM Only uploads production files for fastest deployment

setlocal enabledelayedexpansion

set SERVER_IP=77.93.154.83
set SSH_USER=administrator
set APP_PATH=/var/www/simbisa
set LOCAL_APP_PATH=c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app
set DEPLOY_ARCHIVE=deploy_minimal.zip

REM Clean up any previous archive
if exist %DEPLOY_ARCHIVE% del %DEPLOY_ARCHIVE%


REM Create deployment archive with only necessary files
REM Exclude node_modules, .git, tests, docs, local logs, etc.
REM Only include production code and assets
set FILES_TO_DEPLOY=app bootstrap config public resources routes .docker composer.json composer.lock package.json artisan Dockerfile docker-compose.yml .env.production

REM Check if previous archive exists and delete it
if exist %DEPLOY_ARCHIVE% del %DEPLOY_ARCHIVE%

REM Create the archive (retry up to 3 times if file lock error)
set RETRIES=0
:RETRY_ARCHIVE
powershell -Command "Compress-Archive -Path %FILES_TO_DEPLOY% -DestinationPath %DEPLOY_ARCHIVE%"
if errorlevel 1 (
    set /a RETRIES+=1
    if %RETRIES% lss 3 (
        echo Archive creation failed, retrying in 5 seconds...
        timeout /t 5
        goto :RETRY_ARCHIVE
    ) else (
        echo ERROR: Failed to create deployment archive after 3 attempts.
        pause
        exit /b 1
    )
)

if errorlevel 1 (
    echo ERROR: Failed to create deployment archive.
    pause
    exit /b 1
)

REM Upload the archive
scp %DEPLOY_ARCHIVE% %SSH_USER%@%SERVER_IP%:%APP_PATH%/
if errorlevel 1 (
    echo ERROR: Failed to upload deployment archive.
    pause
    exit /b 1
)

REM Extract and deploy on server
ssh %SSH_USER%@%SERVER_IP% "cd %APP_PATH%; unzip -o %DEPLOY_ARCHIVE%; rm -f %DEPLOY_ARCHIVE%; if [ ! -f .env ]; then if [ -f .env.production ]; then cp .env.production .env; else echo 'ERROR: .env is missing and .env.production was not found.'; exit 1; fi; fi; if ! grep -q '^APP_KEY=base64:' .env; then echo 'ERROR: APP_KEY is missing in .env. Refusing to generate a new key during deployment.'; exit 1; fi; docker rm -f simbisa_nginx || true; docker-compose up -d --build --remove-orphans; sleep 15; docker-compose exec -T app php artisan migrate --force; docker-compose exec -T app php artisan optimize:clear; docker-compose exec -T app php artisan config:cache; docker-compose exec -T app php artisan route:cache; docker-compose exec -T app php artisan view:cache; docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache; docker-compose ps"
    chown -R www-data:www-data .; \
    find . -type d -exec chmod 755 {} \;; \
    find . -type f -exec chmod 644 {} \;; \

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
