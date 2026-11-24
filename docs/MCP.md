# Managing the site from Claude (MCP)

The site has an [MCP](https://modelcontextprotocol.io) endpoint at `/api/mcp`. Connect it to Claude and committee members
can manage content in plain language, from the Claude app on their phone, the web or the desktop:

> "Add a talk on Saturday 14 December at 7pm in the main hall called *The Seerah of the Prophet ﷺ*."
> "Move the second Jumu'ah to 13:30 this Friday and add a note that the car park is closed."
> "Cancel next week's youth football."
> "Here's the poster for the Eid dinner: https://… — attach it to the event."
> "Give me a link to upload a photo from my phone for the family day event."

## How access works

- An **MCP API key** is created by an administrator under **Admin → MCP → API Keys**. Each key:
  - belongs to a **user** and acts with that user's permissions (an editor's key can't change admin-only settings);
  - has its own **on/off switch for every action** (e.g. find and create events, but not delete them);
  - can be switched off or deleted at any time.
- Only administrators can see or create keys.
- Keys skip the two-factor prompt (Claude can't type a 6-digit code), so **treat a key like a password**: one key per
  person, never share it in a group chat, and delete it when someone leaves the committee.
- User accounts and logins are never exposed through MCP.

## What Claude can do

| Content | Actions (each switchable per key) |
| --- | --- |
| Events | find, create, update, delete |
| Announcements | find, create, update, delete |
| Pages (About, …) | find, create, update |
| Media | find |
| Jumu'ah times | find, update |
| Site settings | find, update |
| Madrasah page | find, update |
| Images | `uploadImageFromUrl` (attach a picture from a public `https://` link), `createImageUploadLink` (a one-time, 30-minute link to upload a photo from a phone), `checkImageUploadLink` |

Image uploads are checked: only real images up to 10 MB are accepted, and links pointing at private networks are refused.

## Create a key

1. Sign in at `https://your-site/admin` as an administrator.
2. **MCP → API Keys → Create new**: pick the user it acts as, give it a label (e.g. "Aisha – Claude on phone") and
   switch on the actions it may use.
3. Turn on **Enable API Key**, copy the key, and **Save**.

Test it from a terminal before giving it to Claude:

```bash
export SITE=https://your-site MCP_KEY=the-key
./examples/mcp/mcp-call.sh list
./examples/mcp/mcp-call.sh call findEvents '{"limit": 3}'
```

## Connect Claude

### Claude on the web and the phone apps (claude.ai)

Custom connectors are added on claude.ai and then work in the phone apps too.

1. **Settings → Connectors → Add custom connector.**
2. **URL:** `https://your-site/api/mcp`
3. Under **Advanced settings → Request headers**, add a header named `Authorization` with the value
   `Bearer the-key` (the word *Bearer*, one space, then the key).
4. Save, then switch the connector on in a chat (the tools menu) and ask away.

Which plans can add custom connectors is up to Anthropic and may change; on Team and Enterprise plans an owner may need to allow them first.

### Claude Desktop

Use the same custom-connector steps (Settings → Connectors). Or, to configure it by file, copy
[`examples/mcp/claude-desktop-config.json`](../examples/mcp/claude-desktop-config.json) into
`claude_desktop_config.json` (Settings → Developer → Edit Config), put in your site address and key, and restart.
That route needs Node.js installed.

### Claude Code

Copy [`examples/mcp/claude-code.mcp.json`](../examples/mcp/claude-code.mcp.json) to `.mcp.json` in your project,
replace the address, and put the key in your environment (`export MASJID_MCP_KEY=…`) rather than in the file.

### Other MCP clients and automations

The endpoint speaks standard Streamable HTTP MCP and is stateless: send JSON-RPC `POST`s with
`Authorization: Bearer <key>` and `Accept: application/json, text/event-stream`.
[`examples/mcp/mcp-call.sh`](../examples/mcp/mcp-call.sh) shows the raw requests, and it is a good starting point for
scripts such as a WhatsApp or Telegram bot that posts events.

## Tips for good results

- Times are in the masjid's local time (`NEXT_PUBLIC_SITE_TIMEZONE`); say "7pm" and Claude fills in the date-time.
- New events go live straight away. Ask for a **draft** if you want to check it in the admin panel first.
- Ask Claude to "show me the event before you save it" when you want a review step.

## Adding your own tools

Custom tools live in [`src/mcp`](../src/mcp) (see `imageTools.ts`) and are registered in `src/payload.config.ts`
under `mcpPlugin({ mcp: { tools } })`. Each tool declares a zod schema for its input and checks the caller's role.
Which collections and globals are exposed, and their descriptions (which Claude reads), are also set there.
