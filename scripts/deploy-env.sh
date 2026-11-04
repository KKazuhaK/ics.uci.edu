# Sourced by update_site.sh, scripts/pull-deploy.sh and scripts/deploy.sh.
# Loads deploy.env.example (defaults: the UCI ICS server), then deploy.env if this
# server has one, so a deploy.env only needs the lines that differ.
_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
. "$_repo_root/deploy.env.example"
# shellcheck disable=SC1091
[ -f "$_repo_root/deploy.env" ] && . "$_repo_root/deploy.env"
unset _repo_root

WEB_ROOT="${WEB_ROOT%/}"
case "$WEB_ROOT" in /*) ;; *) echo "deploy.env: WEB_ROOT must be an absolute path" >&2; exit 1 ;; esac
# SITE_BASE always ends in "/" from here on ("/~kazuhak/" or "/")
SITE_BASE="${SITE_BASE%/}/"
# KEEP must be one space-separated string; KEEP=(…) would silently keep only its first path.
if declare -p KEEP 2>/dev/null | grep -q '^declare -a'; then
  echo "deploy.env: write KEEP as one quoted string (KEEP=\"a/ b/\"), not KEEP=(…)" >&2; exit 1
fi
# KEEP as an array, without glob expansion (assets/config/*.local.json stays a pattern)
read -r -a KEEP_PATHS <<<"$KEEP"
