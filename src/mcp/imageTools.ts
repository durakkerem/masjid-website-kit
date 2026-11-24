import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import crypto from 'crypto'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { canEditContent } from '../access/roles'
import { fetchImageFromUrl, hashToken } from '../lib/images'

const LINK_LIFETIME_MINUTES = 30

type ToolResult = { content: Array<{ text: string; type: 'text' }> }
const reply = (text: string): ToolResult => ({ content: [{ type: 'text', text }] })
const fail = (message: string) => reply(`Error: ${message}`)

/** The site's public address, as the request reached it (behind nginx). */
function siteUrl(req: PayloadRequest): string {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

async function attachToEvent(req: PayloadRequest, eventId: number | string, mediaId: number | string) {
  await req.payload.update({
    collection: 'events',
    id: eventId,
    data: { featuredImage: mediaId as number },
    req,
    overrideAccess: false,
  })
}

/**
 * Custom MCP tools for images. Each is switched on per API key under
 * Admin → MCP → API Keys → Tools, and only works for admins and committee
 * editors. Media and event changes run with the key user's own permissions.
 */
type McpTools = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>

export const imageTools: McpTools = [
  {
    name: 'uploadImageFromUrl',
    description:
      'Download an image from a public https:// web address into the website media library, and optionally set it as an event\'s featured image. Use this when the user gives an image link. JPEG, PNG, WebP, GIF or AVIF up to 10 MB. Returns the new media id and URL. If the user wants to upload a photo from their phone instead, use createImageUploadLink.',
    parameters: {
      url: z.string().url().describe('Public https:// address of the image file'),
      alt: z.string().min(1).max(200).describe('Short description of the image for screen readers, e.g. "Poster for Youth Night"'),
      eventId: z.union([z.number(), z.string()]).optional().describe('Optional event id to set this image as its featured image'),
    },
    handler: async (args: Record<string, unknown>, req: PayloadRequest): Promise<ToolResult> => {
      if (!canEditContent(req.user)) return fail('This API key\'s user is not allowed to upload images.')
      const { url, alt, eventId } = args as { url: string; alt: string; eventId?: number | string }
      try {
        const file = await fetchImageFromUrl(url)
        const media = await req.payload.create({ collection: 'media', data: { alt }, file, req, overrideAccess: false })
        if (eventId !== undefined) await attachToEvent(req, eventId, media.id)
        return reply(
          JSON.stringify({
            mediaId: media.id,
            url: media.url ? `${siteUrl(req)}${media.url}` : null,
            attachedToEvent: eventId ?? null,
          }),
        )
      } catch (err) {
        return fail(err instanceof Error ? err.message : String(err))
      }
    },
  },
  {
    name: 'createImageUploadLink',
    description:
      `Create a one-time link to a simple upload page on the website, so the user can upload a photo straight from their phone or computer. Use this when the user wants to add a photo they have (for example one attached in this chat). Give the link to the user; it works once and expires after ${LINK_LIFETIME_MINUTES} minutes. If eventId is given, the uploaded photo automatically becomes that event's featured image. Afterwards call checkImageUploadLink with the returned linkId to confirm.`,
    parameters: {
      eventId: z.union([z.number(), z.string()]).optional().describe('Optional event id; the uploaded photo becomes its featured image'),
      alt: z.string().max(200).optional().describe('Suggested image description, pre-filled on the upload page'),
    },
    handler: async (args: Record<string, unknown>, req: PayloadRequest): Promise<ToolResult> => {
      if (!canEditContent(req.user) || !req.user) return fail('This API key\'s user is not allowed to upload images.')
      const { eventId, alt } = args as { eventId?: number | string; alt?: string }
      try {
        if (eventId !== undefined) {
          // Confirms the event exists and that this user can see it.
          await req.payload.findByID({ collection: 'events', id: eventId, req, overrideAccess: false, depth: 0 })
        }
        const token = crypto.randomBytes(32).toString('base64url')
        const expiresAt = new Date(Date.now() + LINK_LIFETIME_MINUTES * 60_000)
        const link = await req.payload.create({
          collection: 'image-upload-links',
          data: {
            tokenHash: hashToken(token),
            expiresAt: expiresAt.toISOString(),
            alt: alt ?? '',
            event: eventId !== undefined ? Number(eventId) : undefined,
            createdBy: req.user.id as number,
          },
          overrideAccess: true,
        })
        return reply(
          JSON.stringify({
            linkId: link.id,
            uploadUrl: `${siteUrl(req)}/upload/${token}`,
            expiresAt: expiresAt.toISOString(),
            note: 'Give uploadUrl to the user. It works once.',
          }),
        )
      } catch (err) {
        return fail(err instanceof Error ? err.message : String(err))
      }
    },
  },
  {
    name: 'checkImageUploadLink',
    description:
      'Check whether a photo has been uploaded through a link from createImageUploadLink. Returns status (waiting, uploaded or expired) and, once uploaded, the media id, image URL and the event it was attached to.',
    parameters: {
      linkId: z.union([z.number(), z.string()]).describe('The linkId returned by createImageUploadLink'),
    },
    handler: async (args: Record<string, unknown>, req: PayloadRequest): Promise<ToolResult> => {
      if (!canEditContent(req.user)) return fail('This API key\'s user is not allowed to manage uploads.')
      const { linkId } = args as { linkId: number | string }
      try {
        const link = await req.payload.findByID({ collection: 'image-upload-links', id: linkId, depth: 1, overrideAccess: true })
        const media = typeof link.media === 'object' && link.media ? link.media : null
        const status = link.usedAt ? 'uploaded' : new Date(link.expiresAt) < new Date() ? 'expired' : 'waiting'
        return reply(
          JSON.stringify({
            status,
            mediaId: media?.id ?? (typeof link.media === 'number' ? link.media : null),
            url: media?.url ? `${siteUrl(req)}${media.url}` : null,
            event: typeof link.event === 'object' && link.event ? { id: link.event.id, title: link.event.title } : link.event ?? null,
          }),
        )
      } catch {
        return fail('No upload link with that id.')
      }
    },
  },
]
