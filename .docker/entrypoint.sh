#!/bin/sh
set -e

# Simple wait for services
echo "Waiting 10 seconds for services to be ready..."
sleep 10

echo "Services should be ready now."

if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is missing. Refusing to generate a new key automatically." >&2
  exit 1
fi

if [ "$1" = "php-fpm" ]; then
  echo "Running migrations..."
  php artisan migrate --force 2>&1 || true

  echo "Caching configuration..."
  php artisan config:cache 2>&1 || true
  php artisan route:cache 2>&1 || true
  php artisan view:cache 2>&1 || true
fi

echo "Application is ready!"

# Execute the main command
exec "$@"
