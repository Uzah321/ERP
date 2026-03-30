#!/bin/bash

# Deployment Script for Laravel Application to Live Server
# Server: 77.93.154.83

set -e

echo "================================"
echo "Starting Deployment to Live Server"
echo "================================"

# 1. Navigate to application directory
cd /var/www/simbisa

# 2. Pull latest code
echo "Pulling latest code..."
git pull origin main 2>/dev/null || echo "Git not initialized, skipping pull"

# 3. Ensure production environment exists but never overwrite the live file
echo "Checking environment..."
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
    else
        echo "ERROR: .env is missing and .env.production is not available."
        exit 1
    fi
fi

# 4. Refuse destructive APP_KEY regeneration during deploy
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "ERROR: APP_KEY is missing in .env. Refusing to generate a new key during deployment."
    exit 1
fi

# 5. Pull latest images
echo "Pulling Docker images..."
docker-compose pull

# 6. Build and start containers without tearing down named volumes
echo "Building and starting containers..."
docker-compose up -d --build --remove-orphans

# 8. Wait for database to be ready
echo "Waiting for database..."
sleep 10

# 9. Run migrations
echo "Running migrations..."
docker-compose exec -T app php artisan migrate --force

# 10. Clear and cache configuration
echo "Caching configuration..."
docker-compose exec -T app php artisan optimize:clear
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache

# 11. Set permissions
echo "Setting permissions..."
docker-compose exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo "Application is now running at http://77.93.154.83"
echo "Check status with: docker-compose ps"
