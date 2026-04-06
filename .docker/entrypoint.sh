#!/bin/sh
set -e

ensure_runtime_paths() {
  mkdir -p \
    /app/storage/logs \
    /app/storage/framework/cache/data \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/bootstrap/cache

  chown -R www-data:www-data /app/storage /app/bootstrap/cache
  chmod -R ug+rwX /app/storage /app/bootstrap/cache
}

# Simple wait for services
echo "Waiting 10 seconds for services to be ready..."
sleep 10

echo "Services should be ready now."

ensure_runtime_paths

if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is missing. Refusing to generate a new key automatically." >&2
  exit 1
fi

if [ "$1" = "php-fpm" ]; then
  echo "Clearing stale Laravel caches..."
  php artisan optimize:clear 2>&1 || true

  echo "Running migrations..."
  php artisan migrate --force 2>&1 || true

  if [ -f /app/public/build/manifest.json ]; then
    echo "Caching configuration..."
    php artisan config:cache 2>&1 || true
    php artisan route:cache 2>&1 || true
    php artisan view:cache 2>&1 || true
  else
    echo "Skipping cache warmup because public/build/manifest.json is missing."
  fi
fi

echo "Application is ready!"

# Execute the main command
exec "$@"
