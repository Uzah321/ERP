# Deploy latest changes to production
# Uploads to /tmp then moves with docker, works around directory ownership issues.
# Usage: .\deploy_latest.ps1

param(
    [string]$Server = "77.93.154.83",
    [string]$User   = "administrator",
    [string]$AppDir = "/var/www/simbisa"
)

$ErrorActionPreference = "Stop"
$RemoteTarget = "${User}@${Server}"
$BuildArchive = "public\build.tar.gz"

function Invoke-SSH {
    param([string]$Cmd)
    ssh $RemoteTarget $Cmd
    if ($LASTEXITCODE -ne 0) { throw "SSH command failed" }
}

Write-Host "========================================"
Write-Host " AssetLinq - Deploy Latest Changes"
Write-Host "========================================"

# 1. Package compiled frontend build
Write-Host ""
Write-Host "[1/4] Packaging public/build ..."
if (Test-Path $BuildArchive) { Remove-Item $BuildArchive -Force }
tar -czf $BuildArchive -C public build
if ($LASTEXITCODE -ne 0) { throw "Failed to package public/build" }
$sizeMB = [math]::Round((Get-Item $BuildArchive).Length / 1MB, 1)
Write-Host "      build.tar.gz ready ($sizeMB MB)"

# 2. Upload everything to /tmp (always writable)
Write-Host ""
Write-Host "[2/4] Uploading files to /tmp ..."

scp $BuildArchive "${RemoteTarget}:/tmp/build.tar.gz"
if ($LASTEXITCODE -ne 0) { throw "SCP failed: build.tar.gz" }

$phpFiles = @(
    "app/Http/Controllers/ProcurementDashboardController.php",
    "app/Http/Controllers/ReportController.php",
    "app/Http/Controllers/AssetController.php",
    "app/Http/Controllers/AssetRequestController.php",
    "app/Http/Controllers/TransferRequestController.php",
    "app/Models/User.php"
)
foreach ($f in $phpFiles) {
    $localPath = $f -replace "/", "\"
    scp $localPath "${RemoteTarget}:/tmp/$(Split-Path $f -Leaf)"
    if ($LASTEXITCODE -ne 0) { throw "SCP failed: $f" }
    Write-Host "      $f"
}

scp "routes\web.php" "${RemoteTarget}:/tmp/web.php"
if ($LASTEXITCODE -ne 0) { throw "SCP failed: routes/web.php" }
Write-Host "      routes/web.php"
Write-Host "      Upload complete."

# 3. Server-side: use docker cp to push files into container (bypasses host permissions)
#    then artisan cache refresh + nginx restart.
#    Each command is a separate SSH call to avoid CRLF corruption from PS here-strings.
Write-Host ""
Write-Host "[3/4] Installing files and refreshing caches ..."

$App = "assetlinq_app"

$serverCmds = @(
    # PHP files into container
    "docker cp /tmp/ProcurementDashboardController.php ${App}:/app/app/Http/Controllers/ProcurementDashboardController.php",
    "docker cp /tmp/ReportController.php ${App}:/app/app/Http/Controllers/ReportController.php",
    "docker cp /tmp/AssetController.php  ${App}:/app/app/Http/Controllers/AssetController.php",
    "docker cp /tmp/AssetRequestController.php ${App}:/app/app/Http/Controllers/AssetRequestController.php",
    "docker cp /tmp/TransferRequestController.php ${App}:/app/app/Http/Controllers/TransferRequestController.php",
    "docker cp /tmp/User.php             ${App}:/app/app/Models/User.php",
    "docker cp /tmp/web.php              ${App}:/app/routes/web.php",
    # Build tarball into container
    "docker cp /tmp/build.tar.gz ${App}:/tmp/build.tar.gz"
)

foreach ($cmd in $serverCmds) {
    Write-Host "      > $cmd"
    ssh $RemoteTarget $cmd
    if ($LASTEXITCODE -ne 0) { throw "Failed: $cmd" }
}

# Extract build tarball inside the container to preserve Linux paths
Write-Host "      > [extract build inside container]"
ssh $RemoteTarget "docker exec ${App} sh -c 'cd /app/public && rm -rf build && tar -xzf /tmp/build.tar.gz'"
ssh $RemoteTarget "docker exec ${App} sh -c 'rm -f /tmp/build.tar.gz'"
# Verify the manifest exists as proof of successful extraction
$verifyCmd = "docker exec ${App} test -f /app/public/build/manifest.json"
ssh $RemoteTarget $verifyCmd
if ($LASTEXITCODE -ne 0) { throw "Build extraction failed - manifest.json not found" }
Write-Host "      > build extracted and verified"

# Rebuild caches (no -T: older Docker CLI on this server does not support it)
$cacheCmds = @(
    "docker exec ${App} php artisan optimize:clear",
    "docker exec ${App} php artisan config:cache",
    "docker exec ${App} php artisan route:cache",
    "docker exec ${App} php artisan view:cache",
    "docker restart simbisa_nginx"
)
foreach ($cmd in $cacheCmds) {
    Write-Host "      > $cmd"
    ssh $RemoteTarget $cmd
    if ($LASTEXITCODE -ne 0) { throw "Failed: $cmd" }
}

# 4. Clean up local zip
Write-Host ""
Write-Host "[4/4] Cleaning up ..."
Remove-Item $BuildArchive -Force

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment complete!"
Write-Host " http://$Server"
Write-Host "========================================"


