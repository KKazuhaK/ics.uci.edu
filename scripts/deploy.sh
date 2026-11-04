#!/usr/bin/env bash
# Copy the Astro build (dist/) into the web root (settings: deploy.env, defaults in
# deploy.env.example).
#   next  -> $WEB_ROOT/next/ (staging; safe to wipe)
#   prod  -> $WEB_ROOT itself
# SRC=<dir> deploys another build (scripts/pull-deploy.sh passes the CI build).
# Files the web server serves that are not built from this repo (resources/,
# remote_profiles/, deployment-local config, ...) are listed in KEEP, so --delete never touches them.
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/deploy-env.sh

target="${1:-}"
web="$WEB_ROOT"
src="${SRC:-dist}"
[ -f "$src/index.html" ] || { echo "$src/ has no build; run astro build first" >&2; exit 1; }

# dist/ must have been built for this target's base, or every link points at the wrong place.
case "$target" in
  next) want="${SITE_BASE}next/" ;;
  prod) want="$SITE_BASE" ;;
  *) want="" ;;
esac
if [ -n "$want" ] && ! grep -q "href=\"${want}notes/\"" "$src/index.html"; then
  echo "$src/ was not built for base ${want}; run the matching npm script (deploy / deploy:next) or check SITE_BASE in deploy.env" >&2
  exit 1
fi

# rsync --delete must only ever run on a dedicated directory.
real="$(readlink -f "$web" 2>/dev/null || echo "$web")"
case "$real" in
  /|"$(readlink -f "$HOME")"|/home|/var|/usr|/etc|/srv) echo "refusing to deploy into $web; check WEB_ROOT in deploy.env" >&2; exit 1 ;;
esac
# ... and never on (or above) this repo or the build checkout.
for inside in "$PWD" "$(readlink -f "$DIST_DIR" 2>/dev/null || echo "$DIST_DIR")" "$(readlink -f "$src")"; do
  case "$inside/" in "$real"/*) echo "refusing to deploy into $web: it contains $inside; check WEB_ROOT in deploy.env" >&2; exit 1 ;; esac
done

case "$target" in
  next)
    mkdir -p "$web/next"
    rsync -a --delete --chmod=D755,F644 --exclude=/.git/ "$src/" "$web/next/"
    echo "Staged: ${PUBLIC_URL%/}/next/"
    ;;
  prod)
    # ~/public_html used to be a git clone of this repo. After a deploy it is build
    # output, and git commands there (clean, pull, add -A) would hit private
    # untracked dirs or check out source over the live site. Retire it first.
    if [ -e "$web/.git" ]; then
      echo "$web/.git exists; move it aside (e.g. mv $web/.git $web.git.bak) before the first prod deploy" >&2
      exit 1
    fi
    excludes=(--exclude=/.git/)
    for k in ${KEEP_PATHS[@]+"${KEEP_PATHS[@]}"}; do excludes+=("--exclude=/${k#/}"); done
    mkdir -p "$web"
    rsync -a --delete --chmod=D755,F644 "${excludes[@]}" "$src/" "$web/"
    echo "Deployed: $PUBLIC_URL"
    ;;
  *)
    echo "usage: scripts/deploy.sh next|prod" >&2; exit 2 ;;
esac
