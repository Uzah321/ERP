@echo off
cd /d "%~dp0"

echo Step 1: Packaging frontend build...
tar.exe -czf public\build.tar.gz -C public build

echo.
echo Step 2: Uploading updated backend files...
scp app\Http\Controllers\AssetController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/
scp app\Http\Controllers\ReportController.php administrator@77.93.154.83:/var/www/simbisa/app/Http/Controllers/

echo.
echo Step 3: Uploading compiled frontend assets...
scp public\build.tar.gz administrator@77.93.154.83:/var/www/simbisa/public/

echo.
echo Step 4: Extracting assets and clearing Laravel cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && rm -rf build && tar -xzf build.tar.gz && test -f build/manifest.json && cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo Depreciation rate feature deployed.
pause