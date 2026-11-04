# Sourced by update_site.sh, scripts/pull-deploy.sh and scripts/deploy.sh.
# Loads this server's deploy.env (repo root, git-ignored). There are no defaults:
# a missing file or setting stops the script before anything is touched.
_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ ! -f "$_repo_root/deploy.env" ]; then
  echo "No $_repo_root/deploy.env. Create it from the template and set every value:" >&2
  echo "  cp $_repo_root/deploy.env.example $_repo_root/deploy.env" >&2
  exit 1
fi
# Start from empty so nothing leaks in from the environment.
unset DEPLOY_BRANCH SITE_BASE PUBLIC_URL WEB_ROOT KEEP DIST_DIR STATE_DIR GH_REPO
# shellcheck disable=SC1091
. "$_repo_root/deploy.env"

_missing=""
for _v in DEPLOY_BRANCH SITE_BASE PUBLIC_URL WEB_ROOT DIST_DIR STATE_DIR GH_REPO; do
  [ -n "${!_v:-}" ] || _missing="$_missing $_v"
done
# KEEP may be empty on purpose, but it must be set.
[ -n "${KEEP+set}" ] || _missing="$_missing KEEP"
if [ -n "$_missing" ]; then
  echo "$_repo_root/deploy.env is missing:$_missing (see deploy.env.example)" >&2
  exit 1
fi
unset _repo_root _missing _v

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
