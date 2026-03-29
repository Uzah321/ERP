@echo off
echo Deploying new Category and Location files to the correct remote server path (/var/www/simbisa/)...
scp app\Http\Controllers\CategoryController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp routes\web.php administrator@77.93.154.83:/var/www/simbisa/routes/
scp resources\js\Layouts\AuthenticatedLayout.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Layouts/

echo Rebuilding frontend assets on remote server...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec simbisa_app npm run build'"

echo Deployment completed.
pause
