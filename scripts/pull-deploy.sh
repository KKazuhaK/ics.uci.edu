#!/usr/bin/env bash
# Cron job (every 5 min): publish the latest CI build to ~/public_html.
# GitHub Actions builds every push to main and force-pushes the result to the
# `deploy` branch; this fetches that branch into ~/site-dist and, when it has
# moved, syncs it with scripts/deploy.sh. No Node needed on the server.
#   scripts/pull-deploy.sh           # deploy only if the build changed
#   scripts/pull-deploy.sh --force   # redeploy the current build anyway
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
dist="$HOME/site-dist"
mkdir -p "$HOME/.cache"
exec 9>"$HOME/.cache/site-pull-deploy.lock"
flock -n 9 || exit 0

# Keep the source checkout current too (fast-forward only; never touches local edits).
git -C "$here" pull -q --ff-only 2>/dev/null || echo "$(date -Is) note: ~/site not fast-forwarded (local commits or conflicts)"

repo="$(git -C "$here" remote get-url origin)"
changed=""
if [ ! -d "$dist/.git" ]; then
  git clone -q --depth 1 --branch deploy "$repo" "$dist"
  changed=1
else
  git -C "$dist" fetch -q --depth 1 origin deploy
  if [ "$(git -C "$dist" rev-parse HEAD)" != "$(git -C "$dist" rev-parse FETCH_HEAD)" ]; then
    git -C "$dist" reset -q --hard FETCH_HEAD
    git -C "$dist" gc -q --prune=now
    changed=1
  fi
fi

if [ -n "$changed" ] || [ "${1:-}" = "--force" ]; then
  SRC="$dist" "$here/scripts/deploy.sh" prod >/dev/null
  echo "$(date -Is) deployed: $(git -C "$dist" log -1 --format=%s)"
fi
