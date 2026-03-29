# 🚀 Quick Start Guide - Deploy to Live Server

**Server:** 77.93.154.83  
**SSH User:** administrator  
**Database:** PostgreSQL (assets_erp)

---

## ⚡ 5-Minute Quick Deploy

### Step 1: Open PowerShell
```powershell
cd c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app
```

### Step 2: Run Deployment Script
```powershell
# Give permission to run script
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run deployment
.\deploy.ps1
```

**That's it!** The script will:
- ✅ Connect to your server
- ✅ Upload all files
- ✅ Configure environment
- ✅ Start Docker containers
- ✅ Run database migrations
- ✅ Set up caching

---

## 🔐 Prerequisites

Before running deployment, ensure you have:

### 1. SSH Access to Server
Test this first:
```powershell
ssh administrator@77.93.154.83 "echo 'Hello'"
```

If this fails:
- Check you can ping the server: `ping 77.93.154.83`
- Verify SSH is running on server
- Check firewall port 22 is open
- Verify credentials (username/password or SSH key)

### 2. OpenSSH Client on Windows
Check if installed:
```powershell
ssh -V
```

If not installed:
- **Windows 10/11 Pro:** Settings → Apps → Optional Features → Add: OpenSSH Client
- **Alternative:** Install [Git Bash](https://git-scm.com/download/win)

### 3. Application Files Ready
```powershell
# Verify these files exist:
Get-ChildItem -Path "c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app" | Select-Object Name
```

Should include: `Dockerfile`, `docker-compose.yml`, `.env.production`, etc.

---

## 📋 Manual Step-by-Step (if script fails)

### Step 1: Create Remote Directory
```powershell
ssh administrator@77.93.154.83 "mkdir -p /var/www/simbisa"
```

### Step 2: Upload Files
```powershell
scp -r "c:\Users\dingulwazi.zondo\Desktop\LARAVEL\first-app\*" administrator@77.93.154.83:/var/www/simbisa/
```

*This takes 2-5 minutes depending on internet speed*

### Step 3: Configure and Start
```powershell
ssh administrator@77.93.154.83 << 'EOF'
cd /var/www/simbisa
cp .env.production .env
docker-compose run --rm app php artisan key:generate
docker-compose up -d --build
sleep 15
docker-compose exec -T app php artisan migrate --force
docker-compose exec -T app php artisan config:cache
EOF
```

---

## ✨ Verify Deployment Success

```powershell
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose ps"
```

You should see:
```
NAME                COMMAND             STATUS
simbisa_postgres    postgres...         Up (healthy)
simbisa_redis       redis-server...     Up (healthy)  
simbisa_app         php-fpm...          Up
```

All containers should be **Up**!

---

## 🌐 Access Your Application

Visit: **http://77.93.154.83**

Login with your credentials (the ones you set up locally).

---

## 🔧 Troubleshooting

### SCP: Permission Denied
```powershell
# SSH with password authentication
ssh -o PreferredAuthentications=password administrator@77.93.154.83
```

### Docker: Command Not Found
```bash
# SSH to server and install
ssh administrator@77.93.154.83
apt-get update
apt-get install -y docker.io docker-compose
```

### Database Won't Connect
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d assets_erp -c "\dt"
```

### Application Shows Error 500
```bash
# View logs
docker-compose logs -f app

# Check migrations ran
docker-compose exec app php artisan migrate:status
```

---

## 📊 Monitor Your Application

### Check Status
```bash
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose ps"
```

### View Live Logs
```bash
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose logs -f app"
```

### Restart Services
```bash
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose restart"
```

### Stop Everything
```bash
ssh administrator@77.93.154.83 "cd /var/www/simbisa && docker-compose down"
```

---

## 🆘 Need Help?

Check the detailed guides:
- **DEPLOYMENT.md** - Complete deployment documentation
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment checklist
- **deploy.sh** - Bash script (for Linux/Mac)

---

## 🚨 Important Notes

1. **APP_KEY** is auto-generated during deployment - this is critical!
2. **Database credentials** are in `.env.production` - keep them secure
3. **First login** may be slow - it's running migrations
4. **Logs** are in `storage/logs/laravel.log` on the server
5. **Use HTTPS** - consider adding SSL certificate after basic deployment

---

## 📞 Deployment Support

If you encounter issues:

1. Check server access:
   ```powershell
   ssh administrator@77.93.154.83
   docker --version
   docker-compose --version
   ```

2. View application logs:
   ```bash
   docker-compose logs app | tail -100
   ```

3. Check database:
   ```bash
   docker-compose exec postgres psql -U postgres -l
   ```

4. Rebuild everything:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

**Good luck with your deployment! 🚀**
