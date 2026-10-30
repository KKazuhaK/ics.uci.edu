#!/usr/bin/env bash
# Copy the Astro build (dist/) into ~/public_html.
#   next  -> ~/public_html/next/ (staging; safe to wipe)
#   prod  -> ~/public_html/ itself
# Files Apache serves that are not built from this repo (resources/,
# remote_profiles/, deployment-local config, ...) are excluded so --delete never touches them.
set -euo pipefail
cd "$(dirname "$0")/.."

target="${1:-}"
web="$HOME/public_html"
[ -d dist ] || { echo "dist/ missing; run astro build first" >&2; exit 1; }

# dist/ must have been built for this target's base, or every link points at the wrong place.
case "$target" in
  next) want="/~kazuhak/next/" ;;
  prod) want="/~kazuhak/" ;;
  *) want="" ;;
esac
if [ -n "$want" ] && ! grep -q "href=\"${want}notes/\"" dist/index.html; then
  echo "dist/ was not built for base ${want}; run the matching npm script (deploy / deploy:next)" >&2
  exit 1
fi

case "$target" in
  next)
    rsync -a --delete --chmod=D755,F644 dist/ "$web/next/"
    echo "Staged: https://ics.uci.edu/~kazuhak/next/"
    ;;
  prod)
    # ~/public_html used to be a git clone of this repo. After a deploy it is build
    # output, and git commands there (clean, pull, add -A) would hit private
    # untracked dirs or check out source over the live site. Retire it first.
    if [ -e "$web/.git" ]; then
      echo "$web/.git exists; move it aside (e.g. mv $web/.git ~/public_html.git.bak) before the first prod deploy" >&2
      exit 1
    fi
    rsync -a --delete --chmod=D755,F644 \
      --exclude=/next/ \
      --exclude=/resources/ --exclude=/remote_profiles/ \
      --exclude=/temp/ --exclude=/.venv/ --exclude=/.claude/ --exclude=/.codex \
      --exclude=/CLAUDE.md --exclude='/assets/config/*.local.json' \
      dist/ "$web/"
    echo "Deployed: https://ics.uci.edu/~kazuhak/"
    ;;
  *)
    echo "usage: scripts/deploy.sh next|prod" >&2; exit 2 ;;
esac
