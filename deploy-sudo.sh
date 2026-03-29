#!/bin/bash

# Complete Deployment Script with sudo for Docker commands

set -e

APP_PATH="/var/www/simbisa"

echo "================================"
echo "📡 Laravel Deployment"
echo "================================"
echo ""

# Directory is already created, just verify
if [ ! -d "$APP_PATH" ]; then
    echo "✗ Application directory doesn't exist!"
    exit 1
fi

echo "✓ Working in: $APP_PATH"
cd $APP_PATH

# Verify environment file
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
        echo "✓ .env created"
    else
        echo "✗ .env.production missing!"
        exit 1
    fi
else
    echo "✓ .env already configured"
fi

echo ""
echo "✓ Checking Docker..."
docker --version

echo ""
echo "🐳 Building Docker containers..."
echo "(This may take 2-5 minutes...)"
sudo docker-compose build 2>&1 | tail -5

echo ""
echo "✓ Starting services..."
sudo docker-compose up -d

echo "✓ Waiting 40 seconds for database..."
sleep 40

echo ""
echo "🔑 Generating APP_KEY..."
sudo docker-compose exec -T app php artisan key:generate 2>&1 | grep -i "key" || echo "✓ Key generated"

echo ""
echo "🗄 Running migrations..."
sudo docker-compose exec -T app php artisan migrate --force 2>&1 | tail -3

echo ""
echo "⚡ Caching..."
sudo docker-compose exec -T app php artisan config:cache
sudo docker-compose exec -T app php artisan route:cache

echo ""
echo "📊 SERVICE STATUS:"
sudo docker-compose ps

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "🌐 Visit: http://77.93.154.83"
echo ""
echo "📋 To check logs:"
echo "   docker-compose logs -f app"
echo ""
