@echo off
cd /d "%~dp0"

echo Step 1: Building frontend assets...
call npm run build
if errorlevel 1 exit /b 1

echo.
echo Step 2: Uploading Compiled Vite Assets...
scp -r public\build administrator@77.93.154.83:/var/www/simbisa/public/
if errorlevel 1 exit /b 1

echo.
echo Step 3: Uploading React Source Files...
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
if errorlevel 1 exit /b 1
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
if errorlevel 1 exit /b 1

echo.
echo Step 4: Clearing Laravel Cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker-compose exec -T app php artisan optimize:clear'"
if errorlevel 1 exit /b 1

echo.
echo Deployment Complete!
pause
