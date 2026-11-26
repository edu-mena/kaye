#!/usr/bin/env bash
# Puts a built release into a checkout of the `deploy` branch and commits it. The Hostinger Git link pulls that
# branch (webhook), so the server needs no Node, no Composer and no build.
#   scripts/publish-deploy.sh <release-folder> <deploy-checkout> <version>
# <release-folder> is what scripts/package-release.sh builds (kaye-<version>/ before it is packed).
# See docs/infraestrutura.md (O deploy na Hostinger).
set -euo pipefail

release="${1:?usage: scripts/publish-deploy.sh <release-folder> <deploy-checkout> <version>}"
tree="${2:?missing the deploy checkout}"
version="${3:?missing the version}"
root="$(cd "$(dirname "$0")/.." && pwd)"

[ -f "$release/artisan" ] || { echo "error: $release is not a Laravel release" >&2; exit 1; }
[ -d "$release/vendor" ] || { echo "error: the release has no vendor/" >&2; exit 1; }
[ -d "$release/public/spa" ] || { echo "error: the release has no compiled web app (public/spa)" >&2; exit 1; }
[ -f "$release/public/build/manifest.json" ] || { echo "error: the release has no admin panel theme (public/build)" >&2; exit 1; }
[ -d "$tree/.git" ] || { echo "error: $tree is not a git checkout" >&2; exit 1; }
for secret in .env auth.json; do
  [ ! -e "$release/$secret" ] || { echo "error: $secret is in the release" >&2; exit 1; }
done

# The release replaces everything except git. The server's own files (.env, storage/logs, uploads) are not in
# the branch, so a pull never touches them.
rsync -a --delete --exclude '/.git/' "$release/" "$tree/"

# The app's .gitignore would hide vendor/ and public/spa/: here they are the point.
find "$tree" -name .gitignore -not -path "$tree/.git/*" -delete

# Folders Laravel writes into must exist on the server, and git keeps no empty folders.
for dir in bootstrap/cache storage/app storage/logs storage/framework/cache storage/framework/sessions storage/framework/views; do
  mkdir -p "$tree/$dir"
  touch "$tree/$dir/.gitkeep"
done

# What runs on the server after each pull (docs/infraestrutura.md).
mkdir -p "$tree/scripts"
cp "$root/scripts/post-deploy.sh" "$root/scripts/smoke-test.sh" "$tree/scripts/"
chmod +x "$tree/scripts/"*.sh
echo "$version" > "$tree/RELEASE"

cd "$tree"
git add -A -f
if git diff --cached --quiet; then
  echo "Nothing changed: the deploy branch already has this release."
  exit 0
fi
git -c user.name="kaye-deploy" -c user.email="deploy@users.noreply.github.com" \
  commit -q -m "deploy: $version"
echo "Committed deploy: $version"
