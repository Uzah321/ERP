@echo off
echo Step 1: Uploading Compiled Vite Assets...
scp public\build.zip administrator@77.93.154.83:/var/www/simbisa/public/

echo.
echo Step 2: Uploading React Source Files...
scp resources\js\Pages\Admin\Categories.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/
scp resources\js\Pages\Admin\Locations.jsx administrator@77.93.154.83:/var/www/simbisa/resources/js/Pages/Admin/

echo.
echo Step 3: Unzipping build and clearing cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && rm -rf build && unzip -q build.zip && cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo Deployment Complete!
pause
