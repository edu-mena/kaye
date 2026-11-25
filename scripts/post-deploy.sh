#!/usr/bin/env bash
# Runs on the Hostinger server, over SSH, after the Git deploy has pulled a new release into the site folder.
#   cd ~/domains/<site>/public_html && scripts/post-deploy.sh
# Stops at the first failure: a site whose migration or production check failed is not announced as deployed.
# PHP=/opt/alt/php84/usr/bin/php scripts/post-deploy.sh  if the default `php` is not 8.4 (php -v).
# See docs/infraestrutura.md.
set -euo pipefail

cd "$(dirname "$0")/.."
php="${PHP:-php}"

[ -f .env ] || { echo "error: there is no .env here. Create it first (docs/infraestrutura.md, primeira vez)." >&2; exit 1; }
"$php" -r 'exit(PHP_VERSION_ID >= 80400 ? 0 : 1);' || { echo "error: PHP 8.4 or newer is needed (set PHP=...)." >&2; exit 1; }

step() { printf '\n== %s\n' "$1"; }

step "Wait for the Git deploy's own composer install"
# Hostinger runs `composer install` (with dev tools) after every pull. Running artisan while it is half done
# crashes (exit 255), so wait until no composer has run for three checks in a row. `[c]` keeps pgrep from matching itself.
idle=0
for _ in $(seq 1 60); do
  if pgrep -u "$(id -u)" -f '[c]omposer (install|update)' >/dev/null 2>&1; then idle=0; else idle=$((idle + 1)); fi
  [ "$idle" -ge 3 ] && break
  sleep 5
done
[ "$idle" -ge 3 ] || { echo "error: composer was still running after 5 minutes." >&2; exit 1; }

# That install also brings back laravel/boost and the other dev tools, which kaye:check-production refuses.
step "Production dependencies (no dev tools)"
if [ -d vendor/laravel/boost ]; then
  composer="$(command -v composer || true)"
  [ -n "$composer" ] || composer=/usr/local/bin/composer
  "$php" "$composer" install --no-dev --optimize-autoloader --no-interaction --quiet
fi

step "Migrations"
"$php" artisan migrate --force
step "Public files (the approved images, docs/ia.md)"
[ -e public/storage ] || "$php" artisan storage:link
step "Catalogue (only what changed)"
"$php" artisan kaye:import
step "Caches (config, routes, views)"
"$php" artisan optimize
step "Production check"
"$php" artisan kaye:check-production
step "Queue workers pick up the new code"
"$php" artisan queue:restart

step "Health: database, queue, cron, disk"
# From the server itself, so the cron is checked on every deploy without HEALTH_TOKEN (the public /health no longer
# shows it, docs/observabilidade.md).
"$php" artisan kaye:health

url="$(grep -E '^APP_URL=' .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
step "Smoke test: $url"
scripts/smoke-test.sh "$url"
