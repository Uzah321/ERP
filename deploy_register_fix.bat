@echo off
echo Step 1: Uploading registration controller fix...
scp app\Http\Controllers\Auth\RegisteredUserController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/Auth/

echo.
echo Step 2: Clearing Laravel cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo Register page fix deployed.
pause