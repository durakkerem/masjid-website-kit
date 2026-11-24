export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { formatEventDate } from '@/lib/format'
import { RichText } from '@/lib/richtext'
import config from '@/payload.config'

type Params = { slug: string }

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const event = result.docs[0]
  if (!event || event.status === 'draft') notFound()

  return (
    <main className="page">
      <p><Link href="/events">← All events</Link></p>
      {event.status === 'cancelled' ? (
        <p style={{ background: '#c0392b', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: 8, display: 'inline-block' }}>
          This event has been cancelled.
        </p>
      ) : null}
      {event.category ? <span className="tag">{event.category}</span> : null}
      <h1>{event.title}</h1>
      <p className="meta" style={{ fontSize: '1.05rem' }}>
        📅 {formatEventDate(event.startDate, event.endDate, event.allDay ?? false)}
      </p>
      {event.location?.venueName ? (
        <p className="meta">
          📍 {event.location.venueName}
          {event.location.address ? <>, {event.location.address}</> : null}
          {event.location.mapUrl ? <> · <a href={event.location.mapUrl} target="_blank" rel="noopener noreferrer">Map</a></> : null}
        </p>
      ) : null}
      <RichText data={event.description} />
    </main>
  )
}
