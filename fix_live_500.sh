#!/bin/bash

set -euo pipefail

APP_DIR="/var/www/simbisa"

ensure_runtime_paths() {
    docker-compose exec -T -u root app sh -lc "mkdir -p /app/storage/logs /app/storage/framework/cache/data /app/storage/framework/sessions /app/storage/framework/views /app/bootstrap/cache && chown -R www-data:www-data /app/storage /app/bootstrap/cache && chmod -R ug+rwX /app/storage /app/bootstrap/cache"
}

verify_runtime_writes() {
    docker-compose exec -T -u www-data app sh -lc "touch /app/storage/framework/sessions/.write-test /app/storage/framework/cache/data/.write-test /app/bootstrap/cache/.write-test && rm -f /app/storage/framework/sessions/.write-test /app/storage/framework/cache/data/.write-test /app/bootstrap/cache/.write-test"
}

verify_required_tables() {
    local db_name
    db_name=$(docker-compose exec -T app printenv DB_DATABASE | tr -d '[:space:]')

    for table in users migrations; do
        local exists
        exists=$(docker-compose exec -T postgres psql -U postgres -d "$db_name" -tAc "SELECT to_regclass('public.$table') IS NOT NULL")
        exists=$(echo "$exists" | tr -d '[:space:]')

        if [ "$exists" != "t" ]; then
            echo "ERROR: required table '$table' is missing in database '$db_name'."
            exit 1
        fi
    done
}

cd "$APP_DIR"

echo "================================"
echo "Repairing live Laravel 500 state"
echo "================================"

echo "Ensuring containers are running..."
docker-compose up -d app nginx postgres redis

echo "Repairing runtime directories and permissions..."
ensure_runtime_paths
verify_runtime_writes

echo "Removing stale bootstrap cache files..."
find bootstrap/cache -maxdepth 1 -type f -name '*.php' -delete
docker-compose exec -T -u root app sh -lc "find /app/bootstrap/cache -maxdepth 1 -type f -name '*.php' -delete"

echo "Checking deployed frontend assets..."
test -f public/build/manifest.json

echo "Checking deployed PHP syntax..."
docker-compose exec -T app sh -lc "cd /app && find app bootstrap config database routes -type f -name '*.php' -print0 | xargs -0 -n1 php -l >/tmp/php-lint.log && cat /tmp/php-lint.log"

echo "Running migrations and schema checks..."
docker-compose exec -T app php artisan migrate --force
verify_required_tables

echo "Clearing and rebuilding Laravel caches..."
docker-compose exec -T app php artisan optimize:clear
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache

echo "Restarting php-fpm and nginx..."
docker-compose restart app nginx || true

echo "Recent Laravel log output:"
docker-compose exec -T app sh -lc "if [ -f storage/logs/laravel.log ]; then tail -n 40 storage/logs/laravel.log; else echo 'storage/logs/laravel.log not found'; fi"

echo "================================"
echo "Repair complete"
echo "Next: verify http://77.93.154.83/up and http://77.93.154.83/login"
echo "================================"