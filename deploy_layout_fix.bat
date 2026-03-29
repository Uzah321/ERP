@echo off
echo Deploying Layout file to the remote server...
scp resources\js\Layouts\AuthenticatedLayout.jsx administrator@77.93.154.83:/srv/simbisa_app/first-app/resources/js/Layouts/

echo Rebuilding frontend assets on remote server...
ssh administrator@77.93.154.83 "cd /srv/simbisa_app/first-app && sudo sg docker -c 'docker exec simbisa_app npm run build'"

echo Deployment completed.
pause
