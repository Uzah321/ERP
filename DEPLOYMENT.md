# Deployment Guide to Live Server

## Server Details
- **IP Address:** 77.93.154.83
- **SSH User:** administrator
- **Deployment Method:** Docker (docker-compose)

## Prerequisites on Live Server
Before deploying, ensure the server has:
1. Docker installed
2. Docker Compose installed
3. Git installed (optional, for auto-updates)
4. Ports 80, 443 available for web traffic
5. Port 5432 available for PostgreSQL

## Step-by-Step Deployment

### 1. Connect via SSH
```bash
ssh administrator@77.93.154.83
```

### 2. Create Application Directory
```bash
sudo mkdir -p /var/www/simbisa
sudo chown administrator:administrator /var/www/simbisa
cd /var/www/simbisa
```

### 3. Upload Application Files
Option A: Using Git (if repository is available)
```bash
git clone <your-repo-url> .
```

Option B: Using SCP (from your local machine)
```bash
scp -r c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app/* administrator@77.93.154.83:/var/www/simbisa/
```

### 4. Set Up Environment
```bash
cd /var/www/simbisa
cp .env.production .env
```

### 5. Create Database (if not already created)
```bash
# Connect to your database server at 77.93.154.83
psql -h 77.93.154.83 -U postgres -c "CREATE DATABASE assets_erp;"
```

Or run this on the server:
```bash
sudo docker-compose up -d postgres
sudo docker-compose exec postgres psql -U postgres -c "CREATE DATABASE assets_erp;"
```

### 6. Build and Start Docker Containers
```bash
sudo docker-compose up -d --build
```

### 7. Verify APP_KEY
```bash
grep '^APP_KEY=base64:' .env
```

If this command does not print a base64 key, stop and fix `.env.production` before deploying.

### 8. Configure Web Server (Nginx/Apache)
Update your web server to proxy to the Docker container or configure the port forwarding.

### 9. Run Migrations
```bash
sudo docker-compose exec app php artisan migrate --force
```

### 10. Cache Configuration
```bash
sudo docker-compose exec app php artisan optimize:clear
sudo docker-compose exec app php artisan config:cache
sudo docker-compose exec app php artisan route:cache
sudo docker-compose exec app php artisan view:cache
```

## Using the Automated Deployment Script

If you've copied the `deploy.sh` file to the server:

```bash
cd /var/www/simbisa
chmod +x deploy.sh
sudo ./deploy.sh
```

## Common Commands

### Check container status
```bash
sudo docker-compose ps
```

### View logs
```bash
sudo docker-compose logs -f app
```

### Access the application shell
```bash
sudo docker-compose exec app php artisan tinker
```

### Database backup
```bash
sudo docker-compose exec postgres pg_dump -U postgres assets_erp > backup.sql
```

### Stop all containers
```bash
sudo docker-compose down
```

### Restart all containers
```bash
sudo docker-compose restart
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `docker-compose ps`
- Check DB credentials in `.env`
- Ensure port 5432 is accessible

### Permission Errors
```bash
sudo docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Container Won't Start
```bash
sudo docker-compose logs
```

## Post-Deployment

1. **Test the application** by visiting http://77.93.154.83
2. **Check login** with test credentials
3. **Monitor logs** for any errors
4. **Backup database** regularly
5. **Enable SSL/HTTPS** using Let's Encrypt with Certbot

## Support

For issues, check:
- Application logs: `storage/logs/laravel.log`
- Docker logs: `docker-compose logs`
- Database status: `docker-compose exec postgres psql -U postgres -l`
