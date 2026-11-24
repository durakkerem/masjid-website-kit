import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import type { CollectionConfig, GlobalConfig } from 'payload'
import { payloadTotp } from 'payload-totp'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { isAdmin, publicRead } from './access/roles'
import { Announcements } from './collections/Announcements'
import { Events } from './collections/Events'
import { ImageUploadLinks } from './collections/ImageUploadLinks'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { JumuahTimes } from './globals/JumuahTimes'
import { Madrasah } from './globals/Madrasah'
import { SiteSettings } from './globals/SiteSettings'
import { imageTools } from './mcp/imageTools'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// A single SQLite file. Back it up! (docs/BACKUPS.md)
const databaseUri = process.env.DATABASE_URI || 'file:./masjid.db'

/**
 * The 2FA plugin wraps every access function and refuses anonymous requests.
 * Content that the public website reads (events, prayer times, ...) uses
 * `publicRead`; keep that one rule outside the wrapper so it stays public.
 * Everything else (creating, editing, deleting) still requires 2FA.
 */
function keepPublicReadOpen<T extends CollectionConfig | GlobalConfig>(entity: T): T {
  if (entity.access?.read !== publicRead) return entity
  const totp = (entity.custom?.totp ?? {}) as { disableAccessWrapper?: Record<string, boolean> }
  return {
    ...entity,
    custom: {
      ...entity.custom,
      totp: { ...totp, disableAccessWrapper: { ...totp.disableAccessWrapper, read: true } },
    },
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
  },
  collections: [Users, Media, Events, Announcements, Pages, ImageUploadLinks].map(keepPublicReadOpen),
  globals: [SiteSettings, JumuahTimes, Madrasah].map(keepPublicReadOpen),
  editor: lexicalEditor(),
  // Other websites allowed to read this site's API from a browser (e.g. a
  // widget on a partner site): comma-separated origins in CORS_ORIGINS.
  cors: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: databaseUri,
    },
    // Schema changes always go through migrations (src/migrations), in
    // development too, so a database never ends up half-pushed.
    push: false,
  }),
  sharp,
  plugins: [
    // MCP endpoint at /api/mcp so the committee can manage content from
    // Claude (or any MCP client). Each API key (Admin → MCP → API Keys) belongs to a user, acts
    // with that user's permissions, and has its own on/off switches per action.
    // Users and logins are deliberately not exposed, and the experimental
    // auth/config/collection tools stay off.
    mcpPlugin({
      userCollection: 'users',
      // Image tools (upload from a link, one-time phone upload links). Each is
      // switched on per key under API Keys → Tools.
      mcp: { tools: imageTools },
      // Only admins may see or manage MCP keys. Otherwise any signed-in user
      // could create a key linked to an admin account and act as that admin.
      overrideApiKeyCollection: (collection) => ({
        ...collection,
        access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
      }),
      // An MCP key is a separate secret that only a 2FA-verified admin can
      // create, so treat it like Payload's own API keys, which 2FA exempts.
      // Without this, enforced 2FA would refuse every request from Claude.
      overrideAuth: async (_req, getDefaultMcpAccessSettings) => {
        const settings = await getDefaultMcpAccessSettings()
        const user = settings.user as { _strategy?: string }
        user._strategy = 'api-key'
        return settings
      },
      collections: {
        events: {
          description:
            'Mosque events shown on the website and the entrance TV: title, status (draft/published/cancelled), category, start/end date-times (local time), venue, description and optional weekly/monthly repetition.',
          enabled: { find: true, create: true, update: true, delete: true },
        },
        announcements: {
          description:
            'News and notices on the Announcements page; can also appear in the homepage carousel, with optional publish and expiry dates.',
          enabled: { find: true, create: true, update: true, delete: true },
        },
        pages: {
          description: 'Simple content pages such as About.',
          enabled: { find: true, create: true, update: true },
        },
        media: {
          description: 'Uploaded images and files (read only: list and look up existing media).',
          enabled: { find: true },
        },
      },
      globals: {
        'jumuah-times': {
          description:
            "This week's Jumu'ah prayer sessions (time, venue, postcode) and an optional note, shown on every page and the TV screen.",
          enabled: { find: true, update: true },
        },
        'site-settings': {
          description: 'Mosque name, address, contact details, social links, Mawaqit slug, YouTube channel and donate link.',
          enabled: { find: true, update: true },
        },
        madrasah: {
          description: 'Content of the Madrasah page: class times, subjects, links and newsletters.',
          enabled: { find: true, update: true },
        },
      },
    }),
    // Two-factor authentication (authenticator app) for the admin panel,
    // required for every user. Must stay the LAST plugin: it wraps the access
    // rules of every collection added before it.
    payloadTotp({
      collection: 'users',
      forceSetup: true,
      // The name shown in authenticator apps next to the 6-digit code.
      totp: { issuer: process.env.TOTP_ISSUER || 'Masjid website' },
    }),
  ],
})
