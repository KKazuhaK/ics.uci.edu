#!/usr/bin/env bash
# Bring the live site up to date with GitHub main, now (the cron job does the
# same every 5 minutes without waiting for CI).
#   ./update_site.sh           wait for CI on the latest main commit, then publish its build
#   ./update_site.sh --force   republish the current build even if nothing changed
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
repo="KKazuhaK/ics.uci.edu"

echo "→ Pulling ~/site"
git pull -q --ff-only || { echo "  ~/site has local commits or edits that block a fast-forward; publishing what CI built anyway"; }
head="$(git rev-parse origin/main)"
echo "  main is at $(git log -1 --format='%h %s' "$head")"

if command -v gh >/dev/null 2>&1; then
  run="$(gh run list --repo "$repo" --workflow site --commit "$head" --limit 1 --json databaseId,status,conclusion --jq '.[0] | "\(.databaseId) \(.status) \(.conclusion)"' 2>/dev/null || true)"
  if [ -z "$run" ]; then
    echo "  no CI run found for this commit yet (just pushed?); publishing the latest finished build"
  else
    read -r id status conclusion <<<"$run"
    if [ "$status" != "completed" ]; then
      echo "→ CI is still building this commit; waiting…"
      gh run watch "$id" --repo "$repo" --interval 10 --exit-status >/dev/null 2>&1 && conclusion=success || conclusion=failure
    fi
    if [ "$conclusion" != "success" ]; then
      echo "✗ CI failed for this commit, so it was not published. The live site keeps the last good build."
      echo "  Details: gh run view $id --repo $repo --log-failed"
      echo "           https://github.com/$repo/actions/runs/$id"
      exit 1
    fi
    echo "  CI passed"
  fi
else
  echo "  (gh not available; skipping the CI status check)"
fi

echo "→ Publishing"
out="$(scripts/pull-deploy.sh "$@")"
if [ -n "$out" ]; then echo "  ${out#* }"; else echo "  already live: $(git -C "$HOME/site-dist" log -1 --format=%s)"; fi
echo "✓ https://ics.uci.edu/~kazuhak/"
