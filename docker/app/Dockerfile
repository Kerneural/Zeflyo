FROM php:8.4-cli-alpine

# Install system dependencies & build tools
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    postgresql-dev \
    linux-headers \
    bash \
    icu-dev \
    pkgconf \
    sqlite-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure pdo_pgsql --with-pdo-pgsql \
    && docker-php-ext-install pdo pdo_pgsql gd zip pcntl sockets opcache intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

CMD ["php", "artisan", "octane:start", "--host=0.0.0.0", "--port=8000"]
