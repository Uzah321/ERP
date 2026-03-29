# Docker & Deployment Guide for Simbisa Asset Management

## Overview

This guide covers dockerization and deployment of the Simbisa Asset Management system using Docker Compose locally and preparing for production deployment.

## Local Development with Docker

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 4GB free RAM allocated to Docker

### Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.docker .env
   ```

2. **Generate APP_KEY:**
   ```bash
   docker compose run --rm app php artisan key:generate
   ```

3. **Start the services:**
   ```bash
   docker compose up -d
   ```

4. **Verify services are running:**
   ```bash
   docker compose ps
   ```

5. **View logs:**
   ```bash
   docker compose logs -f app
   ```

6. **Access the application:**
   - Web: `http://localhost:80`
   - PostgreSQL: `localhost:5432` (user: `postgres`, password: `secret`)
   - Redis: `localhost:6379`

### Common Docker Commands

```bash
# View logs
docker compose logs -f app              # Application logs
docker compose logs -f nginx            # Web server logs
docker compose logs -f postgres         # Database logs

# Execute artisan commands
docker compose exec app php artisan migrate
docker compose exec app php artisan tinker
docker compose exec app php artisan queue:work

# Open bash shell
docker compose exec app bash

# Stop services
docker compose down

# Rebuild images (after changing Dockerfile)
docker compose up -d --build

# Reset database (careful!)
docker compose exec app php artisan migrate:fresh --seed

# View service health
docker compose ps
```

### Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services:
docker ps
docker stop <container_id>
```

**Database connection errors:**
```bash
docker compose exec postgres psql -U postgres -d simbisa
```

**Redis connection issues:**
```bash
docker compose exec redis redis-cli ping
```

**Permission issues with storage:**
```bash
docker compose exec app chmod -R 775 storage bootstrap/cache
```

---

## Production Deployment

### Option 1: AWS EC2 / VPS (Docker Compose)

#### Setup Server

1. **SSH into your server:**
   ```bash
   ssh -i your-key.pem ubuntu@your-server-ip
   ```

2. **Install Docker:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   chmod +x get-docker.sh
   ./get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Install nginx-certbot for SSL:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

#### Deploy Application

1. **Clone repository:**
   ```bash
   git clone <your-repo-url> /opt/simbisa
   cd /opt/simbisa
   ```

2. **Create production environment file:**
   ```bash
   nano .env.production
   ```

   **Example .env.production:**
   ```
   APP_NAME="Simbisa Asset Management"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   
   DB_HOST=postgres
   DB_DATABASE=simbisa_prod
   DB_USERNAME=postgres
   DB_PASSWORD=<STRONG_PASSWORD>
   
   REDIS_HOST=redis
   REDIS_PASSWORD=<STRONG_PASSWORD>
   
   MAIL_MAILER=smtp
   MAIL_HOST=<YOUR_SMTP_HOST>
   MAIL_PORT=587
   MAIL_USERNAME=<YOUR_EMAIL>
   MAIL_PASSWORD=<YOUR_PASSWORD>
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

3. **Copy environment to .env:**
   ```bash
   cp .env.production .env
   ```

4. **Start services:**
   ```bash
   docker compose up -d
   ```

5. **Setup SSL with Certbot:**
   ```bash
   # Update nginx config to serve from /var/www/html instead
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   
   # Update .docker/nginx/conf.d/default.conf to use SSL
   ```

#### Update Nginx for SSL

Update `.docker/nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of your config
}
```

Then rebuild:
```bash
docker compose down
docker compose up -d --build
```

### Option 2: Kubernetes (Production Grade)

For large-scale deployments, consider using Kubernetes. You can use the provided Dockerfile with:

- **Helm** for package management
- **ArgoCD** for GitOps deployments
- **Prometheus** for monitoring
- **ELK Stack** for logging

### Option 3: Docker Swarm

For multi-server setups:

```bash
docker swarm init
docker stack deploy -c docker-compose.yml simbisa
```

---

## Backup & Maintenance

### Database Backups

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U postgres simbisa > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
cat backup_20260328.sql | docker compose exec -T postgres psql -U postgres simbisa
```

### Regular Tasks

**Setup a cron job in .docker/entrypoint.sh or via supervisor:**

```bash
# Inside container
php artisan schedule:work

# Outside (runs once daily at 2 AM)
0 2 * * * docker compose exec app php artisan schedule:run
```

### Monitoring

```bash
# Check disk usage
docker compose exec app df -h

# Check PostgreSQL size
docker compose exec postgres psql -U postgres -d simbisa -c "SELECT pg_size_pretty(pg_database_size('simbisa'));"

# View error logs
docker compose logs --tail 100 app | grep -i error
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose up -d --build

# Run migrations
docker compose exec app php artisan migrate

# Clear caches
docker compose exec app php artisan cache:clear
```

---

## Security Considerations

- ✅ Use strong database passwords
- ✅ Enable HTTPS/SSL in production
- ✅ Use environment variables for secrets (never commit .env)
- ✅ Regular database backups
- ✅ Keep Docker images updated
- ✅ Use private container registries for custom images
- ✅ Set resource limits in docker-compose.yml
- ✅ Regular security patching

### Add Resource Limits (docker-compose.yml)

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## Performance Tuning

### PostgreSQL
- Increase `shared_buffers`, `effective_cache_size`, `work_mem`
- Use connection pooling (PgBouncer)

### Redis
- Monitor memory usage
- Set appropriate `maxmemory-policy`

### Nginx
- Adjust worker processes and connections
- Enable caching headers

### PHP-FPM
- Tune process pool settings in `.docker/php/php-fpm.conf`
- Increase `pm.max_children` for high traffic

---

## Rollback Procedure

```bash
# Keep previous version running
docker compose stop app
git checkout previous-commit
docker compose build --no-cache
docker compose up -d
```

---

## Support & Documentation

- Docker: https://docs.docker.com/
- Laravel: https://laravel.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Nginx: https://nginx.org/en/docs/
