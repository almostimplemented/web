#!/usr/bin/env bash
# Deploy the site to the nginx server with rsync.
#
#   ./deploy.sh                      # host almostimplemented.com, docroot read from nginx config
#   ./deploy.sh root@almostimplemented.com /var/www/html
#
# Env overrides: DEPLOY_HOST, DEPLOY_PATH.
# Opens one SSH connection and reuses it, so password auth prompts once.
set -euo pipefail
cd "$(dirname "$0")"

HOST="${1:-${DEPLOY_HOST:-almostimplemented.com}}"
REMOTE_PATH="${2:-${DEPLOY_PATH:-}}"

CTL="/tmp/deploy-ssh-$$"
SSH_OPTS=(-o ControlMaster=auto -o "ControlPath=$CTL" -o ControlPersist=120)
cleanup() { ssh -o "ControlPath=$CTL" -O exit "$HOST" 2>/dev/null || true; }
trap cleanup EXIT

echo "Connecting to $HOST (enter your password if prompted)..."
ssh "${SSH_OPTS[@]}" -fN "$HOST"

if [ -z "$REMOTE_PATH" ]; then
  REMOTE_PATH="$(ssh "${SSH_OPTS[@]}" "$HOST" "grep -rhoE '^[[:space:]]*root[[:space:]]+[^;]+' /etc/nginx/sites-enabled /etc/nginx/conf.d /etc/nginx/nginx.conf 2>/dev/null | awk '{print \$2}' | head -1" || true)"
fi
if [ -z "$REMOTE_PATH" ]; then
  echo "Could not read the document root from nginx on $HOST. Pass it as the second argument." >&2
  exit 1
fi

echo "Deploying to $HOST:$REMOTE_PATH"
rsync -avz -e "ssh ${SSH_OPTS[*]}" \
  --exclude '.git' --exclude '.DS_Store' --exclude 'deploy.sh' --exclude 'README.md' \
  ./ "$HOST:$REMOTE_PATH/"

# Leftovers from the old shared host that the new site no longer ships.
ssh "${SSH_OPTS[@]}" "$HOST" "cd '$REMOTE_PATH' && rm -f 400.shtml 401.shtml 403.shtml 500.shtml 500.php error_log default.html"
echo "Done: https://almostimplemented.com/"
