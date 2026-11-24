# Security

Please **don't** open a public issue for a security problem. Report it privately through GitHub's
**Security → Report a vulnerability** on this repository, with steps to reproduce. You'll get a reply as soon as possible.

When running the kit:

- keep `.env` (especially `PAYLOAD_SECRET`) and MCP API keys secret: one key per person, deleted when they leave;
- every admin user must use two-factor login (enforced);
- keep the server updated (`apt upgrade`) and take off-server backups (docs/BACKUPS.md).
