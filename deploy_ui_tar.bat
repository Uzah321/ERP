@echo off
cd /d "%~dp0"

echo Step 1: Building and packaging frontend assets via tar...
call npm run build
if errorlevel 1 exit /b 1

tar.exe -czf public\build.tar.gz -C public build
if errorlevel 1 exit /b 1

echo.
echo Step 2: Uploading Compiled Frontend Assets via Tar...
scp public\build.tar.gz administrator@77.93.154.83:/var/www/simbisa/public/
if errorlevel 1 exit /b 1

echo.
echo Step 3: Extracting Assets and Clearing Cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && rm -rf build && tar -xzf build.tar.gz && test -f build/manifest.json && cd /var/www/simbisa && sg docker -c 'docker-compose exec -T app php artisan optimize:clear'"
if errorlevel 1 exit /b 1

echo.
echo Deployment Verified and Completed!
pause
