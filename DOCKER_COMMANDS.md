# Quick Docker Commands Reference

## Starting & Stopping

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart services
docker compose restart

# View running services
docker compose ps
```

## Logs

```bash
# View all logs
docker compose logs -f

# View app logs only
docker compose logs -f app

# View web server logs
docker compose logs -f nginx

# View database logs
docker compose logs -f postgres

# View last 50 lines
docker compose logs --tail 50 app
```

## Execute Commands

```bash
# Run artisan command
docker compose exec app php artisan tinker

# Run bash
docker compose exec app bash

# Run migrations
docker compose exec app php artisan migrate

# Seed database
docker compose exec app php artisan db:seed

# Clear caches
docker compose exec app php artisan cache:clear

# Queue work
docker compose exec app php artisan queue:work
```

## Database

```bash
# PostgreSQL CLI
docker compose exec postgres psql -U postgres -d simbisa

# Dump database
docker compose exec postgres pg_dump -U postgres simbisa > backup.sql

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U postgres simbisa

# Redis CLI
docker compose exec redis redis-cli
```

## Building & Rebuilding

```bash
# Rebuild images
docker compose up -d --build

# Rebuild without cache
docker compose build --no-cache

# Rebuild specific service
docker compose build app
```

## Development Workflow

```bash
# Fresh migration and seed
docker compose exec app php artisan migrate:fresh --seed

# Watch frontend changes
docker compose exec app npm run dev

# Build frontend assets
docker compose exec app npm run build

# Install new package
docker compose exec app npm install package-name
docker compose exec app composer require vendor/package
```

## Debugging

```bash
# Check service health
docker compose ps

# Inspect container
docker inspect simbisa_app

# View resource usage
docker stats

# Test connectivity
docker compose exec app ping postgres
docker compose exec app redis-cli ping
```

## Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove volumes (CAREFUL - deletes data!)
docker compose down -v

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune
```

## Production

```bash
# Use production env file
docker compose --env-file .env.production up -d

# Update code and rebuild
git pull
docker compose up -d --build

# Run migrations
docker compose exec app php artisan migrate

# Monitor logs
docker compose logs -f --tail 100 app
```
