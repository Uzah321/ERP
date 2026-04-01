# Build stage: get composer from official image
FROM composer:2 AS composer_stage

# Main application image
FROM php:8.4-fpm-alpine

# Install the fast PHP extension installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Copy composer binary from official composer image (uses same PHP binary as this image)
COPY --from=composer_stage /usr/bin/composer /usr/bin/composer

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpq \
    libzip-dev \
    zip \
    unzip \
    git \
    postgresql-client \
    supervisor \
    nginx

# Install PHP extensions (fast, no compilation needed)
RUN install-php-extensions \
    pdo \
    pdo_pgsql \
    zip \
    bcmath \
    mbstring \
    tokenizer \
    opcache \
    dom \
    session \
    fileinfo \
    xml \
    ctype \
    curl \
    gd \
    intl

# Copy PHP config
COPY .docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY .docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zzz-custom.conf

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install composer dependencies (without dev for production)
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Create necessary directories
RUN mkdir -p storage/logs/nginx storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/framework/testing /var/log/php-fpm /var/log/supervisor && \
    chmod -R 755 storage bootstrap/cache /var/log/php-fpm && \
    chown -R www-data:www-data /app /var/log/php-fpm

# Copy supervisor config
COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY .docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 9000

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]

CMD ["php-fpm"]
