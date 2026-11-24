export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { EventsCalendar } from '@/components/EventsCalendar'
import { formatEventDate } from '@/lib/format'
import { type CalEvent } from '@/lib/recurrence'
import config from '@/payload.config'

export const metadata = { title: 'Events' }

export default async function EventsPage() {
  const payload = await getPayload({ config: await config })
  const now = new Date().toISOString()

  const [upcoming, past, all] = await Promise.all([
    payload.find({
      collection: 'events',
      where: {
        and: [
          { status: { not_equals: 'draft' } },
          { endDate: { greater_than_equal: now } },
        ],
      },
      sort: 'startDate',
      limit: 100,
    }),
    payload.find({
      collection: 'events',
      where: {
        and: [
          { status: { not_equals: 'draft' } },
          { endDate: { less_than: now } },
        ],
      },
      sort: '-startDate',
      limit: 10,
    }),
    payload.find({
      collection: 'events',
      where: { status: { not_equals: 'draft' } },
      sort: 'startDate',
      limit: 500,
      depth: 0,
    }),
  ])

  const calendarEvents: CalEvent[] = all.docs
    .filter((e) => e.slug)
    .map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug as string,
      category: e.category ?? null,
      startDate: e.startDate,
      endDate: e.endDate,
      allDay: e.allDay ?? false,
      cancelled: e.status === 'cancelled',
      recurring: e.recurring ?? null,
    }))

  return (
    <main className="page">
      <h1>Events</h1>

      <section className="section">
        <EventsCalendar events={calendarEvents} />
      </section>

      <section className="section">
        <h2>Upcoming</h2>
        {upcoming.docs.length === 0 ? (
          <p>No upcoming events. Check back soon.</p>
        ) : (
          upcoming.docs.map((e) => (
            <article key={e.id} className={`event${e.status === 'cancelled' ? ' cancelled' : ''}`}>
              {e.category ? <span className="tag">{e.category}</span> : null}
              {e.status === 'cancelled' ? <span className="tag" style={{ background: '#c0392b' }}>Cancelled</span> : null}
              <h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3>
              <div className="meta">{formatEventDate(e.startDate, e.endDate, e.allDay ?? false)}</div>
              {e.location?.venueName ? <div className="meta">📍 {e.location.venueName}</div> : null}
            </article>
          ))
        )}
      </section>

      {past.docs.length > 0 ? (
        <section className="section">
          <h2>Past events</h2>
          {past.docs.map((e) => (
            <article key={e.id} className="event">
              <h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3>
              <div className="meta">{formatEventDate(e.startDate, e.endDate, e.allDay ?? false)}</div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  )
}
