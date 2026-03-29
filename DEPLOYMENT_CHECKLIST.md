# Pre-Deployment Checklist

## Local Machine (Windows)
- [ ] Verify all application files are in: `c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app`
- [ ] Confirm `.env.production` exists and is configured
- [ ] Test application locally with PostgreSQL
- [ ] Check Docker Desktop is running
- [ ] Verify OpenSSH Client is installed:
  ```powershell
  # Run in PowerShell
  ssh -V
  scp /help
  ```

## Remote Server (77.93.154.83)
- [ ] Server is accessible via SSH: `ssh administrator@77.93.154.83`
- [ ] Docker is installed: `docker --version`
- [ ] Docker Compose is installed: `docker-compose --version`
- [ ] PostgreSQL is running (will be started by docker-compose)
- [ ] Ports are available:
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 5432 (PostgreSQL)
  - Port 6379 (Redis)
- [ ] Sufficient disk space available

## Deployment Steps

### Step 1: Prepare Local Application
```powershell
cd c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app

# Verify .env.production exists
Get-Content .env.production

# Clean up unnecessary files
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item vendor -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 2: Test SSH Connection
```powershell
ssh administrator@77.93.154.83 "echo 'SSH Connection Successful'"
```

### Step 3: Run Automated Deployment Script
```powershell
# Run from the Laravel app directory
.\deploy.bat
```

Or manually:
```powershell
scp -r "c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app\*" administrator@77.93.154.83:/var/www/simbisa/
```

### Step 4: Connect and Complete Setup
```powershell
ssh administrator@77.93.154.83

# On the remote server
cd /var/www/simbisa
cp .env.production .env

# Generate APP_KEY (important!)
docker-compose run --rm app php artisan key:generate

# Start all services
docker-compose up -d

# Wait 15 seconds for database to initialize
Start-Sleep -Seconds 15

# Run migrations
docker-compose exec -T app php artisan migrate --force

# Cache configuration
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache
```

### Step 5: Verify Deployment
```bash
# Check container status
docker-compose ps

# Check application logs
docker-compose logs app

# Test database connection
docker-compose exec postgres psql -U postgres -d assets_erp -c "\dt"

# View Laravel logs
docker-compose exec app tail -f storage/logs/laravel.log
```

## Post-Deployment

### Access the Application
- Visit: `http://77.93.154.83`
- Test login with credentials

### Monitor Application
```bash
# Real-time logs
docker-compose logs -f app

# Database status
docker-compose exec postgres psql -U postgres -l

# Server resources
docker stats
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres assets_erp > /backups/assets_erp_$(date +%Y%m%d_%H%M%S).sql
```

### Enable HTTPS (Optional but Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d 77.93.154.83

# Update Nginx config with SSL paths
sudo nano /etc/nginx/server.conf
```

## Troubleshooting

### SSH Connection Fails
- Check password/key authentication
- Verify IP address: `ssh administrator@77.93.154.83`
- Check firewall rules on both machines

### Docker Not Found
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker administrator
```

### Database Connection Failed
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Manually test connection
docker-compose exec postgres psql -U postgres -c "\l"
```

### Permission Denied on Files
```bash
sudo chown -R www-data:www-data /var/www/simbisa
sudo chmod -R 755 /var/www/simbisa
sudo chmod -R 775 /var/www/simbisa/storage
sudo chmod -R 775 /var/www/simbisa/bootstrap/cache
```

### Application Takes Too Long to Load
- Check migrations are complete: `docker-compose logs app | grep migration`
- Monitor CPU/Memory: `docker stats`
- Check database: `docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT * FROM information_schema.tables;"`

## Support Resources

- Laravel Docs: https://laravel.com/docs
- Docker Docs: https://docs.docker.com
- PostgreSQL Docs: https://www.postgresql.org/docs
- Nginx Docs: https://nginx.org/en/docs

## Emergency Commands

### Stop Everything
```bash
docker-compose down
```

### Restart Everything
```bash
docker-compose restart
```

### Remove All Containers and Data (CAREFUL!)
```bash
docker-compose down -v
```

### Force Rebuild
```bash
docker-compose build --no-cache
docker-compose up -d
```
