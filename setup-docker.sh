#!/bin/bash

# Simbisa Docker Setup Script
set -e

echo "=========================================="
echo "Simbisa Asset Management - Docker Setup"
echo "=========================================="
echo ""

# Check Docker Desktop is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker Desktop is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✓ Docker is running"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Generate app key
if ! grep -q "APP_KEY=base64:" .env; then
    echo ""
    echo "Generating APP_KEY..."
    docker compose run --rm app php artisan key:generate
else
    echo "✓ APP_KEY already set"
fi

# Start services
echo ""
echo "Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "postgres.*healthy"; then
    echo "✓ PostgreSQL is healthy"
else
    echo "⚠ PostgreSQL may still be starting..."
fi

if docker compose ps | grep -q "redis.*healthy"; then
    echo "✓ Redis is healthy"
else
    echo "⚠ Redis may still be starting..."
fi

# Run migrations
echo ""
echo "Running database migrations..."
docker compose exec -T app php artisan migrate --force
echo "✓ Migrations completed"

# Clear caches
echo ""
echo "Optimizing application..."
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache
echo "✓ Caches optimized"

echo ""
echo "=========================================="
echo "✓ Setup completed successfully!"
echo "=========================================="
echo ""
echo "Access your application at:"
echo "  🌐 http://localhost:80"
echo ""
echo "Useful commands:"
echo "  View logs:        docker compose logs -f app"
echo "  Bash shell:       docker compose exec app bash"
echo "  Artisan command:  docker compose exec app php artisan <command>"
echo "  Database:         psql -h localhost -U postgres -d simbisa"
echo ""
echo "To stop:            docker compose down"
echo ""
