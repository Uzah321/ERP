# Deploy Laravel Application to Live Server using PowerShell
# Server: 77.93.154.83
# Usage: .\deploy.ps1

param(
    [string]$ServerIP = "77.93.154.83",
    [string]$SSHUser = "administrator",
    [string]$AppPath = "/var/www/simbisa",
    [string]$LocalPath = "c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"

function Write-Info { Write-Host $args -ForegroundColor $InfoColor }
function Write-Success { Write-Host $args -ForegroundColor $SuccessColor }
function Write-Error { Write-Host $args -ForegroundColor $ErrorColor }

$composeCommand = "sudo docker-compose"
$deploymentArchiveName = "deploy_bundle.tar.gz"

Write-Info "================================"
Write-Info "Laravel Deployment to Live Server"
Write-Info "================================"
Write-Info "Server: $ServerIP"
Write-Info "User: $SSHUser"
Write-Info "App Path: $AppPath"
Write-Info ""

# Check if SCP is available
Write-Info "Checking for SSH/SCP tools..."
$scp = Get-Command scp -ErrorAction SilentlyContinue
$ssh = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $scp -or -not $ssh) {
    Write-Error "ERROR: SSH tools not found!"
    Write-Info "Install OpenSSH Client:"
    Write-Info "  - Windows 10/11: Settings > Apps > Optional Features > OpenSSH Client"
    Write-Info "  - Or install Git Bash or Windows Terminal"
    exit 1
}

Write-Success "SSH tools found!"
Write-Info ""

# Test SSH connection
Write-Info "Testing SSH connection to $ServerIP..."
ssh $SSHUser@$ServerIP "echo 'SSH Connected'" | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Cannot connect to server!"
    Write-Info "Verify:"
    Write-Info "  - Server IP: $ServerIP"
    Write-Info "  - SSH User: $SSHUser"
    Write-Info "  - SSH key or password authentication is configured"
    exit 1
}

Write-Success "SSH connection successful!"
Write-Info ""

# Create remote directory
Write-Info "Creating remote directories..."
ssh $SSHUser@$ServerIP "mkdir -p $AppPath && chown $SSHUser`:$SSHUser $AppPath" | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Failed to create remote directories"
    exit 1
}

Write-Success "Remote directory ready!"
Write-Info ""

# Build frontend locally because the production app container does not include npm
Write-Info "Building frontend locally..."
Push-Location $LocalPath
npm run build

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "ERROR: Local frontend build failed"
    exit 1
}

tar.exe -czf "public\build.tar.gz" -C public build

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "ERROR: Failed to package frontend build"
    exit 1
}

$deploymentArchivePath = Join-Path $LocalPath $deploymentArchiveName
$deploymentExcludes = @(
    '--exclude=.git',
    '--exclude=node_modules',
    '--exclude=vendor',
    '--exclude=storage/logs',
    '--exclude=public/build',
    '--exclude=public/build.tar.gz',
    '--exclude=public/build.zip',
    '--exclude=.env',
    '--exclude=.env.backup',
    '--exclude=.env.production',
    '--exclude=.vscode',
    '--exclude=.idea',
    '--exclude=.fleet',
    '--exclude=.zed',
    '--exclude=.phpunit.result.cache',
    '--exclude=*.log',
    '--exclude=error_log.txt',
    '--exclude=latest_error.log',
    '--exclude=latest_errors.txt',
    '--exclude=raw_error_log.txt',
    '--exclude=out.txt',
    '--exclude=render.out',
    '--exclude=backups'
)

if (Test-Path $deploymentArchivePath) {
    Remove-Item $deploymentArchivePath -Force
}

Write-Info "Packaging lean deployment archive..."
$deploymentArchiveArgs = @('-czf', $deploymentArchivePath) + $deploymentExcludes + @('-C', $LocalPath, '.')
& tar.exe @deploymentArchiveArgs

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "ERROR: Failed to package deployment archive"
    exit 1
}

Pop-Location
Write-Success "Frontend build and lean deployment archive packaged successfully!"
Write-Info ""

# Upload files
Write-Info "Uploading application files..."
Write-Info "Source: $LocalPath"
Write-Info "Destination: $ServerIP`:$AppPath"

scp "$deploymentArchivePath" "$SSHUser@$ServerIP`:$AppPath/"

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Deployment archive upload failed"
    exit 1
}

scp "$LocalPath\.env.production" "$SSHUser@$ServerIP`:$AppPath/.env.production"

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: .env.production upload failed"
    exit 1
}

Write-Success "Files uploaded successfully!"
Write-Info ""

Write-Info "Extracting deployment archive on the server..."
ssh $SSHUser@$ServerIP "cd $AppPath && tar -xzf $deploymentArchiveName && rm -f $deploymentArchiveName"

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Failed to extract deployment archive on the server"
    exit 1
}

if (Test-Path $deploymentArchivePath) {
    Remove-Item $deploymentArchivePath -Force
}

# Upload compiled frontend assets separately and verify manifest location
Write-Info "Uploading compiled frontend assets..."
scp "$LocalPath\public\build.tar.gz" "$SSHUser@$ServerIP`:$AppPath/public/"

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Frontend asset upload failed"
    exit 1
}

ssh $SSHUser@$ServerIP "cd $AppPath/public && rm -rf build && tar -xzf build.tar.gz && test -f build/manifest.json"

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Frontend assets were uploaded but manifest verification failed"
    exit 1
}

Write-Success "Frontend assets uploaded and verified!"
Write-Info ""

# Execute remote setup
Write-Info "Executing setup on remote server..."
Write-Info ""

$remoteSetup = @'
set -e

cd __APP_PATH__

echo 'Setting up environment...'
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
    else
        echo 'ERROR: .env is missing and .env.production was not found.'
        exit 1
    fi
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    echo 'ERROR: APP_KEY is missing in .env. Refusing to generate a new key during deployment.'
    exit 1
fi

COMPOSE="__COMPOSE_COMMAND__"

echo 'Building Docker containers...'
echo 'Removing stale app containers to avoid legacy docker-compose ContainerConfig failures...'
STALE_APP_CONTAINERS=$(sudo docker ps -aq --filter name=assetlinq_app)
if [ -n "$STALE_APP_CONTAINERS" ]; then
    sudo docker rm -f $STALE_APP_CONTAINERS
fi

$COMPOSE pull || true
$COMPOSE build app worker scheduler

echo 'Installing PHP dependencies on the server volume...'
$COMPOSE run --rm app composer install --no-interaction --no-dev --optimize-autoloader

$COMPOSE up -d --build --remove-orphans

echo 'Waiting for database to initialize...'
sleep 15

echo 'Running migrations...'
$COMPOSE exec -T app php artisan migrate --force

echo 'Caching configuration...'
$COMPOSE exec -T app php artisan optimize:clear
$COMPOSE exec -T app php artisan config:cache
$COMPOSE exec -T app php artisan route:cache
$COMPOSE exec -T app php artisan view:cache

echo 'Setting permissions...'
$COMPOSE exec -T app chown -R www-data:www-data storage bootstrap/cache

echo 'Restarting nginx to clear any stale upstream after app recreation...'
$COMPOSE restart nginx || sudo docker restart simbisa_nginx

echo ''
$COMPOSE ps
'@

$remoteSetup = $remoteSetup.Replace('__APP_PATH__', $AppPath).Replace('__COMPOSE_COMMAND__', $composeCommand)

$remoteSetupCommand = @"
cat > /tmp/assetlinq_deploy.sh <<'EOF'
$remoteSetup
EOF
bash /tmp/assetlinq_deploy.sh
"@

ssh $SSHUser@$ServerIP $remoteSetupCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Remote setup failed"
    Write-Info "Check Docker installation and permissions on the server"
    exit 1
}

Write-Info ""
Write-Success "================================"
Write-Success "DEPLOYMENT COMPLETE!"
Write-Success "================================"
Write-Info ""
Write-Info "Your application is now deployed!"
Write-Info "URL: http://$ServerIP"
Write-Info ""
Write-Info "Next steps:"
Write-Info "  1. Visit http://$ServerIP in your browser"
Write-Info "  2. Log in with your credentials"
Write-Info "  3. Check server logs: ssh $SSHUser@$ServerIP"
Write-Info "  4. Monitor: docker-compose logs -f app"
Write-Info ""

Read-Host "Press Enter to exit"
