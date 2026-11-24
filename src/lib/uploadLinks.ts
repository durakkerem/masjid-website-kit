import type { Payload } from 'payload'

import { hashToken } from './images'

/** Look up a one-time upload link by its raw token (only the hash is stored). */
export async function findUploadLink(payload: Payload, token: string) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null
  const { docs } = await payload.find({
    collection: 'image-upload-links',
    where: { tokenHash: { equals: hashToken(token) } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

export const isExpired = (link: { expiresAt: string }) => new Date(link.expiresAt) < new Date()
