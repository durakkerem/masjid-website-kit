export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import React from 'react'

import { findUploadLink, isExpired } from '@/lib/uploadLinks'
import config from '@/payload.config'

const ERRORS: Record<string, string> = {
  nofile: 'Choose a photo first.',
  noalt: 'Add a short description of the photo.',
  failed: 'That upload did not work. Please try again.',
}

/**
 * One-time photo upload page, reached from a link that Claude creates with
 * the createImageUploadLink tool. Deliberately never returns 404 (nginx would
 * forward a 404 somewhere else).
 */
export default async function UploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ error?: string; msg?: string }>
}) {
  const { token } = await params
  const { error, msg } = await searchParams
  const payload = await getPayload({ config: await config })
  const link = await findUploadLink(payload, token)

  const event = link && typeof link.event === 'object' && link.event ? link.event : null
  const media = link && typeof link.media === 'object' && link.media ? link.media : null

  let body: React.ReactNode
  if (!link) {
    body = (
      <>
        <h1>Link not valid</h1>
        <p>This upload link doesn&apos;t exist. Ask Claude for a new one.</p>
      </>
    )
  } else if (link.usedAt) {
    body = (
      <>
        <h1>Photo uploaded</h1>
        <p className="done">✓ Saved{event ? ` and added to “${event.title}”` : ''}. You can close this page.</p>
        {media?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={media.alt ?? ''} />
        ) : null}
      </>
    )
  } else if (isExpired(link)) {
    body = (
      <>
        <h1>Link expired</h1>
        <p>Upload links work for 30 minutes. Ask Claude for a new one.</p>
      </>
    )
  } else {
    const message = error === 'invalid' && msg ? msg : error ? ERRORS[error] : undefined
    body = (
      <>
        <h1>Upload a photo</h1>
        <p className="upload-for">{event ? `For the event “${event.title}”` : 'For the website'}</p>
        {message ? <p className="error">{message}</p> : null}
        <form method="post" action={`/upload/${token}/submit`} encType="multipart/form-data">
          <label htmlFor="file">Photo</label>
          <input id="file" name="file" type="file" accept="image/*" required />
          <p className="hint">JPEG, PNG, WebP or GIF, up to 10 MB.</p>
          <label htmlFor="alt">Short description</label>
          <input id="alt" name="alt" type="text" maxLength={200} required defaultValue={link.alt ?? ''} placeholder="e.g. Poster for Youth Night" />
          <p className="hint">Read aloud for people using screen readers.</p>
          <button type="submit">Upload photo</button>
        </form>
      </>
    )
  }

  return <main className="upload-card">{body}</main>
}
