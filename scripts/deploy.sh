#!/bin/bash
# Deploys the latest code on the server: pull, install, back up the database,
# run migrations, build and restart. Run it from the checkout on the server
# (GitHub Actions does this for you on every push to main, see
# .github/workflows/deploy.yml):
#
#   bash scripts/deploy.sh
#
# Settings (environment variables, all optional):
#   BRANCH   git branch to deploy               (default: main)
#   SERVICE  systemd service to restart         (default: masjid-website)
#   DB_FILE  SQLite file to back up, if any     (default: masjid.db)

set -euo pipefail

BRANCH=${BRANCH:-main}
SERVICE=${SERVICE:-masjid-website}
DB_FILE=${DB_FILE:-masjid.db}
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

# Pull, then re-run this script so changes to it apply to this deploy too.
if [ -z "${DEPLOY_RELOADED:-}" ]; then
    echo "Updating $DIR to origin/$BRANCH..."
    git fetch origin
    git checkout "$BRANCH"
    git pull --ff-only origin "$BRANCH"
    export DEPLOY_RELOADED=1
    exec bash "$DIR/scripts/deploy.sh" "$@"
fi

pnpm install --frozen-lockfile

# Back up the SQLite database before migrating; keep the 10 most recent.
if [ -f "$DB_FILE" ]; then
    BACKUP="$DB_FILE.bak-$(date +%Y%m%d-%H%M%S)"
    cp "$DB_FILE" "$BACKUP"
    echo "Backed up database to $BACKUP"
    ls -1t "$DB_FILE".bak-* 2>/dev/null | tail -n +11 | xargs -r rm --
fi

pnpm payload migrate
pnpm build

sudo systemctl restart "$SERVICE"
sleep 2
systemctl is-active --quiet "$SERVICE" && echo "✓ Deployed ($SERVICE is running)"
