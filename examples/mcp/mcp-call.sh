#!/bin/bash
# Call the site's MCP endpoint from the command line or a script — handy for
# automations (a WhatsApp bot, a spreadsheet sync, a cron job) and for testing
# a key before adding it to Claude.
#
#   export SITE=https://example.org
#   export MCP_KEY=...            # Admin → MCP → API Keys
#   ./mcp-call.sh list                                   # tools this key may use
#   ./mcp-call.sh call findEvents '{"limit": 3}'
#   ./mcp-call.sh call findJumuahTimes '{}'
#   ./mcp-call.sh call updateJumuahTimes '{"note": "Doors open at 12:15 this week"}'
#
# Each call is one stateless JSON-RPC request; the reply is printed as JSON.

set -euo pipefail
: "${SITE:?Set SITE, e.g. https://example.org}"
: "${MCP_KEY:?Set MCP_KEY to an MCP API key}"

case "${1:-}" in
  list) body='{"jsonrpc":"2.0","id":1,"method":"tools/list"}' ;;
  call)
    tool=${2:?Name the tool, e.g. findEvents}
    args=${3:-'{}'}
    body="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool\",\"arguments\":$args}}"
    ;;
  *) echo "Usage: $0 list | call <tool> ['<json arguments>']" >&2; exit 1 ;;
esac

# The endpoint answers as a server-sent event; print just the JSON payload.
curl -sS --fail-with-body "$SITE/api/mcp" \
  -H "Authorization: Bearer $MCP_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d "$body" | sed -n 's/^data: //p'
