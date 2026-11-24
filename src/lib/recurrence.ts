/**
 * Recurrence expansion for the events calendar. Pure functions (no server
 * deps) so this runs in the client calendar component too. All arithmetic is
 * in local time — the calendar renders in the visitor's timezone (UK for most).
 */

export type RecurringConfig = {
  enabled?: boolean | null
  frequency?: 'weekly' | 'monthly' | null
  interval?: number | null
  /** Weekly only: weekdays as strings '0'(Sun)–'6'(Sat). */
  daysOfWeek?: (string | number)[] | null
  /** Optional ISO date to stop repeating (inclusive). */
  until?: string | null
}

export type CalEvent = {
  id: number | string
  title: string
  slug: string
  category?: string | null
  startDate: string
  endDate: string
  allDay?: boolean | null
  cancelled?: boolean
  recurring?: RecurringConfig | null
}

export type Occurrence = {
  event: CalEvent
  start: Date
  end: Date
}

const MAX_OCCURRENCES_PER_EVENT = 400

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

function startOfWeek(d: Date): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - r.getDay())
  r.setHours(0, 0, 0, 0)
  return r
}

/** Combine a calendar day with the time-of-day from `base`. */
function withTimeOf(day: Date, base: Date): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
  )
}

function overlaps(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return end >= rangeStart && start <= rangeEnd
}

/** Expand one event into its occurrences overlapping [rangeStart, rangeEnd]. */
function expandOne(event: CalEvent, rangeStart: Date, rangeEnd: Date): Occurrence[] {
  const base = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = Math.max(0, end.getTime() - base.getTime())
  const rec = event.recurring

  // Non-recurring: a single occurrence.
  if (!rec?.enabled) {
    return overlaps(base, end, rangeStart, rangeEnd) ? [{ event, start: base, end }] : []
  }

  const interval = Math.max(1, Math.floor(rec.interval ?? 1))
  const until = rec.until ? new Date(rec.until) : null
  const out: Occurrence[] = []
  const push = (start: Date) => {
    if (start < base) return
    if (until && start > until) return
    const occEnd = new Date(start.getTime() + durationMs)
    if (overlaps(start, occEnd, rangeStart, rangeEnd)) out.push({ event, start, end: occEnd })
  }

  if (rec.frequency === 'monthly') {
    for (let m = 0; out.length < MAX_OCCURRENCES_PER_EVENT; m += interval) {
      const start = addMonths(base, m)
      if (start > rangeEnd || (until && start > until)) break
      push(start)
      if (m > 12 * 30) break // safety cap (~30 years)
    }
    return out
  }

  // Weekly (default). Emit on each selected weekday, every `interval` weeks.
  const weekdays =
    rec.daysOfWeek && rec.daysOfWeek.length > 0
      ? rec.daysOfWeek.map((d) => Number(d)).filter((n) => n >= 0 && n <= 6)
      : [base.getDay()]
  const anchor = startOfWeek(base)
  for (let w = 0; out.length < MAX_OCCURRENCES_PER_EVENT; w += interval) {
    const weekStart = addDays(anchor, w * 7)
    if (weekStart > rangeEnd || (until && weekStart > until)) break
    for (const wd of weekdays) push(withTimeOf(addDays(weekStart, wd), base))
    if (w > 52 * 30) break // safety cap
  }
  return out
}

/** Expand many events into a flat, date-sorted list of occurrences in range. */
export function expandOccurrences(
  events: CalEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): Occurrence[] {
  const all: Occurrence[] = []
  for (const ev of events) all.push(...expandOne(ev, rangeStart, rangeEnd))
  all.sort((a, b) => a.start.getTime() - b.start.getTime())
  return all
}
