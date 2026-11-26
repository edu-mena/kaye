#!/usr/bin/env bash
# Runs on the GitHub runner after a release was pushed to a deploy branch (deploy-staging or deploy). Waits for the
# hPanel Git link to pull it, finishes the job on the server over SSH (scripts/post-deploy.sh) and smoke-tests the
# site from outside. The same steps for staging and production; only the environment's secrets change.
#   scripts/finish-deploy.sh <commit>
# Needs: SSH_HOST, SSH_PORT, SSH_USER, SSH_KEY, SSH_KNOWN_HOSTS, SITE_DIR, SITE_URL; optional HEALTH_TOKEN.
# See docs/infraestrutura.md (O deploy na Hostinger).
set -euo pipefail

version="${1:?usage: scripts/finish-deploy.sh <commit>}"

missing=""
for name in SSH_HOST SSH_PORT SSH_USER SSH_KEY SSH_KNOWN_HOSTS SITE_DIR SITE_URL; do
  [ -n "${!name:-}" ] || missing="$missing $name"
done
# Production waits for staging, so an environment without its secrets must stop the line, not skip.
[ -z "$missing" ] || { echo "::error::Missing in this GitHub environment:$missing (docs/infraestrutura.md)."; exit 1; }

install -m 700 -d ~/.ssh
printf '%s\n' "$SSH_KEY" > ~/.ssh/deploy_key && chmod 600 ~/.ssh/deploy_key
printf '%s\n' "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
# ConnectTimeout: a blocked port fails in 10 s, not 2 minutes, so the 30 attempts really last about 5 minutes.
ssh_run() { ssh -i ~/.ssh/deploy_key -p "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=4 "$SSH_USER@$SSH_HOST" "$@"; }

# The webhook pulls within a minute or two; RELEASE holds the commit that was pulled.
for attempt in $(seq 1 30); do
  [ "$(ssh_run "cat '$SITE_DIR/RELEASE' 2>/dev/null" || true)" = "$version" ] && break
  [ "$attempt" = 30 ] && { echo "::error::The server did not pull $version into $SITE_DIR in 5 minutes (hPanel > Git: webhook and branch)."; exit 1; }
  sleep 10
done

# The server's default `php` is 8.1; the app needs 8.4 (docs/infraestrutura.md).
# Exit 255 = the SSH link or PHP died mid-way (a transient crash): try again. Exit 1 = a check failed for real: do not.
for attempt in 1 2 3; do
  rc=0
  ssh_run "cd '$SITE_DIR' && PHP=/opt/alt/php84/usr/bin/php scripts/post-deploy.sh" || rc=$?
  [ "$rc" != 255 ] && break
  echo "::warning::post-deploy ended with 255 (attempt $attempt of 3); trying again in 30 s"
  sleep 30
done
[ "$rc" = 0 ] || exit "$rc"

# The cron is required on the server (kaye:health). From outside it can only be read with the token.
SMOKE_HEALTH_TOKEN="${HEALTH_TOKEN:-}" SMOKE_REQUIRE_CRON="$([ -n "${HEALTH_TOKEN:-}" ] && echo 1 || echo 0)" \
  "$(dirname "$0")/smoke-test.sh" "$SITE_URL"
