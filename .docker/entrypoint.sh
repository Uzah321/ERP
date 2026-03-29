#!/bin/sh
set -e

# Simple wait for services
echo "Waiting 10 seconds for services to be ready..."
sleep 10

echo "Services should be ready now."

# Generate app key if needed
if [ -z "$APP_KEY" ]; then
  echo "Generating application key..."
  php artisan key:generate --force
fi

# Run migrations  
echo "Running migrations..."
php artisan migrate --force 2>&1 || true

# Cache optimization
echo "Caching configuration..."
php artisan config:cache 2>&1 || true
php artisan route:cache 2>&1 || true
php artisan view:cache 2>&1 || true

echo "Application is ready!"

# Execute the main command
exec "$@"
