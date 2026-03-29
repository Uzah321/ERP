# Production Readiness & Monitoring Guide

---

## 🔒 Pre-Deployment Security Checklist

### Environment Configuration
- [ ] `.env.production` is configured with production values
- [ ] `APP_DEBUG=false` in production (prevents sensitive info exposure)
- [ ] `APP_ENV=production`
- [ ] Strong `APP_KEY` is generated
- [ ] Database credentials are secure and unique

### Database Security
- [ ] Change default PostgreSQL password from `postgres` to something strong
- [ ] Database user `postgres` has strong password (20+ characters)
- [ ] Database backups are configured
- [ ] Backup files are stored securely
- [ ] Database connection is tested from application
- [ ] Only application containers can connect to database

### Application Security
- [ ] All default users are deleted/changed
- [ ] CSRF tokens enabled (should be by default)
- [ ] Session timeout is configured appropriately
- [ ] Password hashing algorithm is set to bcrypt
- [ ] No sensitive files are in the upload directory
- [ ] `.env` file is not accessible via web
- [ ] Secrets are not in version control

### Server Security
- [ ] SSH key authentication is set up (instead of password)
- [ ] Firewall rules restrict access (Port 80/443 only for web)
- [ ] SSH port changed from default (optional but recommended)
- [ ] Regular security updates are scheduled
- [ ] Intrusion detection is configured (optional)

### Application Logging
- [ ] `LOG_LEVEL` is set to `warning` or `error` (not `debug`)
- [ ] Log rotation is configured
- [ ] Logs are stored securely (non-public directory)
- [ ] Old logs are archived or deleted

---

## 📊 Monitoring Setup

### 1. Application Status Monitor

**PowerShell Script** - `monitor.ps1`:

```powershell
param(
    [string]$ServerIP = "77.93.154.83",
    [string]$SSHUser = "administrator"
)

while ($true) {
    Clear-Host
    
    Write-Host "=== Application Monitor ===" -ForegroundColor Cyan
    Write-Host "Updated: $(Get-Date)" -ForegroundColor Gray
    Write-Host ""
    
    # Container status
    Write-Host "Container Status:" -ForegroundColor Yellow
    ssh $SSHUser@$ServerIP "cd /var/www/simbisa && docker-compose ps" | Write-Host
    
    # System stats
    Write-Host "`nSystem Stats:" -ForegroundColor Yellow
    ssh $SSHUser@$ServerIP "free -h && echo '---' && df -h /" | Write-Host
    
    # Database check
    Write-Host "`nDatabase Status:" -ForegroundColor Yellow
    ssh $SSHUser@$ServerIP "cd /var/www/simbisa && docker-compose exec -T postgres psql -U postgres -c 'SELECT NOW();'" | Write-Host
    
    Write-Host "`nRefreshing in 30 seconds (Ctrl+C to stop)..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
}
```

### 2. Log Monitoring

```powershell
# Real-time log monitoring
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose logs -f app --tail=50"

# Check for errors in the last hour
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose logs app --since 1h | grep -i error"

# Export logs
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose logs app > logs_$(date +%s).txt" > "c:\logs_export.txt"
```

### 3. Database Monitoring

```bash
# SSH to server
ssh administrator@77.93.154.83
cd /var/www/simbisa

# Check active connections
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT count(*) FROM pg_stat_activity;"

# Table sizes
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('assets_erp'));"

# Slow queries (if log_statement configured)
docker-compose exec postgres psql -U postgres -d assets_erp -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 📈 Performance Optimization

### 1. Enable Query Caching

Update `.env.production`:
```
CACHE_STORE=redis
CACHE_DRIVER=redis
```

### 2. Optimize Database

Connect to PostgreSQL:
```bash
docker-compose exec postgres psql -U postgres -d assets_erp

# Run ANALYZE to update statistics
ANALYZE;

# Check index bloat
SELECT schemaname, tablename, indexname, idx_blks_read, idx_blks_hit
FROM pg_stat_user_indexes
ORDER BY idx_blks_read DESC;
```

### 3. Enable Database Connection Pooling

Add to `docker-compose.yml`:
```yaml
services:
  pgbouncer:
    image: edoburu/pgbouncer
    container_name: assets_pgbouncer
    environment:
      DATABASE_URL: "postgres://postgres:postgres@postgres:5432/assets_erp"
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
    ports:
      - "6432:6432"
    depends_on:
      - postgres
    networks:
      - app-network
```

### 4. Redis Optimization

```bash
# Check Redis memory
docker-compose exec redis redis-cli INFO memory

# Monitor Redis commands
docker-compose exec redis redis-cli MONITOR

# Clear old sessions
docker-compose exec redis redis-cli FLUSHDB
```

---

## 🛡️ Backup & Disaster Recovery

### Automated Backups

Create daily backup script:

```bash
# On live server, create: /var/www/simbisa/backup.sh

#!/bin/bash
BACKUP_DIR="/var/backups/simbisa"
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U postgres assets_erp | gzip > "$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz"

# Keep only 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed at $(date)" >> /var/log/backup.log
```

Add to crontab:
```bash
sudo crontab -e
0 2 * * * /var/www/simbisa/backup.sh
```

### Test Restore Procedure

Monthly test:
```bash
# List available backups
ls -lh /var/backups/simbisa/

# Restore to test database
docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE assets_erp_test;"
gunzip < /var/backups/simbisa/db_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T postgres psql -U postgres -d assets_erp_test

# If successful, delete test database
docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE assets_erp_test;"
```

---

## 🚨 Alert Configuration

### Email Alerts on Container Failure

Install monitoring tool:
```bash
# Option 1: Using email notifications
sudo apt-get install curl

# Create alert script
#!/bin/bash
if ! docker-compose ps | grep -q "simbisa_app.*Up"; then
    echo "Application container is down!" | mail -s "Alert: App Container Failed" admin@example.com
    docker-compose restart app
fi

# Add to crontab every 5 minutes
*/5 * * * * /var/www/simbisa/check-health.sh
```

### CPU/Memory Alerts

```bash
#!/bin/bash
# Check if memory usage exceeds 80%
MEMORY=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100)}')
if [ "$MEMORY" -gt 80 ]; then
    echo "High memory usage: ${MEMORY}%" | mail -s "Alert: High Memory" admin@example.com
fi
```

---

## 📋 Maintenance Tasks

### Weekly Tasks
- [ ] Review error logs: `docker-compose logs app | grep -i error`
- [ ] Check disk space: `df -h`
- [ ] Verify database backups exist: `ls -lh /var/backups/simbisa/`
- [ ] Monitor application performance

### Monthly Tasks
- [ ] Update system packages: `sudo apt-get update && apt-get upgrade`
- [ ] Update Docker images: `docker-compose pull && docker-compose up -d`
- [ ] Analyze database: `ANALYZE;`
- [ ] Review user accounts and permissions
- [ ] Test backup restoration procedure

### Quarterly Tasks
- [ ] Security audit and penetration testing
- [ ] Review and update security policies
- [ ] Update SSL certificates (if using HTTPS)
- [ ] Database optimization and cleanup
- [ ] Review logs for suspicious activity

---

## 🔍 Troubleshooting Checklist

When experiencing issues:

### Application Slow
```bash
# Check logs for errors
docker-compose logs app | tail -100

# Check database performance
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT * FROM pg_stat_activity;"

# Check Redis
docker-compose exec redis redis-cli INFO

# Restart containers
docker-compose restart
```

### Database Connection Issues
```bash
# Test connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo()

# Check database status
docker-compose logs postgres | tail -50

# Verify credentials
echo "SELECT version();" | docker-compose exec postgres psql -U postgres
```

### Out of Disk Space
```bash
# Check disk usage
du -sh /var/www/simbisa/*

# Clean Docker
docker system prune -a

# Clean log files
docker-compose exec app sh -c 'find storage/logs -type f -delete'

# Clean old backups
find /var/backups/simbisa -mtime +30 -delete
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose down
docker-compose up -d
```

---

## 📞 Support Contacts

- Server Support: Contact your hosting provider
- Docker Issues: Docker Docs (https://docs.docker.com)
- PostgreSQL Issues: PostgreSQL Docs (https://www.postgresql.org/docs)
- Laravel Issues: Laravel Docs (https://laravel.com/docs)

---

**Last Updated:** March 28, 2026
