@echo off
cd /d "%~dp0"

echo Step 1: Uploading location controller fix...
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/

echo.
echo Step 2: Clearing Laravel cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo Location dropdown fix deployed.
pause