# Deploy latest changes to production
# Uploads to /tmp then moves with docker, works around directory ownership issues.
# Usage: .\deploy_latest.ps1

param(
    [string]$Server = "77.93.154.83",
    [string]$User   = "administrator",
    [string]$AppDir = "/var/www/simbisa",
    [string]$SshKeyPath = "$HOME\.ssh\id_ed25519",
    [switch]$SyncDatabase,
    [switch]$SkipOffsiteBackup,
    [string]$SyncTables = "departments,users,asset_requests,capex_forms,purchase_orders,goods_receipts,categories,locations,assets"
)

$ErrorActionPreference = "Stop"
$RemoteTarget = "${User}@${Server}"
$DeployArchive = "deploy_bundle.tar.gz"
$OffsiteBackupDir = Join-Path $PSScriptRoot 'backups\offsite'
$SshOptions = @(
    '-i', $SshKeyPath,
    '-o', 'IdentitiesOnly=yes',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=6'
)

function Invoke-SSH {
    param([string]$Cmd)

    & ssh @SshOptions $RemoteTarget $Cmd
    if ($LASTEXITCODE -ne 0) { throw "SSH command failed: $Cmd" }
}

function Invoke-SCP {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$FailureMessage
    )

    & scp -O @SshOptions $Source $Destination
    if ($LASTEXITCODE -ne 0) { throw $FailureMessage }
}

function Invoke-HealthCheck {
    param([string]$BaseUrl)

    Write-Host "      > GET $BaseUrl/up"
    $up = Invoke-WebRequest "$BaseUrl/up" -UseBasicParsing -TimeoutSec 30
    if ($up.StatusCode -ne 200) {
        throw "Health check failed for /up"
    }

    Write-Host "      > GET $BaseUrl/login"
    $login = Invoke-WebRequest "$BaseUrl/login" -UseBasicParsing -TimeoutSec 30
    if ($login.StatusCode -ne 200) {
        throw "Health check failed for /login"
    }

    $loginMarkers = @(
        '<div id="app" data-page="',
        '&quot;component&quot;:&quot;Auth\/Login&quot;',
        '&quot;url&quot;:&quot;\/login&quot;'
    )

    foreach ($marker in $loginMarkers) {
        if ($login.Content -notmatch [regex]::Escape($marker)) {
            throw "Login page rendered unexpectedly; missing marker: $marker"
        }
    }
}

function Invoke-DatabaseSync {
    param([string]$Tables)

    Write-Host "      > Syncing local pgsql to live pgsql_live"
    & php ".\sync_sqlite_to_pgsql.php" sync pgsql pgsql_live $Tables --force-live-sync
    if ($LASTEXITCODE -ne 0) {
        throw "Database sync failed"
    }
}

function Invoke-LocalPhpLint {
    Write-Host "      > Validating PHP syntax before packaging"

    $phpFiles = Get-ChildItem -Path ".\app", ".\bootstrap", ".\config", ".\database", ".\routes" -Filter "*.php" -Recurse -File

    foreach ($file in $phpFiles) {
        & php -l $file.FullName | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "PHP syntax validation failed: $($file.FullName)"
        }
    }
}

function New-OffsiteDatabaseBackup {
    New-Item -ItemType Directory -Force -Path $OffsiteBackupDir | Out-Null

    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupPath = Join-Path $OffsiteBackupDir "assets_erp_live_${timestamp}.sql"
    $remoteCommand = "cd ${AppDir}; DB_NAME=`$(grep '^DB_DATABASE=' .env | cut -d= -f2-); docker-compose exec -T postgres pg_dump -U postgres `"`$DB_NAME`""

    Write-Host "      > Creating off-server database backup $backupPath"
    & ssh @SshOptions $RemoteTarget $remoteCommand > $backupPath
    if ($LASTEXITCODE -ne 0) {
        if (Test-Path $backupPath) { Remove-Item $backupPath -Force }
        throw "Off-server backup failed"
    }

    $backupFile = Get-Item $backupPath
    if ($backupFile.Length -lt 1024) {
        throw "Off-server backup looks too small: $($backupFile.Length) bytes"
    }

    Write-Host "      Off-server backup ready ($([math]::Round($backupFile.Length / 1KB, 1)) KB)"
}

function Test-FrontendBuildArtifacts {
    $manifestPath = Join-Path $PSScriptRoot 'public\build\manifest.json'

    if (-not (Test-Path $manifestPath)) {
        throw "Frontend build artifact missing: public/build/manifest.json. Run npm run build before deploying."
    }
}

Set-Location $PSScriptRoot

Write-Host "========================================"
Write-Host " AssetLinq - Deploy Latest Changes"
Write-Host "========================================"

Write-Host ""
Write-Host "[0/5] Validating PHP files ..."
Invoke-LocalPhpLint
Test-FrontendBuildArtifacts

if (-not $SkipOffsiteBackup) {
    Write-Host ""
    Write-Host "[0.5/5] Creating off-server database backup ..."
    New-OffsiteDatabaseBackup
}

Write-Host ""
Write-Host "[1/4] Packaging deployment bundle ..."
if (Test-Path $DeployArchive) { Remove-Item $DeployArchive -Force }

tar -czf $DeployArchive `
    --exclude=.git `
    --exclude=vendor `
    --exclude=node_modules `
    --exclude=bootstrap/cache/*.php `
    --exclude=resources/js `
    --exclude=tests `
    --exclude=.env `
    --exclude=.env.local `
    --exclude=.env.example `
    --exclude=.env.docker `
    --exclude=.env.testing `
    --exclude=public/hot `
    --exclude=storage/logs/*.log `
    --exclude=storage/framework/cache/data/* `
    --exclude=storage/framework/sessions/* `
    --exclude=storage/framework/views/* `
    --exclude=storage/app/public/capex-quotations/* `
    --exclude=storage/app/public/asset-photos/* `
    --exclude=*.bat `
    --exclude=*.log `
    --exclude=*.txt `
    --exclude=check_*.php `
    --exclude=fix_*.php `
    --exclude=create_*.php `
    --exclude=get_*.php `
    --exclude=test_*.php `
    --exclude=debug_*.php `
    --exclude=update_*.php `
    --exclude=list_*.php `
    --exclude=render.out `
    --exclude=run_deploy.sh `
    --exclude=deploy_bundle.tar.gz `
    --exclude=public/build.tar.gz `
    .
if ($LASTEXITCODE -ne 0) { throw "Failed to package deployment bundle" }

$sizeMB = [math]::Round((Get-Item $DeployArchive).Length / 1MB, 1)
Write-Host "      deploy_bundle.tar.gz ready ($sizeMB MB)"

Write-Host ""
Write-Host "[2/4] Uploading bundle to server ..."
Invoke-SCP "deploy.sh" "${RemoteTarget}:${AppDir}/deploy.sh" "SCP failed: deploy.sh"

Invoke-SCP $DeployArchive "${RemoteTarget}:${AppDir}/deploy_bundle.tar.gz" "SCP failed: deploy bundle"
Write-Host "      Upload complete."

Write-Host ""
Write-Host "[3/5] Running server deployment ..."
Invoke-SSH "cd ${AppDir} && bash deploy.sh"

Write-Host ""
Write-Host "[4/5] Syncing deployment data ..."
if ($SyncDatabase) {
    Write-Warning "Live database sync is enabled. This can overwrite production data."
    Invoke-DatabaseSync $SyncTables
} else {
    Write-Host "      Database sync skipped."
}

Write-Host ""
Write-Host "[5/5] Running post-deploy health checks ..."
Invoke-HealthCheck "http://$Server"

if (Test-Path $DeployArchive) { Remove-Item $DeployArchive -Force }

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment complete!"
Write-Host " http://$Server"
if ($SyncDatabase) {
    Write-Host " Database sync completed"
} else {
    Write-Host " Database sync skipped"
}
Write-Host " Login smoke checks passed"
Write-Host "========================================"


