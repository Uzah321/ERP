#!/bin/bash

# Deployment Script for Laravel Application to Live Server
# Server: 77.93.154.83

set -e

DEPLOY_ARCHIVE="deploy_bundle.tar.gz"
BACKUP_DIR="/var/backups/simbisa"

backup_database_if_exists() {
    DB_NAME=$(docker-compose exec -T app printenv DB_DATABASE | tr -d '[:space:]')

    if [ -z "$DB_NAME" ]; then
        echo "Skipping database backup because DB_DATABASE is empty."
        return
    fi

    if docker-compose exec -T postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_predeploy_$(date +%Y%m%d_%H%M%S).sql"
        echo "Creating pre-deploy database backup at $BACKUP_FILE ..."
        docker-compose exec -T postgres pg_dump -U postgres "$DB_NAME" > "$BACKUP_FILE"
    else
        echo "Skipping pre-deploy backup because database '$DB_NAME' does not exist yet."
    fi
}

ensure_runtime_paths() {
    docker-compose exec -T -u root app sh -lc "mkdir -p /app/storage/logs /app/storage/framework/cache/data /app/storage/framework/sessions /app/storage/framework/views /app/bootstrap/cache && chown -R www-data:www-data /app/storage /app/bootstrap/cache && chmod -R ug+rwX /app/storage /app/bootstrap/cache"
}

verify_runtime_writes() {
    docker-compose exec -T -u www-data app sh -lc "touch /app/storage/framework/sessions/.write-test /app/storage/framework/cache/data/.write-test /app/bootstrap/cache/.write-test && rm -f /app/storage/framework/sessions/.write-test /app/storage/framework/cache/data/.write-test /app/bootstrap/cache/.write-test"
}

verify_assets() {
    if [ ! -f public/build/manifest.json ]; then
        echo "ERROR: public/build/manifest.json is missing. Frontend assets were not deployed."
        exit 1
    fi
}

verify_database_schema() {
    DB_NAME=$(docker-compose exec -T app printenv DB_DATABASE | tr -d '[:space:]')

    if [ -z "$DB_NAME" ]; then
        echo "ERROR: DB_DATABASE is empty inside the app container."
        exit 1
    fi

    REQUIRED_TABLES="users migrations"

    if grep -Eq '^SESSION_DRIVER=database$' .env; then
        REQUIRED_TABLES="$REQUIRED_TABLES sessions"
    fi

    if grep -Eq '^CACHE_STORE=database$' .env; then
        REQUIRED_TABLES="$REQUIRED_TABLES cache"
    fi

    for TABLE in $REQUIRED_TABLES; do
        EXISTS=$(docker-compose exec -T postgres psql -U postgres -d "$DB_NAME" -tAc "SELECT to_regclass('public.$TABLE') IS NOT NULL")
        EXISTS=$(echo "$EXISTS" | tr -d '[:space:]')

        if [ "$EXISTS" != "t" ]; then
            echo "ERROR: required table '$TABLE' is missing in database '$DB_NAME'."
            exit 1
        fi
    done
}

print_recent_log_tail() {
    echo "Recent Laravel log output:"
    docker-compose exec -T app sh -lc "if [ -f storage/logs/laravel.log ]; then tail -n 60 storage/logs/laravel.log; else echo 'storage/logs/laravel.log not found'; fi"
}

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

ensure_runtime_paths

# 2a. Refuse to continue if the uploaded PHP code contains syntax errors.
echo "Running PHP syntax validation..."
docker-compose exec -T app sh -lc "cd /app && find app bootstrap config database routes -type f -name '*.php' -print0 | xargs -0 -n1 php -l >/tmp/php-lint.log && cat /tmp/php-lint.log"

echo "Validating deployed frontend assets..."
verify_assets

# 2b. Remove stale Laravel bootstrap cache files that may survive archive extraction.
#     The lean archive omits generated cache manifests, so old files on the bind mount
#     must be deleted explicitly before Composer or Artisan boot the application.
echo "Clearing stale bootstrap cache files..."
find bootstrap/cache -maxdepth 1 -type f -name '*.php' -delete
docker-compose exec -T -u root app sh -lc "find /app/bootstrap/cache -maxdepth 1 -type f -name '*.php' -delete"

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

# 4b. Validate the critical server-side environment variables before booting Laravel.
echo "Validating live environment..."
for REQUIRED_KEY in APP_ENV APP_URL DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME; do
    if ! grep -Eq "^${REQUIRED_KEY}=.+" .env; then
        echo "ERROR: ${REQUIRED_KEY} is missing or empty in .env."
        exit 1
    fi
done

# 5. Pull latest images
echo "Pulling Docker images..."
docker-compose pull

# 6. Build and start containers without tearing down named volumes
echo "Building and starting containers..."

echo "Removing stale containers to avoid legacy docker-compose ContainerConfig failures..."
for NAME in assetlinq_app simbisa_worker simbisa_scheduler simbisa_postgres; do
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

echo "Backing up live database before migrations..."
backup_database_if_exists

# 9. Ensure the database exists (POSTGRES_DB only runs on first volume init)
echo "Ensuring database exists..."
DB_NAME=$(docker-compose exec -T app printenv DB_DATABASE)
DB_NAME=$(echo "$DB_NAME" | tr -d '[:space:]')
docker-compose exec -T postgres psql -U postgres -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" \
    | grep -q 1 || \
    docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE \"$DB_NAME\""

# 10. Run migrations
echo "Running migrations..."
docker-compose exec -T app php artisan migrate --force

echo "Verifying required database tables..."
verify_database_schema

# 11. Create storage symlink for public disk
echo "Linking storage..."
docker-compose exec -T app php artisan storage:link || true

# 12. Validate filesystem permissions before rebuilding cached manifests.
echo "Verifying runtime file permissions..."
verify_runtime_writes

echo "Clearing Laravel caches..."
docker-compose exec -T app php artisan optimize:clear

echo "Rebuilding Laravel caches..."
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache

# 13. Set permissions
echo "Setting permissions..."
ensure_runtime_paths
verify_runtime_writes

echo "Restarting nginx to clear stale upstream references..."
docker-compose restart nginx || docker restart simbisa_nginx

echo "Running final Laravel boot check..."
if ! docker-compose exec -T app php artisan about --only=environment >/dev/null; then
    print_recent_log_tail
    exit 1
fi

echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo "Application is now running at http://77.93.154.83"
echo "Check status with: docker-compose ps"
