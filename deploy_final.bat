@echo off
echo Step 1: Uploading files to correct remote location...
scp app\Http\Controllers\CategoryController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp routes\web.php administrator@77.93.154.83:/var/www/simbisa/routes/
scp resources\js\Layouts\AuthenticatedLayout.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Layouts/

echo.
echo Step 2: Compiling React assets and clearing Laravel Cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec simbisa_app php artisan optimize:clear && docker exec simbisa_app npm run build'"

echo.
echo Deployment and Cache Reset Completed!
pause
