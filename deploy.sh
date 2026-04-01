#!/bin/bash

# Deployment Script for Laravel Application to Live Server
# Server: 77.93.154.83

set -e

DEPLOY_ARCHIVE="deploy_bundle.tar.gz"

echo "================================"
echo "Starting Deployment to Live Server"
echo "================================"

# 1. Navigate to application directory
cd /var/www/simbisa

# 2. Extract uploaded lean deployment archive through the app service.
#    The project directory is bind-mounted into /app, so unpacking inside the
#    container avoids host-level ownership issues on the live server.
if [ -f "$DEPLOY_ARCHIVE" ]; then
    echo "Extracting lean deployment archive through app service..."

    if [ -z "$(docker-compose ps -q app)" ]; then
        docker-compose up -d app
    fi

    docker-compose exec -T -u root app sh -lc "cd /app && tar --overwrite --no-same-owner --no-same-permissions --warning=no-unknown-keyword -xzf $DEPLOY_ARCHIVE && rm -f $DEPLOY_ARCHIVE"
fi

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

echo "Removing stale containers to avoid legacy docker-compose ContainerConfig failures..."
for NAME in assetlinq_app simbisa_worker simbisa_scheduler; do
    STALE=$(docker ps -aq --filter name="$NAME")
    if [ -n "$STALE" ]; then
        docker rm -f $STALE
    fi
done

echo "Building application images..."
docker-compose build app worker scheduler

echo "Installing PHP dependencies on the server volume..."
docker-compose run --rm app composer install --no-interaction --no-dev --optimize-autoloader

docker-compose up -d --build --remove-orphans

# 8. Wait for database to be ready
echo "Waiting for database..."
sleep 10

# 9. Run migrations
echo "Running migrations..."
docker-compose exec -T app php artisan migrate --force

# 10. Create storage symlink for public disk
echo "Linking storage..."
docker-compose exec -T app php artisan storage:link || true

# 11. Clear and cache configuration
echo "Caching configuration..."
docker-compose exec -T app php artisan optimize:clear
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache

# 12. Set permissions
echo "Setting permissions..."
docker-compose exec -T app chown -R www-data:www-data /app/storage /app/bootstrap/cache

echo "Restarting nginx to clear stale upstream references..."
docker-compose restart nginx || docker restart simbisa_nginx

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo "Application is now running at http://77.93.154.83"
echo "Check status with: docker-compose ps"
