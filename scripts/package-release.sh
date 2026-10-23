#!/usr/bin/env bash
# Builds the release package for the Hostinger server: the Laravel app with
# production dependencies only and the compiled web app.
#   scripts/package-release.sh <version>   ->   build/kaye-<version>.tar.gz
# See docs/infraestrutura.md (Deploy).
set -euo pipefail

version="${1:?usage: scripts/package-release.sh <version>}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/build"
stage="$out/kaye-$version"

rm -rf "$stage" && mkdir -p "$stage"

# 1. Web app -> apps/api/public/spa
(cd "$root/apps/web" && npm ci --ignore-scripts --no-audit --no-fund && npm run build)

# 2. Laravel app without tests, local files or dev tools
rsync -a \
  --exclude '.env' --exclude '.env.*' --exclude 'vendor/' --exclude 'node_modules/' \
  --exclude 'tests/' --exclude 'storage/logs/*' --exclude 'storage/framework/*/*' \
  --exclude '.phpunit.cache' --exclude 'phpunit.xml' --exclude 'phpstan.neon' --exclude 'pint.json' \
  --exclude 'boost.json' --exclude '.mcp.json' --exclude 'CLAUDE.md' \
  "$root/apps/api/" "$stage/"

(cd "$stage" \
  && composer install --no-dev --no-interaction --no-progress --prefer-dist --classmap-authoritative \
  && php artisan filament:assets)

# 3. Guard: dev tools must not ship (they inject scripts and open endpoints).
if [ -d "$stage/vendor/laravel/boost" ]; then
  echo "error: laravel/boost is in the release package" >&2
  exit 1
fi

echo "$version" > "$stage/RELEASE"
tar -czf "$out/kaye-$version.tar.gz" -C "$out" "kaye-$version"
rm -rf "$stage"
echo "built $out/kaye-$version.tar.gz"
