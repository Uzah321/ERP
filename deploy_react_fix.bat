@echo off
cd /d "%~dp0"

echo Step 1: Building and packaging frontend assets...
call npm run build
if errorlevel 1 exit /b 1

powershell -Command "if (Test-Path 'public\\build.zip') { Remove-Item 'public\\build.zip' -Force }; Compress-Archive -Path 'public\\build' -DestinationPath 'public\\build.zip' -Force"
if errorlevel 1 exit /b 1

echo.
echo Step 2: Uploading React source files...
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
if errorlevel 1 exit /b 1
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
if errorlevel 1 exit /b 1

scp public\build.zip administrator@77.93.154.83:/var/www/simbisa/public/
if errorlevel 1 exit /b 1

echo.
echo Step 3: Publishing assets and clearing Laravel cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && rm -rf build && unzip -oq build.zip && cd /var/www/simbisa && sg docker -c 'docker-compose exec -T app php artisan optimize:clear'"
if errorlevel 1 exit /b 1

echo.
echo React Deployment Completed!
pause
