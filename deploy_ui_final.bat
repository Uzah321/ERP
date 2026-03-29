@echo off
echo Step 1: Zipping UI Build
cd public
powershell -Command "Compress-Archive -Path build -DestinationPath build.zip -Force"
cd ..

echo.
echo Step 2: Uploading UI Build
scp public\build.zip administrator@77.93.154.83:/var/www/simbisa/public/

echo.
echo Step 3: Unzipping build and clearing cache...
ssh administrator@77.93.154.83 "cd /var/www/simbisa/public && python3 -c \"import zipfile; zipfile.ZipFile('build.zip', 'r').extractall('.')\" && cd /var/www/simbisa && sg docker -c 'docker exec assetlinq_app php artisan optimize:clear'"

echo.
echo Deployment Complete!
pause
