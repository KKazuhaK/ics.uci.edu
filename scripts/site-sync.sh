#!/usr/bin/env bash
# site-sync.sh: keep a server's web root in sync with a prebuilt site branch.
# CI builds every "branch" target in deploy/targets.json and force-pushes it to
# that target's branch; this fetches the branch and rsyncs it into the web root.
# Needs only bash, git, rsync, flock (and gh for `now`, optional). No Node.
#
#   site-sync.sh init NAME                          write ~/.config/kzh-site/NAME.conf
#   site-sync.sh [-c CONF] sync [--dry-run] [--force] [--adopt]
#                                                   publish if the branch moved (cron runs this)
#   site-sync.sh [-c CONF] now [--force]            wait for CI on the latest main commit, then sync
#   site-sync.sh [-c CONF] status                   config, deployed build, cron entry
#   site-sync.sh [-c CONF] install-cron [MINUTES] [--replace-legacy]
#   site-sync.sh [-c CONF] uninstall-cron
#
# CONF defaults to $SITE_SYNC_CONF, else the only *.conf in ~/.config/kzh-site/.
# See "Servers" in CLAUDE.md for setup.
set -euo pipefail
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin"

self="$(readlink -f "$0")"
here="$(dirname "$self")"
conf_dir="$HOME/.config/kzh-site"

die() { echo "site-sync: $*" >&2; exit 1; }
say() { echo "$(date '+%Y-%m-%dT%H:%M:%S%z') $*"; }
usage() { sed -n '6,13p' "$self" | sed 's/^# \{0,1\}//' >&2; exit 2; }

# ── Config ─────────────────────────────────────
conf=""
if [ "${1:-}" = "-c" ]; then
  [ -n "${2:-}" ] || usage
  conf="$2"; shift 2
fi
cmd="${1:-}"; [ -n "$cmd" ] || usage; shift

find_conf() {
  [ -n "$conf" ] && return
  if [ -n "${SITE_SYNC_CONF:-}" ]; then conf="$SITE_SYNC_CONF"; return; fi
  local found=()
  [ -d "$conf_dir" ] && for f in "$conf_dir"/*.conf; do [ -e "$f" ] && found+=("$f"); done
  case "${#found[@]}" in
    1) conf="${found[0]}" ;;
    0) die "no config; run: $self init NAME" ;;
    *) die "several configs in $conf_dir; pick one with -c" ;;
  esac
}

load_conf() {
  find_conf
  [ -f "$conf" ] || die "config not found: $conf"
  conf="$(readlink -f "$conf")"
  TARGET="" BRANCH="" WEB_ROOT="" KEEP=() CHECKOUT="" STATE_DIR="" CHMOD="D755,F644" SELF_UPDATE=1
  REPO="https://github.com/KKazuhaK/ics.uci.edu.git" GH_REPO="KKazuhaK/ics.uci.edu" CI_JOB="build"
  # shellcheck disable=SC1090
  . "$conf"
  local tool
  for tool in git rsync flock; do command -v "$tool" >/dev/null || die "$tool is not installed"; done
  [ -n "$TARGET" ] || die "$conf: TARGET is not set"
  case "$TARGET" in *[!A-Za-z0-9_-]*) die "$conf: TARGET may only use letters, digits, - and _" ;; esac
  [ -n "$BRANCH" ] || die "$conf: BRANCH is not set"
  [ -n "$WEB_ROOT" ] || die "$conf: WEB_ROOT is not set"
  case "$WEB_ROOT" in /*) ;; *) die "$conf: WEB_ROOT must be an absolute path" ;; esac
  WEB_ROOT="${WEB_ROOT%/}"
  STATE_DIR="${STATE_DIR:-$HOME/.cache/kzh-site/$TARGET}"
  CHECKOUT="${CHECKOUT:-$STATE_DIR/build}"
  mkdir -p "$STATE_DIR"
}

# Value of a commit-message trailer in the fetched build ("" if absent).
trailer() { git -C "$CHECKOUT" log -1 --format=%B 2>/dev/null | sed -n "s/^$1: //p" | tail -1; }

# ── init ───────────────────────────────────────
target_field() {  # NAME KEY from deploy/targets.json next to this script, if readable
  local file="$here/../deploy/targets.json"
  [ -f "$file" ] || return 0
  if command -v python3 >/dev/null; then
    python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get(sys.argv[2],{}).get(sys.argv[3],""))' "$file" "$1" "$2" 2>/dev/null || true
  elif command -v node >/dev/null; then
    node -e 'const t=require(process.argv[1])[process.argv[2]]||{};console.log(t[process.argv[3]]??"")' "$(readlink -f "$file")" "$1" "$2" 2>/dev/null || true
  fi
}

cmd_init() {
  local name="${1:-}"; [ -n "$name" ] || die "usage: init NAME (a target name in deploy/targets.json)"
  local out="$conf_dir/$name.conf"
  [ -e "$out" ] && die "$out already exists"
  mkdir -p "$conf_dir"
  local example="$here/../deploy/$name.conf.example"
  if [ -f "$example" ]; then
    cp "$example" "$out"
  else
    local kind branch
    kind="$(target_field "$name" kind)"; branch="$(target_field "$name" branch)"
    [ -z "$kind" ] && echo "note: \"$name\" is not in deploy/targets.json yet; add it there so CI builds it" >&2
    [ -n "$kind" ] && [ "$kind" != "branch" ] && die "\"$name\" is a \"$kind\" target, not a server (branch) target"
    cat > "$out" <<EOF
# site-sync.sh config for the "$name" target (sourced by bash).
TARGET=$name                 # name in deploy/targets.json; checked against each build's Site-Target
BRANCH=${branch:-deploy-$name}         # that target's branch in deploy/targets.json
WEB_ROOT=\$HOME/public_html   # directory the web server serves; becomes build output only

# Paths under WEB_ROOT that are not built from the repo. They are never
# touched; everything else there is replaced or deleted on each sync.
KEEP=(
  "assets/config/*.local.json"
)

# Optional:
# REPO=https://github.com/KKazuhaK/ics.uci.edu.git
# GH_REPO=KKazuhaK/ics.uci.edu    # for \`now\` (needs gh)
# CHECKOUT=\$HOME/.cache/kzh-site/$name/build
# CHMOD=D755,F644
# SELF_UPDATE=1                   # fast-forward the repo this script runs from before each sync
EOF
  fi
  echo "Wrote $out"
  echo "Next: edit it, then run"
  echo "  $self -c $out sync --dry-run --adopt"
}

# ── sync ───────────────────────────────────────
cmd_sync() {
  local dry="" force="" adopt=""
  for a in "$@"; do
    case "$a" in
      --dry-run) dry=1 ;; --force) force=1 ;; --adopt) adopt=1 ;;
      *) die "sync: unknown option $a" ;;
    esac
  done
  load_conf

  exec 9>"$STATE_DIR/lock"
  flock -n 9 || { [ -t 1 ] && echo "another sync is running"; exit 0; }

  # Keep the script itself current when it runs from a checkout of the repo.
  if [ "$SELF_UPDATE" = 1 ] && git -C "$here" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$here" pull -q --ff-only 2>/dev/null || say "note: $(git -C "$here" rev-parse --show-toplevel) not fast-forwarded (local commits or conflicts)"
  fi

  # Fetch the build branch.
  if [ ! -d "$CHECKOUT/.git" ]; then
    mkdir -p "$(dirname "$CHECKOUT")"
    git clone -q --depth 1 --branch "$BRANCH" "$REPO" "$CHECKOUT" || die "could not clone $REPO branch $BRANCH"
  else
    git -C "$CHECKOUT" fetch -q --depth 1 origin "$BRANCH" || die "could not fetch $BRANCH"
    if [ "$(git -C "$CHECKOUT" rev-parse HEAD)" != "$(git -C "$CHECKOUT" rev-parse FETCH_HEAD)" ]; then
      git -C "$CHECKOUT" reset -q --hard FETCH_HEAD
      git -C "$CHECKOUT" gc -q --prune=now
    fi
  fi
  local head deployed=""
  head="$(git -C "$CHECKOUT" rev-parse HEAD)"
  [ -f "$STATE_DIR/deployed" ] && deployed="$(cat "$STATE_DIR/deployed")"
  # A different WEB_ROOT than the last sync means nothing is deployed there yet.
  [ -f "$STATE_DIR/adopted" ] && [ "$(cat "$STATE_DIR/adopted")" != "$(readlink -f "$WEB_ROOT" 2>/dev/null || echo "$WEB_ROOT")" ] && deployed=""
  if [ "$head" = "$deployed" ] && [ -z "$force" ] && [ -z "$dry" ]; then
    [ -t 1 ] && echo "already live: $(git -C "$CHECKOUT" log -1 --format=%s)"
    return 0
  fi

  # The build must have been made for this target (and so for this base path).
  local built_for; built_for="$(trailer Site-Target)"
  [ "$built_for" = "$TARGET" ] || die "branch $BRANCH holds a build for \"${built_for:-unknown (no Site-Target)}\", not \"$TARGET\"; check BRANCH in $conf and deploy/targets.json"
  [ -f "$CHECKOUT/index.html" ] || die "branch $BRANCH has no index.html"

  # Web root guards: rsync --delete must only ever run on a dedicated directory.
  local real home_real
  mkdir -p "$WEB_ROOT"
  real="$(readlink -f "$WEB_ROOT")"; home_real="$(readlink -f "$HOME")"
  case "$real" in /|"$home_real"|/home|/var|/usr|/etc|/srv) die "refusing to sync into $real" ;; esac
  local inside
  for inside in "$(readlink -f "$CHECKOUT")" "$(readlink -f "$STATE_DIR")" "$here"; do
    case "$inside/" in "$real"/*) die "refusing to sync into $real: it contains $inside" ;; esac
  done
  [ -e "$real/.git" ] && die "$real/.git exists; move it aside (e.g. mv $real/.git $real.git.bak) first"
  if [ ! -f "$STATE_DIR/adopted" ] || [ "$(cat "$STATE_DIR/adopted")" != "$real" ]; then
    if [ -n "$(ls -A "$real")" ] && [ -z "$adopt" ]; then
      die "$real is not empty and has not been synced by this config before. Check with
  $self -c $conf sync --dry-run --adopt
then run it without --dry-run. Anything not listed in KEEP gets deleted."
    fi
  fi

  local args=(-a --delete "--chmod=$CHMOD" --exclude=/.git/)
  local k
  for k in ${KEEP[@]+"${KEEP[@]}"}; do k="${k#/}"; args+=("--exclude=/$k"); done
  if [ -n "$dry" ]; then
    echo "Dry run: $(git -C "$CHECKOUT" log -1 --format=%s) → $real"
    echo "  (KEEP: ${KEEP[*]+${KEEP[*]}})"
    rsync "${args[@]}" -n --itemize-changes "$CHECKOUT/" "$real/" | awk '
      /^\*deleting/ { del++; if (del <= 50) print "  delete  " substr($0, index($0, $2)); next }
      { chg++ }
      END { printf "  %d files to add or update, %d to delete%s\n", chg, del, (del > 50 ? " (first 50 shown)" : "") }'
    return 0
  fi
  rsync "${args[@]}" "$CHECKOUT/" "$real/"
  echo "$head" > "$STATE_DIR/deployed"
  echo "$real" > "$STATE_DIR/adopted"
  say "deployed $TARGET: $(git -C "$CHECKOUT" log -1 --format=%s)"
}

# ── now ────────────────────────────────────────
cmd_now() {
  local force=""
  for a in "$@"; do case "$a" in --force) force=1 ;; *) die "now: unknown option $a" ;; esac; done
  load_conf
  local main; main="$(git ls-remote "$REPO" refs/heads/main | cut -f1)"
  [ -n "$main" ] || die "could not read main from $REPO"
  echo "→ main is at ${main:0:7}"
  if command -v gh >/dev/null 2>&1; then
    local id; id="$(gh run list --repo "$GH_REPO" --workflow site --commit "$main" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"
    if [ -z "$id" ]; then
      echo "  no CI run for this commit yet (just pushed?); publishing the latest finished build"
    else
      job() { gh run view "$id" --repo "$GH_REPO" --json jobs --jq ".jobs[] | select(.name == \"$CI_JOB\") | \"\(.status) \(.conclusion)\"" 2>/dev/null || true; }
      local status conclusion
      read -r status conclusion <<<"$(job)"
      if [ "$status" != "completed" ]; then
        echo "→ CI is still building this commit; waiting…"
        for _ in $(seq 90); do sleep 10; read -r status conclusion <<<"$(job)"; [ "$status" = "completed" ] && break; done
        [ "$status" = "completed" ] || conclusion=timeout
      fi
      if [ "$conclusion" != "success" ]; then
        echo "✗ CI $CI_JOB job: ${conclusion:-unknown}. Not published; the live site keeps the last good build."
        echo "  https://github.com/$GH_REPO/actions/runs/$id"
        exit 1
      fi
      echo "  CI passed"
    fi
  else
    echo "  (gh not available; skipping the CI status check)"
  fi
  echo "→ Publishing"
  cmd_sync ${force:+--force}
  local src; src="$(trailer Source-Commit)"
  [ -n "$src" ] && [ "$src" != "$main" ] && echo "  note: live build is from ${src:0:7}, not main ${main:0:7} (CI may still be pushing)"
  return 0
}

# ── status ─────────────────────────────────────
cmd_status() {
  load_conf
  echo "config:    $conf"
  echo "target:    $TARGET (branch $BRANCH of $REPO)"
  echo "web root:  $WEB_ROOT"
  echo "keep:      ${KEEP[*]+${KEEP[*]}}"
  if [ -d "$CHECKOUT/.git" ]; then
    echo "fetched:   $(git -C "$CHECKOUT" log -1 --format='%h %s (%cr)')"
  else
    echo "fetched:   nothing yet"
  fi
  if [ -f "$STATE_DIR/deployed" ]; then
    echo "deployed:  $(cut -c1-7 "$STATE_DIR/deployed")"
  else
    echo "deployed:  never"
  fi
  local line; line="$(crontab -l 2>/dev/null | grep -E "# site-sync:${TARGET}\$" || true)"
  echo "cron:      ${line:-not installed}"
  crontab -l 2>/dev/null | grep -F "scripts/pull-deploy.sh" | sed 's/^/legacy:    /' || true
  [ -f "$STATE_DIR/sync.log" ] && { echo "log:       $STATE_DIR/sync.log"; tail -3 "$STATE_DIR/sync.log" | sed 's/^/           /'; }
  return 0
}

# ── cron ───────────────────────────────────────
cmd_install_cron() {
  local min=5 legacy=""
  for a in "$@"; do
    case "$a" in
      --replace-legacy) legacy=1 ;;
      ''|*[!0-9]*) die "install-cron: unknown option $a" ;;
      *) min="$a" ;;
    esac
  done
  [ "$min" -ge 1 ] && [ "$min" -le 59 ] || die "MINUTES must be 1-59"
  load_conf
  command -v crontab >/dev/null || die "crontab not found"
  local entry
  local p
  for p in "$self" "$conf" "$STATE_DIR"; do
    case "$p" in *"'"*|*%*|*$'\n'*) die "path not usable in a cron line (quote, % or newline): $p" ;; esac
  done
  entry="*/$min * * * * '$self' -c '$conf' sync >> '$STATE_DIR/sync.log' 2>&1 # site-sync:$TARGET"
  local current; current="$(crontab -l 2>/dev/null || true)"
  local kept; kept="$(printf '%s\n' "$current" | grep -vE "# site-sync:${TARGET}\$" || true)"
  if [ -n "$legacy" ]; then
    printf '%s\n' "$kept" | grep -F "scripts/pull-deploy.sh" | sed 's/^/removed legacy: /' || true
    kept="$(printf '%s\n' "$kept" | grep -vF "scripts/pull-deploy.sh" || true)"
  elif printf '%s\n' "$kept" | grep -qF "scripts/pull-deploy.sh"; then
    echo "note: the old pull-deploy.sh cron entry is still installed; rerun with --replace-legacy to remove it" >&2
  fi
  { [ -n "$kept" ] && printf '%s\n' "$kept"; printf '%s\n' "$entry"; } | crontab -
  echo "installed: $entry"
}

cmd_uninstall_cron() {
  load_conf
  local kept; kept="$(crontab -l 2>/dev/null | grep -vE "# site-sync:${TARGET}\$" || true)"
  if [ -n "$kept" ]; then printf '%s\n' "$kept" | crontab -; else crontab -r 2>/dev/null || true; fi
  echo "removed the site-sync:$TARGET cron entry"
}

case "$cmd" in
  init) cmd_init "$@" ;;
  sync) cmd_sync "$@" ;;
  now) cmd_now "$@" ;;
  status) cmd_status ;;
  install-cron) cmd_install_cron "$@" ;;
  uninstall-cron) cmd_uninstall_cron ;;
  -h|--help|help) usage ;;
  *) usage ;;
esac
