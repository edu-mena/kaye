#!/bin/sh
# Prepares the app at container start, when the real environment is known.
set -eu

if [ -z "${APP_KEY:-}" ]; then
    echo "kaye: APP_KEY is required" >&2
    exit 1
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

# Local and CI stacks: the catalogue from database/data (kaye:import changes only what differs).
if [ "${RUN_IMPORT:-false}" = "true" ]; then
    php artisan kaye:import --no-interaction
fi

# E2E stacks only (compose.yaml): the panel's test admin, with a known second factor. Production never sets it.
if [ -n "${E2E_ADMIN_PASSWORD:-}" ]; then
    php artisan db:seed --class=E2eAdminSeeder --force --no-interaction
fi

php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

exec "$@"
