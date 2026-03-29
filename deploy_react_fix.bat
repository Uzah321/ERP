@echo off
echo Step 1: Uploading React Components
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/

echo.
echo Step 2: Compiling React assets on the server...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app npm install && docker exec assetlinq_app npm run build && docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo React Deployment Completed!
pause
