#!/bin/bash
# Run this on the server: bash /home/administrator/run_deploy.sh
cd /var/www/simbisa

echo "=== STEP 1: Cleaning old Docker state ==="
sg docker -c "docker system prune -af 2>&1 | tail -3" || true

echo ""
echo "=== STEP 2: Building Docker image ==="
sg docker -c "docker-compose build --no-cache app 2>&1"

if [ $? -ne 0 ]; then
    echo "Build FAILED"
    exit 1
fi

echo ""
echo "=== STEP 3: Starting all services ==="
sg docker -c "docker-compose up -d 2>&1"

echo ""
echo "=== STEP 4: Waiting 30s for DB to init... ==="
sleep 30

echo ""
echo "=== STEP 5: Running migrations ==="
sg docker -c "docker-compose exec -T app php artisan migrate --force 2>&1"

echo ""
echo "=== STEP 6: Caching routes and config ==="
sg docker -c "docker-compose exec -T app php artisan config:cache 2>&1"
sg docker -c "docker-compose exec -T app php artisan route:cache 2>&1"

echo ""
echo "=== DEPLOYMENT STATUS ==="
sg docker -c "docker-compose ps 2>&1"

echo ""
echo "======================================="
echo "App running at: http://77.93.154.83"
echo "======================================="
