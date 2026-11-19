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

step "Migrations"
"$php" artisan migrate --force
step "Catalogue (only what changed)"
"$php" artisan kaye:import
step "Caches (config, routes, views)"
"$php" artisan optimize
step "Production check"
"$php" artisan kaye:check-production
step "Queue workers pick up the new code"
"$php" artisan queue:restart

url="$(grep -E '^APP_URL=' .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
step "Smoke test: $url"
SMOKE_REQUIRE_CRON="${SMOKE_REQUIRE_CRON:-1}" scripts/smoke-test.sh "$url"
