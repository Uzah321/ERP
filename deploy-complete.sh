#!/bin/bash

# Complete Deployment Script for Laravel on Live Server
# Run this on the server: bash /home/administrator/deploy-complete.sh

set -e

APP_PATH="/var/www/simbisa"

echo "================================"
echo "📡 Laravel Deployment Script"
echo "================================"
echo ""

# Ensure running as correct user
if [ ! -d "$APP_PATH" ]; then
    echo "✓ Creating application directory..."
    echo "Note: You may be prompted for your password to create /var/www/simbisa"
    sudo mkdir -p $APP_PATH
    sudo chown $USER:$USER $APP_PATH || true
fi

echo "✓ Directory ready at $APP_PATH"
echo ""

# Check if files are in home directory
if [ -d ~/simbisa_app ]; then
    echo "✓ Moving files from home directory..."
    cp -r ~/simbisa_app/* $APP_PATH/
    cp -r ~/simbisa_app/.* $APP_PATH/ 2>/dev/null || true
    echo "✓ Files moved"
else
    echo "⚠ No files found in ~/simbisa_app"
    echo "Files should be at: $APP_PATH"
fi

echo ""
cd $APP_PATH

# Setup environment
echo "⚙ Configuring environment..."
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
        echo "✓ .env created from .env.production"
    else
        echo "✗ .env.production not found!"
        exit 1
    fi
fi

echo ""
echo "✓ Checking Docker..."
docker --version

echo ""
echo "🐳 Starting Docker Compose..."
docker-compose pull 2>/dev/null || true
docker-compose build --no-cache || true

echo "✓ Starting services..."
docker-compose up -d

echo "✓ Waiting 20 seconds for database initialization..."
sleep 20

echo ""
echo "🔑 Generating APP_KEY..."
docker-compose exec -T app php artisan key:generate || true

echo ""
echo "🗄 Running database migrations..."
docker-compose exec -T app php artisan migrate --force

echo ""
echo "⚡ Caching configuration..."
docker-compose exec -T app php artisan config:cache
docker-compose exec -T app php artisan route:cache
docker-compose exec -T app php artisan view:cache

echo ""
echo "📁 Setting permissions..."
docker-compose exec -T app chown -R www-data:www-data storage bootstrap/cache

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "📊 Container Status:"
docker-compose ps
echo ""
echo "🌐 Application URL: http://77.93.154.83"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit http://77.93.154.83 in your browser"
echo "   2. Test the login functionality"
echo "   3. Check logs: docker-compose logs -f app"
echo ""
echo "💾 Database Backup:"
echo "   docker-compose exec -T postgres pg_dump -U postgres assets_erp > backup.sql"
echo ""
