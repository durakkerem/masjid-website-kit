export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Carousel, type CarouselSlide } from '@/components/Carousel'
import { JumuahSessions } from '@/components/JumuahSessions'
import { MawaqitWidget } from '@/components/MawaqitWidget'
import { YouTubeStrip } from '@/components/YouTubeStrip'
import { formatAnnouncementDate, formatEventDate } from '@/lib/format'
import config from '@/payload.config'

export default async function HomePage() {
  const payload = await getPayload({ config: await config })
  const now = new Date().toISOString()

  const [settings, jumuah, events, announcements] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'jumuah-times' }),
    payload.find({
      collection: 'events',
      where: {
        and: [
          { status: { equals: 'published' } },
          { endDate: { greater_than_equal: now } },
        ],
      },
      sort: 'startDate',
      limit: 5,
      depth: 1,
    }),
    payload.find({
      collection: 'announcements',
      where: {
        or: [
          { expiresAt: { exists: false } },
          { expiresAt: { greater_than_equal: now } },
        ],
      },
      sort: '-publishedAt',
      limit: 5,
    }),
  ])

  const carouselSlides: CarouselSlide[] = [
    ...events.docs.slice(0, 4).map((e, i) => {
      const media = typeof e.featuredImage === 'object' && e.featuredImage !== null ? (e.featuredImage as { url?: string }) : null
      // Petrol & gold family — keep decorative slides on-palette.
      const gradients = [
        'linear-gradient(135deg, #05222e 0%, #0d3d52 100%)',
        'linear-gradient(135deg, #0d3d52 0%, #1f6f8b 100%)',
        'linear-gradient(135deg, #6b5220 0%, #c8a24a 100%)',
        'linear-gradient(135deg, #05222e 0%, #1f6f8b 100%)',
      ]
      return {
        id: `event-${e.id}`,
        title: e.title,
        subtitle: formatEventDate(e.startDate, e.endDate, e.allDay ?? false),
        tag: e.category ?? undefined,
        imageUrl: media?.url,
        href: `/events/${e.slug}`,
        gradient: gradients[i % gradients.length],
      }
    }),
    ...announcements.docs
      .filter(a => a.displayInCarousel)
      .slice(0, 2)
      .map(a => ({
        id: `announcement-${a.id}`,
        title: a.title,
        subtitle: formatAnnouncementDate(a.publishedAt),
        href: '/announcements',
        gradient: 'linear-gradient(135deg, #6b5220 0%, #a8863a 100%)',
      })),
  ]

  return (
    <>
      <section className="hero">
        <div className="inner">
          <div className="hero-text">
            <h1>Welcome to {settings.mosqueName}</h1>
            <p className="lead">{settings.tagline || 'Prayer times, community events and announcements.'}</p>
            <div className="ctas">
              <Link href="/prayer-times">View Prayer Times</Link>
              <Link href="/events" className="secondary">Upcoming Events</Link>
            </div>
          </div>
          <div className="hero-widget">
            <MawaqitWidget slug={settings.mawaqitMosqueSlug} size="small" />
          </div>
        </div>
      </section>

      <main className="page">
        {jumuah?.sessions?.length ? (
          <section className="section">
            <header><h2>Jumu&apos;ah</h2><Link href="/prayer-times#jumuah">Full schedule →</Link></header>
            <JumuahSessions sessions={jumuah.sessions} note={jumuah.note} />
          </section>
        ) : null}

        {carouselSlides.length > 0 && <Carousel slides={carouselSlides} />}

        <div className="grid cols-2">
          <section className="section">
            <header><h2>Upcoming events</h2><Link href="/events">See all →</Link></header>
            {events.docs.slice(0, 3).length === 0 ? (
              <p>No upcoming events right now. Check back soon.</p>
            ) : (
              events.docs.slice(0, 3).map((e) => (
                <article key={e.id} className={`event${e.status === 'cancelled' ? ' cancelled' : ''}`}>
                  {e.category ? <span className="tag">{e.category}</span> : null}
                  <h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3>
                  <div className="meta">{formatEventDate(e.startDate, e.endDate, e.allDay ?? false)}</div>
                  {e.location?.venueName ? <div className="meta">📍 {e.location.venueName}</div> : null}
                </article>
              ))
            )}
          </section>

          <section className="section">
            <header><h2>Announcements</h2><Link href="/announcements">See all →</Link></header>
            {announcements.docs.slice(0, 3).length === 0 ? (
              <p>No current announcements.</p>
            ) : (
              announcements.docs.slice(0, 3).map((a) => (
                <article key={a.id} className="announcement">
                  <h3>{a.title}</h3>
                  <div className="date">{formatAnnouncementDate(a.publishedAt)}</div>
                </article>
              ))
            )}
          </section>
        </div>

        <YouTubeStrip channelId={settings.youtubeChannelId} />
      </main>
    </>
  )
}
