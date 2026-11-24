# Public API

Everything the public website shows can also be read as JSON, with no key, from Payload's
[REST API](https://payloadcms.com/docs/rest-api/overview). Use it for a Discord or WhatsApp bot, a display at another
venue, a mosque directory, or a widget on a partner website. To **change** content from a script, use the MCP endpoint
with a key instead (see [MCP.md](MCP.md) and `examples/mcp/mcp-call.sh`): it has per-key permissions.

| What | Request |
| --- | --- |
| Upcoming events | `GET /api/events?where[status][equals]=published&where[endDate][greater_than_equal]=<now ISO>&sort=startDate&depth=0` |
| One event | `GET /api/events?where[slug][equals]=community-family-day` |
| Jumu'ah sessions and note | `GET /api/globals/jumuah-times` |
| Name, address, contacts, services, Mawaqit page | `GET /api/globals/site-settings` |
| Announcements (newest first) | `GET /api/announcements?sort=-publishedAt` |
| Madrasah page content | `GET /api/globals/madrasah` |
| Pages (About, …) | `GET /api/pages?where[slug][equals]=about` |

Useful query options: `limit`, `page`, `sort` (`-` for descending), `depth=0` (don't expand images and relations), and
`select[field]=true` to return only some fields. Prayer times themselves come from Mawaqit
(`https://mawaqit.net/en/<your-page>`), not from this API.

Recurring events are stored once with a `recurring` rule (`frequency` weekly/monthly, `interval`, `daysOfWeek`,
`until`). [`src/lib/recurrence.ts`](../src/lib/recurrence.ts) turns that into dates and has no dependencies, so you can
copy it.

## Examples

- [`examples/api/upcoming-events.sh`](../examples/api/upcoming-events.sh): curl.
- [`examples/api/prayer-info.mjs`](../examples/api/prayer-info.mjs): Node.js 18+ (`SITE=https://your-site node prayer-info.mjs`).

```js
const res = await fetch('https://your-site/api/globals/jumuah-times')
const { sessions, note } = await res.json()
// sessions: [{ label: "Main Jumu'ah", jamaatTime: '13:45', khutbahTime: '13:15', location: 'Main hall', postcode: '…' }]
```

## Calling from another website in the browser

Browsers block calls to another domain unless that domain allows it. To let a partner site call the API from its own
pages, list it in `.env` and restart:

```bash
CORS_ORIGINS=https://partner-site.example,https://another.example
```

Calls from a server, a bot or a script don't need this.
