/**
 * Helpers for displaying Jumu'ah sessions (see globals/JumuahTimes.ts).
 * Pure functions, no Payload imports, so they can be used from the global
 * config, server components and tests alike.
 */

import { TIME_ZONE } from './timezone'

export type JumuahSession = {
  label: string
  jamaatTime: string
  khutbahTime?: string | null
  location?: string | null
  postcode?: string | null
  id?: string | null
}

export const DEFAULT_VENUE = 'Main masjid'
/** After this London time on a Friday, the bar moves on to next week. */
const FRIDAY_CUTOFF_MINUTES = 14 * 60 + 30

/** Parse "12:50", "12.50" or "9:05" into minutes since midnight; null if not a valid 24-hour time. */
export function parseTime(value: string): number | null {
  const m = /^\s*([01]?\d|2[0-3])[:.]([0-5]\d)\s*$/.exec(value)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

/** Normalise a time for display: "9.05" -> "09:05". Leaves unparseable input as typed. */
export function formatTime(value: string): string {
  const minutes = parseTime(value)
  if (minutes === null) return value.trim()
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${h}:${mm}`
}

/** Sessions ordered by prayer time; ties and unparseable times keep their admin order. */
export function sortSessions<T extends JumuahSession>(sessions: readonly T[]): T[] {
  return sessions
    .map((s, i) => ({ s, i, t: parseTime(s.jamaatTime) ?? Number.MAX_SAFE_INTEGER }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .map(({ s }) => s)
}

export function venueName(s: JumuahSession): string {
  return s.location?.trim() || DEFAULT_VENUE
}

/** Group sessions by venue, keeping the order in which venues first appear by time. */
export function groupByVenue(sessions: readonly JumuahSession[]): { venue: string; times: string[] }[] {
  const groups = new Map<string, string[]>()
  for (const s of sortSessions(sessions)) {
    const venue = venueName(s)
    const time = formatTime(s.jamaatTime)
    const times = groups.get(venue) ?? []
    if (!times.includes(time)) times.push(time)
    groups.set(venue, times)
  }
  return [...groups].map(([venue, times]) => ({ venue, times }))
}

/** Distinct prayer times in order, e.g. ["12:00", "12:50"]. */
export function distinctTimes(sessions: readonly JumuahSession[]): string[] {
  return [...new Set(sortSessions(sessions).map((s) => formatTime(s.jamaatTime)))]
}

/** Google Maps search link for a session's venue, or null if it has neither location nor postcode. */
export function mapUrl(s: JumuahSession): string | null {
  const query = [s.location?.trim(), s.postcode?.trim()].filter(Boolean).join(', ')
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/**
 * The Friday the site should be showing, in London time: today if it is
 * Friday before the cut-off, otherwise the coming Friday.
 */
export function upcomingJumuah(now: Date = new Date()): { isToday: boolean; label: string; isoDate: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      weekday: 'short',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  const minutesNow = Number(parts.hour) * 60 + Number(parts.minute)

  let daysAhead = (5 - weekday + 7) % 7
  if (daysAhead === 0 && minutesNow >= FRIDAY_CUTOFF_MINUTES) daysAhead = 7

  // Calendar arithmetic on the London date, done in UTC so DST can't shift the day.
  const friday = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + daysAhead, 12))
  const label = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(friday)

  return {
    isToday: daysAhead === 0,
    label, // e.g. "Fri 28 Nov"
    isoDate: friday.toISOString().slice(0, 10),
  }
}
