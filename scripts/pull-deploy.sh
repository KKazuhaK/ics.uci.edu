#!/usr/bin/env bash
# Publish the latest CI build to the web root (settings: deploy.env). Run by
# ./update_site.sh, which waits for CI first. GitHub Actions builds every push to main and
# force-pushes the result to DEPLOY_BRANCH; this fetches that branch into DIST_DIR
# and, when it holds a build not yet deployed, syncs it with scripts/deploy.sh.
# No Node needed on the server.
#   scripts/pull-deploy.sh           # deploy only if the build changed
#   scripts/pull-deploy.sh --force   # redeploy the current build anyway
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
. "$here/scripts/deploy-env.sh"
dist="$DIST_DIR"
state="$STATE_DIR"
mkdir -p "$state"
exec 9>"$state/site-pull-deploy.lock"
flock -n 9 || exit 0

# Keep the source checkout current too (fast-forward only; never touches local edits).
git -C "$here" pull -q --ff-only 2>/dev/null || echo "$(date -Is) note: $here not fast-forwarded (local commits or conflicts)"

repo="$(git -C "$here" remote get-url origin)"
if [ ! -d "$dist/.git" ]; then
  git clone -q --depth 1 --branch "$DEPLOY_BRANCH" "$repo" "$dist"
else
  git -C "$dist" fetch -q --depth 1 origin "$DEPLOY_BRANCH"
  if [ "$(git -C "$dist" rev-parse HEAD)" != "$(git -C "$dist" rev-parse FETCH_HEAD)" ]; then
    git -C "$dist" reset -q --hard FETCH_HEAD
    git -C "$dist" gc -q --prune=now
  fi
fi

# Compare with what was last deployed (not with the previous fetch), so a deploy
# that failed half-way is retried on the next run.
head="$(git -C "$dist" rev-parse HEAD)"
marker="$state/site-deployed-$DEPLOY_BRANCH"
if [ "$head" != "$(cat "$marker" 2>/dev/null || true)" ] || [ "${1:-}" = "--force" ]; then
  # CI tags each build with the base it was built for; refuse one meant for another server.
  built_base="$(git -C "$dist" log -1 --format=%B | sed -n 's/^Site-Base: //p' | tail -1)"
  if [ -n "$built_base" ] && [ "${built_base%/}/" != "$SITE_BASE" ]; then
    echo "$(date -Is) not deployed: $DEPLOY_BRANCH was built for base $built_base, deploy.env says $SITE_BASE" >&2
    exit 1
  fi
  SRC="$dist" "$here/scripts/deploy.sh" prod >/dev/null
  echo "$head" > "$marker"
  echo "$(date -Is) deployed: $(git -C "$dist" log -1 --format=%s)"
fi
