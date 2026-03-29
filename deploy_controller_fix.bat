@echo off
echo Uploading Fixed Controllers...
scp app\Http\Controllers\CategoryController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/

echo Restarting app server to apply PHP changes...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec simbisa_app php artisan optimize:clear'"
echo Done!
pause
