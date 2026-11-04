#!/usr/bin/env bash
# Bring the live site up to date with GitHub main, now (the cron job does the
# same on its schedule without waiting for CI). Settings: deploy.env (copy of
# deploy.env.example; without it the defaults are the UCI ICS server).
#   ./update_site.sh                  wait for CI on the latest main commit, then publish its build
#   ./update_site.sh --force          republish the current build even if nothing changed
#   ./update_site.sh --install-cron   add (or replace) the cron entry for scripts/pull-deploy.sh
#   ./update_site.sh --remove-cron    remove that cron entry
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
. scripts/deploy-env.sh
repo="$GH_REPO"

case "${1:-}" in
  --install-cron|--remove-cron)
    command -v crontab >/dev/null || { echo "crontab is not installed" >&2; exit 1; }
    job="$PWD/scripts/pull-deploy.sh"
    for p in "$job" "$LOG_FILE"; do
      case "$p" in *"'"*|*%*) echo "path not usable in a cron line (quote or %): $p" >&2; exit 1 ;; esac
    done
    mkdir -p "$(dirname "$LOG_FILE")"
    # Drop any existing entry for pull-deploy.sh (also commented-out ones), keep everything else.
    if current="$(crontab -l 2>&1)"; then :
    elif printf '%s' "$current" | grep -qi "no crontab"; then current=""
    else echo "crontab -l failed: $current" >&2; exit 1
    fi
    kept="$(printf '%s\n' "$current" | grep -vF "scripts/pull-deploy.sh" | sed '/^$/d' || true)"
    if [ "$1" = --install-cron ]; then
      entry="$CRON_SCHEDULE '$job' >> '$LOG_FILE' 2>&1"
      { [ -n "$kept" ] && printf '%s\n' "$kept"; printf '%s\n' "$entry"; } | crontab -
      echo "✓ cron: $entry"
    else
      if [ -n "$kept" ]; then printf '%s\n' "$kept" | crontab -; else crontab -r 2>/dev/null || true; fi
      echo "✓ removed the pull-deploy.sh cron entry"
    fi
    exit 0 ;;
esac

echo "→ Pulling $PWD"
git pull -q --ff-only || { echo "  $PWD has local commits or edits that block a fast-forward; publishing what CI built anyway"; }
. scripts/deploy-env.sh  # again: the pull may have changed the defaults
head="$(git rev-parse origin/main)"
echo "  main is at $(git log -1 --format='%h %s' "$head")"

if command -v gh >/dev/null 2>&1; then
  run="$(gh run list --repo "$repo" --workflow site --commit "$head" --limit 1 --json databaseId,status,conclusion --jq '.[0] | "\(.databaseId) \(.status) \(.conclusion)"' 2>/dev/null || true)"
  if [ -z "$run" ]; then
    echo "  no CI run found for this commit yet (just pushed?); publishing the latest finished build"
  else
    read -r id _ _ <<<"$run"
    # Only the `build` job decides what reaches the servers; the `pages` job
    # (GitHub Pages mirror) can fail or still be running without affecting them.
    build_job() { gh run view "$id" --repo "$repo" --json jobs --jq '.jobs[] | select(.name == "build") | "\(.status) \(.conclusion)"' 2>/dev/null || true; }
    read -r status conclusion <<<"$(build_job)"
    if [ "$status" != "completed" ]; then
      echo "→ CI is still building this commit; waiting…"
      for _ in $(seq 90); do  # give up after ~15 minutes
        sleep 10
        read -r status conclusion <<<"$(build_job)"
        [ "$status" = "completed" ] && break
      done
      [ "$status" = "completed" ] || conclusion=timeout
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
if [ -n "$out" ]; then echo "  ${out#* }"; else echo "  already live: $(git -C "$DIST_DIR" log -1 --format=%s)"; fi
echo "✓ $PUBLIC_URL"
