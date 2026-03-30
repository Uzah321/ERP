@echo off
cd /d "%~dp0"
echo Step 1: Uploading registration controller fix...
scp app\Http\Controllers\Auth\RegisteredUserController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/Auth/
if errorlevel 1 exit /b 1

echo.
echo Step 2: Clearing Laravel cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker-compose exec -T app php artisan optimize:clear'"
if errorlevel 1 exit /b 1

echo.
echo Register page fix deployed.
pause