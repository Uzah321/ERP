# Manual Deployment Guide - Complete Steps

Your application files have been uploaded to your server. Now follow these steps manually:

## Step 1: Connect via SSH
```powershell
ssh administrator@77.93.154.83
```

## Step 2: Create Application Directory
```bash
# On the remote server, run:
sudo mkdir -p /var/www/simbisa
sudo chown $USER:$USER /var/www/simbisa
```

## Step 3: Move Upload Files
```bash
# Check if files are uploaded
ls -la ~/

# If simbisa_app directory exists:
cp -r ~/simbisa_app/* /var/www/simbisa/
cp -r ~/simbisa_app/.env* /var/www/simbisa/ 2>/dev/null

# If files are directly in home:
cp -r ~/*.* /var/www/simbisa/ 2>/dev/null || true
cp -r ~/Dockerfile /var/www/simbisa/
cp -r ~/docker-compose.yml /var/www/simbisa/
```

## Step 4: Navigate to App Directory
```bash
cd /var/www/simbisa
ls -la
# Should show: Dockerfile, docker-compose.yml, .env.production, etc.
```

## Step 5: Setup Environment
```bash
cp .env.production .env
cat .env | head -5  # Verify it worked
```

## Step 6: Start Docker
```bash
# Check Docker is installed
docker --version
docker-compose --version

# Pull latest images
docker-compose pull

# Build and start containers
docker-compose up -d --build

# Wait for services to be ready
sleep 30

# Check status
docker-compose ps
```

All containers should show **Up** status.

## Step 7: Verify Laravel APP_KEY
```bash
grep '^APP_KEY=base64:' .env
```

You should see your existing base64 application key. If not, stop and fix `.env.production` before continuing.

## Step 8: Run Database Migrations
```bash
docker-compose exec -T app php artisan migrate --force
```

Wait for migrations to complete.

## Step 9: Cache Configuration
```bash
docker-compose exec -T app php artisan optimize:clear
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache
```

## Step 10: Set Permissions
```bash
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache
```

## Step 11: Verify Deployment
```bash
# Check all containers
docker-compose ps

#Check logs
docker-compose logs app | tail -50

# Test database
docker-compose exec postgres psql -U postgres -d assets_erp -c "\dt"
```

## Step 12: Exit SSH
```bash
exit
```

## Step 13: Test Application
**From your Windows machine:**
```powershell
# Test if application is responding
Invoke-WebRequest http://77.93.154.83

# Or open in browser:
Start-Process http://77.93.154.83
```

---

## ✅ Success Indicators

After deployment, you should see:

1. **Containers Running:**
   ```
   CONTAINER ID   IMAGE           STATUS
   ...            postgres...     Up 20 seconds
   ...            redis...        Up 20 seconds
   ...            app...          Up 10 seconds
   ```

2. **No errors in logs:**
   ```
   Application key [base64:...] set successfully.
   Migration table created successfully.
   Migrating:  ... Migration Name ...
   ```

3. **Web access works:**
   ```
   http://77.93.154.83 returns HTML page
   ```

4. **Database is accessible:**
   ```
   Database "assets_erp" is up and running
   Connection to postgres successful
   ```

---

## 🚨 Troubleshooting During Deployment

### Docker Not Found
```bash
apt-get update
apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in
```

### Permission Denied Errors
```bash
sudo chown -R $USER:$USER /var/www/simbisa
sudo chmod -R 755 /var/www/simbisa
```

### Database Connection Failed
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test directly
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Check if port 5432 is open
netstat -tlnp | grep 5432
```

### Application Shows Error 500
```bash
# View full error
docker-compose logs app | tail -100 | grep -i error

# Check if migrations ran
docker-compose exec -T app php artisan migrate:status

# Force run migrations
docker-compose exec -T app php artisan migrate --force
```

### OutOf Memory
```bash
# Check system resources
free -h
df -h /

# Check container memory
docker stats --no-stream
```

### Container Exits Immediately
```bash
# Check logs for errors
docker-compose logs app

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Useful Commands to Check Status

```bash
# Everything
docker-compose ps
docker-compose logs -f app

# Just database
docker-compose exec postgres psql -U postgres -l

# Database statistics
docker-compose exec postgres psql -U postgres -d assets_erp -c "SELECT COUNT(*) FROM users;"

# Laravel status
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo()
>>> exit()

# Check file permissions
ls -l /var/www/simbisa/storage/logs/

# Disk space
df -h /var/www/simbisa

# Memory and CPU
docker stats
```

---

## After Successful Deployment

1. **Access Application:**
   - URL: http://77.93.154.83
   - Login with your credentials

2. **Monitor:**
   ```bash
   docker-compose logs -f app
   ```

3. **Backup Database:**
   ```bash
   docker-compose exec -T postgres pg_dump -U postgres assets_erp > ~/backup_$(date +%Y%m%d_%H%M%S).sql
   ```

4. **Enable HTTPS (Optional):**
   ```bash
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d 77.93.154.83
   ```

5. **Schedule automatic backups** (see DATABASE_BACKUP.md)

---

## Need Help?

If you get stuck:
1. Check `docker-compose logs app` for error messages
2. Review `PRODUCTION_MONITORING.md` for troubleshooting
3. Check `DATABASE_BACKUP.md` for database issues
4. Review `DEPLOYMENT.md` for detailed explanations

---

**Good luck! The app should be live at http://77.93.154.83 once complete! 🚀**
