export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import { AutoRefresh } from '@/components/AutoRefresh'
import { MawaqitWidget } from '@/components/MawaqitWidget'
import { TvIcon } from '@/components/tv/icons'
import { Spotlight, type SpotlightSlide } from '@/components/tv/Spotlight'
import { formatEventDate } from '@/lib/format'
import { formatTime, sortSessions, upcomingJumuah, venueName } from '@/lib/jumuah'
import { dateTile, formatWhen, isToday, monthOccurrences, pickCalendarRows } from '@/lib/monthEvents'
import { nextOccurrence } from '@/lib/nextEvent'
import type { CalEvent } from '@/lib/recurrence'
import config from '@/payload.config'

/** Rows that fit in the events calendar panel (the last one becomes "+N more" when needed). */
const CALENDAR_ROWS = 4

/**
 * Entrance TV screen: welcome, live prayer times (Mawaqit) with this week's
 * Jumu'ah underneath, this month's events, and a slideshow of the next event
 * and the services. Fits one 16:9 screen with no scrolling or buttons. Not
 * linked from the site; open /tv on the TV browser.
 */
export default async function TvPage() {
  const payload = await getPayload({ config: await config })
  const now = new Date()

  const [settings, jumuah, events] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'jumuah-times' }),
    payload.find({
      collection: 'events',
      where: { status: { equals: 'published' } },
      sort: 'startDate',
      limit: 500,
      depth: 1,
    }),
  ])

  const calEvents: CalEvent[] = events.docs
    .filter((e) => e.slug)
    .map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug as string,
      category: e.category ?? null,
      startDate: e.startDate,
      endDate: e.endDate,
      allDay: e.allDay ?? false,
      recurring: e.recurring ?? null,
    }))
  const docById = new Map<CalEvent['id'], (typeof events.docs)[number]>(events.docs.map((e) => [e.id, e]))

  const month = monthOccurrences(calEvents, now)
  const calendar = pickCalendarRows(month.occurrences, now, CALENDAR_ROWS)
  const host = (await headers()).get('host')

  const next = nextOccurrence(calEvents, now)
  const nextDoc = next ? docById.get(next.event.id) : undefined
  const image =
    nextDoc && typeof nextDoc.featuredImage === 'object' && nextDoc.featuredImage?.url
      ? { url: nextDoc.featuredImage.url, alt: nextDoc.featuredImage.alt ?? '' }
      : null

  const sessions = sortSessions(jumuah?.sessions ?? [])
  const when = upcomingJumuah(now)
  // Rotating spotlight: the next event first (if any), then the services.
  const slides: SpotlightSlide[] = []
  if (next && nextDoc) {
    slides.push({
      key: `event-${nextDoc.id}`,
      eyebrow: 'Next event',
      title: nextDoc.title,
      lines: [formatEventDate(next.start, next.end, nextDoc.allDay ?? false), nextDoc.location?.venueName ?? ''].filter(Boolean),
      icon: 'event',
      imageUrl: image?.url,
      imageAlt: image?.alt,
    })
  }
  for (const [i, s] of (settings.services ?? []).entries()) {
    slides.push({
      key: `service-${s.id ?? i}`,
      eyebrow: 'Our services',
      title: s.title,
      lines: s.description ? [s.description] : [],
      icon: s.icon,
    })
  }
  const contacts = settings.contacts ?? []
  const hasSide = calendar.rows.length > 0 || slides.length > 0

  return (
    <main
      className={`tv-screen${hasSide ? '' : ' tv-screen--single'}${contacts.length ? '' : ' tv-screen--no-footer'}`}
    >
      <AutoRefresh minutes={10} />

      <header className="tv-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="tv-logo" />
        <div>
          <p className="tv-salam">
            <span lang="ar" dir="rtl">السلام عليكم</span> · Welcome to
          </p>
          <h1 className="tv-name">{settings.mosqueName}</h1>
        </div>
      </header>

      <div className="tv-left">
        <section className="tv-times" aria-label="Prayer times">
          <MawaqitWidget slug={settings.mawaqitMosqueSlug} size="tv" />
        </section>

        {sessions.length > 0 ? (
          <section className="tv-panel tv-jumuah">
            <div className="tv-jumuah-top">
              <h2>
                Jumu&apos;ah <span className="tv-when">{when.isToday ? 'today' : when.label}</span>
              </h2>
              {jumuah?.note ? <p className="tv-note">{jumuah.note}</p> : null}
            </div>
            <ul>
              {sessions.map((s, i) => (
                <li key={s.id ?? i}>
                  <span className="tv-jumuah-head">
                    <span className="tv-time">{formatTime(s.jamaatTime)}</span>
                    {s.label ? <small>{s.label}</small> : null}
                  </span>
                  <span className="tv-venue">{venueName(s)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {hasSide ? (
        <aside className="tv-side">
          {calendar.rows.length > 0 ? (
            <section className="tv-panel tv-calendar" aria-label={`Events in ${month.label}`}>
              <h2>
                Events calendar <span className="tv-when">{month.label}</span>
              </h2>
              <ol>
                {calendar.rows.map((o) => {
                  const tile = dateTile(o.start)
                  const today = isToday(o, now)
                  const venue = docById.get(o.event.id)?.location?.venueName
                  const meta = [today ? 'Today' : null, formatWhen(o, o.event.allDay ?? false), venue]
                  return (
                    <li
                      key={`${o.event.id}-${o.start.toISOString()}`}
                      className={`tv-cal-row${today ? ' is-today' : ''}${!today && o.end < now ? ' is-past' : ''}`}
                    >
                      <span className="tv-cal-date" aria-hidden="true">
                        <span className="tv-cal-dow">{tile.weekday}</span>
                        <span className="tv-cal-day">{tile.day}</span>
                      </span>
                      <span className="tv-cal-text">
                        <span className="tv-cal-title">{o.event.title}</span>
                        <span className="tv-cal-meta">{meta.filter(Boolean).join(' · ')}</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
              {calendar.more > 0 ? (
                <p className="tv-cal-more">
                  +{calendar.more} more this month{host ? ` · ${host}/events` : ''}
                </p>
              ) : null}
            </section>
          ) : null}

          <Spotlight slides={slides} />
        </aside>
      ) : null}

      {contacts.length ? (
        <footer className="tv-contacts" aria-label="Contact details">
          {contacts.map((c, i) => (
            <div key={c.id ?? i} className="tv-contact">
              <span className="tv-contact-icon">
                <TvIcon name={c.kind} />
              </span>
              <span className="tv-contact-text">
                <span className="tv-contact-label">{c.label}</span>
                <span className="tv-contact-value">{c.value}</span>
              </span>
            </div>
          ))}
        </footer>
      ) : null}
    </main>
  )
}
