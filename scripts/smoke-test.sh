#!/usr/bin/env bash
# Smoke test of a running Kayé: the container in CI, staging or production
# right after a deploy. Fails (exit 1) on the first broken promise.
#   scripts/smoke-test.sh https://kaye.ao
# See docs/infraestrutura.md.
set -uo pipefail

base="${1:?usage: scripts/smoke-test.sh <base-url>}"
base="${base%/}"
failures=0

pass() { printf '  ok    %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; failures=$((failures + 1)); }

status() { curl -s -o /dev/null -w '%{http_code}' "$base$1"; }
headers() { curl -s -D - -o /dev/null "$base$1"; }

echo "Smoke test: $base"

[ "$(status /up)" = 200 ] && pass "/up answers 200" || fail "/up answers 200"

health="$(curl -s "$base/api/v1/health")"
echo "$health" | grep -q '"database":"ok"' && pass "API reaches the database" || fail "API reaches the database ($health)"

[ "$(status /)" = 200 ] && pass "web app loads" || fail "web app loads"
[ "$(status /vagas)" = 200 ] && pass "deep links load" || fail "deep links load"

asset="$(curl -s "$base/" | grep -o '/spa/assets/index-[A-Za-z0-9_-]*\.js' | head -1)"
[ -n "$asset" ] && [ "$(status "$asset")" = 200 ] && pass "web app assets are served" || fail "web app assets are served"

# Files outside public/ must never leak. Each one is checked for a marker of
# its real content; dotfiles must also be a plain 404.
check_not_leaked() {
  local path="$1" marker="$2" body
  body="$(curl -s "$base$path")"
  if echo "$body" | grep -qF -- "$marker"; then fail "$path does not leak"; else pass "$path does not leak"; fi
}
check_not_leaked /.env 'APP_KEY='
check_not_leaked /.git/config '[core]'
check_not_leaked /composer.json '"require"'
check_not_leaked /artisan 'LARAVEL_START'
check_not_leaked /../.env 'APP_KEY='
for path in /.env /.git/config /.htaccess; do
  code="$(status "$path")"
  [ "$code" = 404 ] || [ "$code" = 403 ] && pass "$path is refused ($code)" || fail "$path is refused (got $code)"
done

page_headers="$(headers /)"
for header in content-security-policy x-content-type-options x-frame-options referrer-policy permissions-policy x-request-id; do
  echo "$page_headers" | grep -qi "^$header:" && pass "header $header" || fail "header $header"
done
echo "$page_headers" | grep -qi '^x-powered-by:' && fail "no X-Powered-By header" || pass "no X-Powered-By header"
echo "$page_headers" | grep -Eqi '^server:.*[0-9]' && fail "Server header hides the version" || pass "Server header hides the version"

if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed"
  exit 1
fi
echo "All checks passed"
