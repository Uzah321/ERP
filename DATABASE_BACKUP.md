# Database Management Scripts

## Remote Database Backup Script

Save this as `backup-db.sh` on your live server:

```bash
#!/bin/bash

# Database Backup Script
# Usage: ./backup-db.sh
# Creates timestamped backups of the assets_erp database

BACKUP_DIR="/var/backups/simbisa"
DB_NAME="assets_erp"
DB_USER="postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/assets_erp_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✓ Backup created: $BACKUP_FILE"
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "assets_erp_*.sql" -mtime +7 -delete
    echo "✓ Old backups removed (older than 7 days)"
    
    # Show backup size
    ls -lh $BACKUP_FILE
else
    echo "✗ Backup failed!"
    exit 1
fi
```

## Remote Database Restore Script

```bash
#!/bin/bash

# Database Restore Script
# Usage: ./restore-db.sh <backup-file>
# Example: ./restore-db.sh assets_erp_20260328_120000.sql

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <backup-file>"
    echo "Example: ./restore-db.sh assets_erp_20260328_120000.sql"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="assets_erp"
DB_USER="postgres"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠ WARNING: This will overwrite the current database!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Drop and recreate database
docker-compose exec -T postgres psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker-compose exec -T postgres psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
docker-compose exec -T postgres psql -U $DB_USER $DB_NAME < $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✓ Database restored successfully!"
else
    echo "✗ Restore failed!"
    exit 1
fi
```

## PowerShell Backup Script (Windows)

Save this as `backup-db.ps1` on your Windows machine:

```powershell
param(
    [string]$ServerIP = "77.93.154.83",
    [string]$SSHUser = "administrator",
    [string]$BackupPath = "c:\Backups\Laravel_DB"
)

# Create local backup directory
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

Write-Host "Creating database backup..." -ForegroundColor Cyan

# Timestamp for backup file
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupPath\assets_erp_$Timestamp.sql"

# Create backup on remote server
$BackupContent = ssh $SSHUser@$ServerIP "cd /var/www/simbisa && docker-compose exec -T postgres pg_dump -U postgres assets_erp"

# Save to local file
$BackupContent | Out-File -FilePath $BackupFile -Encoding UTF8

if (Test-Path $BackupFile) {
    $FileSize = (Get-Item $BackupFile).Length / 1MB
    Write-Host "✓ Backup created: $BackupFile" -ForegroundColor Green
    Write-Host "Size: $([Math]::Round($FileSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "✗ Backup failed!" -ForegroundColor Red
}
```

## Quick Backup Commands

### On Live Server

```bash
# SSH to server
ssh administrator@77.93.154.83
cd /var/www/simbisa

# Quick backup
docker-compose exec -T postgres pg_dump -U postgres assets_erp > /tmp/backup_$(date +%s).sql

# List all databases
docker-compose exec postgres psql -U postgres -l

# Check database size
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT pg_size_pretty(pg_database_size('assets_erp'));"

# View tables
docker-compose exec postgres psql -U postgres -d assets_erp -c "\dt"

# Count records in a table
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT COUNT(*) FROM users;"
```

### From Windows PowerShell

```powershell
$ServerIP = "77.93.154.83"
$SSHUser = "administrator"

# Backup database and save locally
ssh $SSHUser@$ServerIP "cd /var/www/simbisa && docker-compose exec -T postgres pg_dump -U postgres assets_erp" > "C:\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# Check backup
Get-Item C:\backup_*.sql | Sort-Object LastWriteTime -Descending | Select-Object Name, Length, LastWriteTime
```

## Automated Daily Backups

### On Live Server (crontab)

```bash
# Edit crontab
sudo crontab -e

# Add this line to backup daily at 2 AM
0 2 * * * cd /var/www/simbisa && docker-compose exec -T postgres pg_dump -U postgres assets_erp > /var/backups/simbisa/assets_erp_$(date +\%Y\%m\%d_\%H\%M\%S).sql

# Delete backups older than 30 days
0 3 * * * find /var/backups/simbisa -name "assets_erp_*.sql" -mtime +30 -delete
```

### On Windows (Task Scheduler)

Create a PowerShell task:

```powershell
# Create backup task
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"ssh administrator@77.93.154.83 'cd /var/www/simbisa && docker-compose exec -T postgres pg_dump -U postgres assets_erp' > 'C:\Backups\assets_erp_\$(Get-Date -Format yyyyMMdd_HHmmss).sql'`""

$Trigger = New-ScheduledTaskTrigger -Daily -At 2am

Register-ScheduledTask -TaskName "DatabaseBackup" -Action $Action -Trigger $Trigger -RunLevel Highest
```

## Database Export/Import

### Export as CSV

```bash
# From live server
docker-compose exec postgres psql -U postgres -d assets_erp -c "COPY users(id, name, email) TO STDOUT WITH CSV HEADER;" > users.csv
```

### Import from CSV

```bash
# To live server
docker-compose exec -T postgres psql -U postgres -d assets_erp -c "COPY users(id, name, email) FROM STDIN WITH CSV HEADER;" < users.csv
```

## Disaster Recovery

If database is corrupted:

```bash
# 1. Stop application
docker-compose down

# 2. Rebuild containers
docker-compose build --no-cache

# 3. Start fresh
docker-compose up -d

# 4. Restore from backup
docker-compose exec postgres psql -U postgres assets_erp < /var/backups/simbisa/assets_erp_YYYYMMDD_HHMMSS.sql

# 5. Verify
docker-compose exec postgres psql -U postgres -d assets_erp -c "\dt"
```
