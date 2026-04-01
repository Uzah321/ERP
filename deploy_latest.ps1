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
$DeployArchive = "deploy_bundle.tar.gz"

function Invoke-SSH {
    param([string]$Cmd)
    ssh $RemoteTarget $Cmd
    if ($LASTEXITCODE -ne 0) { throw "SSH command failed: $Cmd" }
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

    if ($login.Content -notmatch 'name="email"' -or $login.Content -notmatch 'name="password"') {
        throw "Login page rendered unexpectedly; email/password fields not found"
    }
}

Set-Location $PSScriptRoot

Write-Host "========================================"
Write-Host " AssetLinq - Deploy Latest Changes"
Write-Host "========================================"

Write-Host ""
Write-Host "[1/4] Packaging deployment bundle ..."
if (Test-Path $DeployArchive) { Remove-Item $DeployArchive -Force }

tar -czf $DeployArchive `
    --exclude=.git `
    --exclude=vendor `
    --exclude=node_modules `
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
scp $DeployArchive "${RemoteTarget}:${AppDir}/deploy_bundle.tar.gz"
if ($LASTEXITCODE -ne 0) { throw "SCP failed: deploy bundle" }
Write-Host "      Upload complete."

Write-Host ""
Write-Host "[3/4] Running server deployment ..."
Invoke-SSH "cd ${AppDir} && bash deploy.sh"

Write-Host ""
Write-Host "[4/4] Running post-deploy health checks ..."
Invoke-HealthCheck "http://$Server"

if (Test-Path $DeployArchive) { Remove-Item $DeployArchive -Force }

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment complete!"
Write-Host " http://$Server"
Write-Host " Login smoke checks passed"
Write-Host "========================================"


