@echo off
echo Step 1: Uploading Compiled Frontend Assets via Tar...
scp public\build.tar.gz administrator@77.93.154.83:/var/www/simbisa/public/

echo.
echo Step 2: Extracting Assets and Clearing Cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && rm -rf build && tar -xzf build.tar.gz && test -f build/manifest.json && cd /var/www/simbisa && sg docker -c 'docker exec simbisa_app php artisan optimize:clear'"

echo.
echo Deployment Verified and Completed!
pause
