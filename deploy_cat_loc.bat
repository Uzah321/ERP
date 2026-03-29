@echo off
echo Deploying new Category and Location files to the remote server...
scp app\Http\Controllers\CategoryController.php administrator@77.93.154.83:/srv/simbisa_app/first-app/app/Http/Controllers/
scp app\Http\Controllers\LocationController.php administrator@77.93.154.83:/srv/simbisa_app/first-app/app/Http/Controllers/
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/srv/simbisa_app/first-app/resources/js/Pages/Admin/
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/srv/simbisa_app/first-app/resources/js/Pages/Admin/
scp routes\web.php administrator@77.93.154.83:/srv/simbisa_app/first-app/routes/
scp resources\js\Layouts\AuthenticatedLayout.jsx administrator@77.93.154.83:/srv/simbisa_app/first-app/resources/js/Layouts/

echo Rebuilding frontend assets on remote server...
ssh administrator@77.93.154.83 "cd /srv/simbisa_app/first-app && sudo sg docker -c 'docker exec assetlinq_app npm run build'"

echo Deployment completed.
pause
