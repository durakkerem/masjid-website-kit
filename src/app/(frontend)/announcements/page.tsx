export const dynamic = 'force-dynamic'
import { getPayload } from 'payload'
import React from 'react'

import { formatAnnouncementDate } from '@/lib/format'
import { RichText } from '@/lib/richtext'
import config from '@/payload.config'

export const metadata = { title: 'Announcements' }

export default async function AnnouncementsPage() {
  const payload = await getPayload({ config: await config })
  const now = new Date().toISOString()
  const result = await payload.find({
    collection: 'announcements',
    where: {
      or: [
        { expiresAt: { exists: false } },
        { expiresAt: { greater_than_equal: now } },
      ],
    },
    sort: '-publishedAt',
    limit: 100,
  })

  return (
    <main className="page">
      <h1>Announcements</h1>
      {result.docs.length === 0 ? (
        <p>No current announcements.</p>
      ) : (
        result.docs.map((a) => (
          <article key={a.id} className="announcement">
            <h2>{a.title}</h2>
            <div className="date">{formatAnnouncementDate(a.publishedAt)}</div>
            <RichText data={a.body} />
          </article>
        ))
      )}
    </main>
  )
}
