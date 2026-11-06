#!/usr/bin/env bash
set -euo pipefail

# Resolve the project from this script, so it works from any current directory.
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

key=''
hostname=''
service='startup'
check_only=false
usage() {
  printf 'Usage: bash scripts/deployService.sh -k <pem-file> -h <hostname> [-s startup]\n'
  printf 'Local checks only: bash scripts/deployService.sh -n\n'
}
while getopts ':k:h:s:n' flag; do
  case "$flag" in
    k) key="$OPTARG" ;;
    h) hostname="$OPTARG" ;;
    s) service="$OPTARG" ;;
    n) check_only=true ;;
    *) usage >&2; exit 1 ;;
  esac
done
shift "$((OPTIND - 1))"
[[ "$#" -eq 0 ]] || { usage >&2; exit 1; }
# This app uses startup's course port 4000. Do not replace Simon on port 3000.
[[ "$service" == 'startup' ]] || { printf 'This script deploys only the startup service on port 4000.\n' >&2; exit 1; }
if [[ "$check_only" == false ]]; then
  [[ -f "$key" ]] || { printf 'Provide an existing SSH key with -k.\n' >&2; exit 1; }
  [[ "$hostname" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { printf 'Provide a hostname (without https://) with -h.\n' >&2; exit 1; }
fi

printf 'Checking dependencies, testing the service, and building React...\n'
if [[ "$check_only" == true ]]; then
  npm ls --depth=0
else
  npm ci --no-audit --no-fund
fi
node --test service/game.test.cjs
npm run build

package_dir="$(mktemp -d)"
archive="$package_dir/startup.tgz"
cleanup() { rm -f -- "$archive"; rmdir -- "$package_dir"; }
trap cleanup EXIT
# Explicitly include runtime files; never include the SSH key or local modules.
tar -czf "$archive" package.json package-lock.json ecosystem.config.js service/index.js service/telemetry.js dist
tar -tzf "$archive"
if [[ "$check_only" == true ]]; then
  printf 'Local checks passed. Package verified; no server connection was made.\n'
  exit 0
fi

# Prepare the exact course service directory and check prerequisites before upload.
ssh -i "$key" "ubuntu@$hostname" 'bash -s' <<'REMOTE'
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then . "$NVM_DIR/nvm.sh"; fi
command -v node >/dev/null
command -v npm >/dev/null
command -v pm2 >/dev/null
mkdir -p "$HOME/services/startup"
REMOTE
scp -i "$key" "$archive" "ubuntu@$hostname:services/startup/.incoming.tgz"
ssh -i "$key" "ubuntu@$hostname" 'bash -s' <<'REMOTE'
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then . "$NVM_DIR/nvm.sh"; fi
cd "$HOME/services/startup"
tar -xzf .incoming.tgz
npm ci --omit=dev --no-audit --no-fund
# Recreate this named process so an old course placeholder cannot retain its entry point.
if pm2 describe startup >/dev/null 2>&1; then pm2 delete startup; fi
pm2 start ecosystem.config.js --only startup

healthy=false
for ((attempt = 0; attempt < 15; attempt++)); do
  if node -e 'fetch("http://127.0.0.1:4000/api/health", { signal: AbortSignal.timeout(2000) }).then(async r => { if (!r.ok || (await r.json()).status !== "ok") process.exit(1); }).catch(() => process.exit(1))'; then
    healthy=true
    break
  fi
  sleep 1
done
if [[ "$healthy" != true ]]; then
  pm2 logs startup --lines 30 --nostream
  printf 'Service health check failed.\n' >&2
  exit 1
fi
pm2 save
rm -f -- .incoming.tgz
printf 'Startup is responding on port 4000. Verify the public HTTPS URL next.\n'
REMOTE
printf 'Deployment finished. Check https://startup.%s/api/health if -h is your base domain.\n' "$hostname"
