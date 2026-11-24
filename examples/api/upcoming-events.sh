#!/bin/bash
# Upcoming published events from the public REST API (no key needed).
#   SITE=https://example.org ./upcoming-events.sh
set -euo pipefail
: "${SITE:?Set SITE, e.g. https://example.org}"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
curl -sS -G "$SITE/api/events" \
  --data-urlencode 'where[status][equals]=published' \
  --data-urlencode "where[endDate][greater_than_equal]=$NOW" \
  --data-urlencode 'sort=startDate' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'depth=0' \
  --data-urlencode 'select[title]=true' \
  --data-urlencode 'select[startDate]=true' \
  --data-urlencode 'select[endDate]=true' \
  --data-urlencode 'select[location]=true'
