@echo off
cd /d "%~dp0"
echo Uploading Fixed Controllers...
scp app\Http\Controllers\CategoryController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
if errorlevel 1 exit /b 1
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
if errorlevel 1 exit /b 1

echo Restarting app server to apply PHP changes...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker-compose exec -T app php artisan optimize:clear'"
echo Done!
pause
