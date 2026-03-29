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

Pop-Location
Write-Success "Frontend build packaged successfully!"
Write-Info ""

# Upload files
Write-Info "Uploading application files..."
Write-Info "Source: $LocalPath"
Write-Info "Destination: $ServerIP`:$AppPath"

scp -r "$LocalPath\*" "$SSHUser@$ServerIP`:$AppPath/" 2>&1 | Select-String -Pattern "NOTICE|ERROR" -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: File upload failed"
    exit 1
}

Write-Success "Files uploaded successfully!"
Write-Info ""

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

$remoteSetup = @"
cd $AppPath

echo 'Setting up environment...'
cp .env.production .env

echo 'Generating APP_KEY...'
docker-compose run --rm app php artisan key:generate

echo 'Building Docker containers...'
sudo docker-compose up -d --build

echo 'Waiting for database to initialize...'
sleep 15

echo 'Running migrations...'
sudo docker-compose exec -T app php artisan migrate --force

echo 'Caching configuration...'
sudo docker-compose exec -T app php artisan config:cache
sudo docker-compose exec -T app php artisan route:cache

echo 'Setting permissions...'
sudo docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache

echo ''
docker-compose ps
"@

ssh $SSHUser@$ServerIP $remoteSetup

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
