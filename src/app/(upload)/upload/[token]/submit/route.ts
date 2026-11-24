import { getPayload } from 'payload'

import { MAX_IMAGE_BYTES, verifyImage } from '@/lib/images'
import { findUploadLink, isExpired } from '@/lib/uploadLinks'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

// Relative 303 redirects back to the upload page. Never 404/405: nginx would
// forward those somewhere else.
const back = (token: string, query = '') =>
  new Response(null, { status: 303, headers: { Location: `/upload/${token}${query}`, 'Cache-Control': 'no-store' } })

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const payload = await getPayload({ config: await config })

  const link = await findUploadLink(payload, token)
  if (!link || link.usedAt || isExpired(link)) return back(token)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return back(token, '?error=failed')
  }
  const file = form.get('file')
  const alt = String(form.get('alt') ?? '').trim().slice(0, 200)
  if (!(file instanceof File) || file.size === 0) return back(token, '?error=nofile')
  if (!alt) return back(token, '?error=noalt')
  if (file.size > MAX_IMAGE_BYTES) return back(token, `?error=invalid&msg=${encodeURIComponent('The photo is larger than 10 MB.')}`)

  try {
    const image = await verifyImage(Buffer.from(await file.arrayBuffer()), file.name || 'photo')

    // Re-check right before writing, so a double submit can't use the link twice.
    const fresh = await payload.findByID({ collection: 'image-upload-links', id: link.id, depth: 0, overrideAccess: true })
    if (fresh.usedAt) return back(token)

    const media = await payload.create({ collection: 'media', data: { alt }, file: image, overrideAccess: true })
    const eventId = typeof link.event === 'object' && link.event ? link.event.id : link.event
    if (eventId) {
      await payload.update({ collection: 'events', id: eventId, data: { featuredImage: media.id }, overrideAccess: true })
    }
    await payload.update({
      collection: 'image-upload-links',
      id: link.id,
      data: { usedAt: new Date().toISOString(), media: media.id },
      overrideAccess: true,
    })
    return back(token)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'That upload did not work.'
    payload.logger.warn({ err }, 'Image upload link failed')
    return back(token, `?error=invalid&msg=${encodeURIComponent(message)}`)
  }
}
