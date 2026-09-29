#!/usr/bin/env bash
# One-time setup of the chess-alarm static site on the Winovate droplet.
#
# Run from the repo root on a machine that has the `apigen` SSH alias
# (root on 142.93.1.207):
#
#   ./deploy/setup-droplet.sh
#
# Safe to re-run: every step checks before it changes anything. It follows the
# platform contract (winovate-platform/CLAUDE.md): no ports, no Caddyfile edits,
# Caddy is only recreated through `platformctl caddy-up`, which validates first.
set -euo pipefail

PROJECT=chess-alarm
REPO=Adrian-Piwin/chess-alarm
HOST_ALIAS=${HOST_ALIAS:-apigen}
DROPLET_IP=142.93.1.207
DOMAIN=chess.winovatesolutions.com
ROOT=/opt/platform
COMPOSE=$ROOT/shared/docker-compose.caddy.yml
MOUNT_LINE="      - ../data/$PROJECT:/srv/$PROJECT:ro"

cd "$(dirname "$0")/.."
step() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
remote() { ssh "$HOST_ALIAS" "$@"; }

step "Checking SSH access to $HOST_ALIAS"
remote "command -v platformctl >/dev/null" || { echo "platformctl not found on $HOST_ALIAS"; exit 1; }

step "Registering the project"
if remote "test -d $ROOT/projects/$PROJECT"; then
  echo "already registered"
else
  remote "platformctl new $PROJECT"
fi
# A static site has no compose file or .env (same as winovate-root).
remote "rm -f $ROOT/projects/$PROJECT/docker-compose.yml $ROOT/projects/$PROJECT/.env $ROOT/projects/$PROJECT/.env.example"
remote "cat > $ROOT/projects/$PROJECT/project.yml" < deploy/project.yml
remote "cat > $ROOT/caddy/sites/$PROJECT.caddy" < deploy/chess-alarm.caddy
remote "mkdir -p $ROOT/data/$PROJECT/releases && chown -R deploy:deploy $ROOT/projects/$PROJECT $ROOT/data/$PROJECT"

step "Mounting the release directory into Caddy"
if remote "grep -qF '/srv/$PROJECT:ro' $COMPOSE"; then
  echo "mount already present"
  remote "platformctl reload-caddy"
else
  remote "cp $COMPOSE $COMPOSE.bak-$PROJECT"
  # Insert right after the winovate-root static mount.
  remote "sed -i '\#/srv/winovate-root:ro#a\\$MOUNT_LINE' $COMPOSE"
  remote "grep -qF '/srv/$PROJECT:ro' $COMPOSE" || { echo "failed to add the mount"; exit 1; }
  if ! remote "platformctl caddy-up"; then
    echo "caddy-up failed — restoring the previous compose file"
    remote "cp $COMPOSE.bak-$PROJECT $COMPOSE && platformctl caddy-up"
    exit 1
  fi
fi

step "GitHub Actions secrets"
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  remote 'cat /root/.ssh/gha_deploy' | gh secret set DEPLOY_SSH_KEY --repo "$REPO"
  echo "$DROPLET_IP" | gh secret set DEPLOY_HOST --repo "$REPO"
  echo "DEPLOY_SSH_KEY and DEPLOY_HOST set on $REPO"
else
  cat <<EOF
gh CLI not available/authenticated — set these by hand in
GitHub → $REPO → Settings → Secrets and variables → Actions:
  DEPLOY_SSH_KEY = output of: ssh $HOST_ALIAS 'cat /root/.ssh/gha_deploy'
  DEPLOY_HOST    = $DROPLET_IP
EOF
fi

step "Health check"
remote "platformctl doctor" || true
remote "platformctl list" | grep -E "NAME|$PROJECT" || true

cat <<EOF

Done. Next: merge to main (or run the "Deploy web" workflow) and open
https://$DOMAIN — the first request issues the HTTPS certificate.
Then sync the platform mirror (see deploy/README.md).
EOF
