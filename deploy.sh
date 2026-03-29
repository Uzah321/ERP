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

# 3. Copy production .env file
echo "Setting up environment..."
cp .env.production .env

# 4. Generate APP_KEY if not set
if ! grep -q "APP_KEY=base64:" .env; then
    echo "Generating APP_KEY..."
    docker-compose run --rm app php artisan key:generate
fi

# 5. Pull latest images
echo "Pulling Docker images..."
docker-compose pull

# 6. Build images
echo "Building Docker images..."
docker-compose build --no-cache

# 7. Start containers
echo "Starting containers..."
docker-compose up -d

# 8. Wait for database to be ready
echo "Waiting for database..."
sleep 10

# 9. Run migrations
echo "Running migrations..."
docker-compose exec -T app php artisan migrate --force

# 10. Clear and cache configuration
echo "Caching configuration..."
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
