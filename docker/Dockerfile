# syntax=docker/dockerfile:1.7
#
# Kayé: one image with the API, the admin panel and the compiled web app.
# Same model as production on Hostinger: PHP 8.4 + Apache + .htaccess.
# Build from the repository root:  docker build -f docker/Dockerfile -t kaye .
# See docs/infraestrutura.md.

ARG PHP_VERSION=8.4
ARG NODE_VERSION=22

# ---------------------------------------------------------------------------
# 1. Web app (React) -> /spa
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS web
WORKDIR /build/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY apps/web/ ./
RUN npx tsc -b && npx vite build --outDir /spa --emptyOutDir

# ---------------------------------------------------------------------------
# 2. PHP runtime with the extensions Laravel and Filament need
# ---------------------------------------------------------------------------
FROM php:${PHP_VERSION}-apache AS base
# Debian security fixes newer than the base image (the Trivy scan in CI fails on HIGH and CRITICAL).
# The MariaDB client gives kaye:backup its mysqldump, as on Hostinger; newer Debian names it mariadb-dump only.
RUN apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && apt-get install -y --no-install-recommends mariadb-client \
    && { command -v mysqldump || ln -s "$(command -v mariadb-dump)" /usr/local/bin/mysqldump; } \
    && rm -rf /var/lib/apt/lists/*
COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql intl zip opcache \
    && a2enmod rewrite headers \
    # Unprivileged port, so Apache can run as www-data.
    && sed -ri 's/Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
    && sed -ri 's#<VirtualHost \*:80>#<VirtualHost *:8080>#; s#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#' \
        /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>\nServerTokens Prod\nServerSignature Off\n' \
        > /etc/apache2/conf-enabled/zz-kaye.conf \
    && chown -R www-data:www-data /var/run/apache2 /var/log/apache2 /var/lock/apache2
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-kaye.ini
WORKDIR /var/www/html

# ---------------------------------------------------------------------------
# 3. PHP dependencies, production only (no dev tools such as Laravel Boost)
# ---------------------------------------------------------------------------
FROM base AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY apps/api/composer.json apps/api/composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --no-scripts --no-autoloader
COPY apps/api/ ./
RUN composer dump-autoload --no-dev --classmap-authoritative --no-scripts \
    && php artisan package:discover --ansi \
    && php artisan filament:assets

# ---------------------------------------------------------------------------
# 3b. The admin panel's theme (Vite + Tailwind): it builds on Filament's CSS
#     from vendor/, so it comes after the PHP dependencies.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS admin-theme
WORKDIR /build
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY --from=vendor /var/www/html/vendor/filament ./vendor/filament
COPY apps/api/vite.config.js ./
COPY apps/api/resources ./resources
COPY apps/api/app ./app
RUN npx vite build

# ---------------------------------------------------------------------------
# 4. Final image
# ---------------------------------------------------------------------------
FROM base AS runtime
LABEL org.opencontainers.image.title="kaye" \
      org.opencontainers.image.description="Kayé API, admin panel and web app"

COPY --from=vendor --chown=www-data:www-data /var/www/html ./
COPY --from=web --chown=www-data:www-data /spa ./public/spa
COPY --from=admin-theme --chown=www-data:www-data /build/public/build ./public/build
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/kaye-entrypoint

# Local secrets and files that must never be baked into the image.
RUN rm -f .env .env.* && rm -rf storage/logs/* tests node_modules

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stack \
    LOG_STACK=stderr_json \
    LOG_LEVEL=info

USER www-data
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
    CMD php -r "exit(@file_get_contents('http://127.0.0.1:8080/up') === false ? 1 : 0);"

ENTRYPOINT ["kaye-entrypoint"]
CMD ["apache2-foreground"]
