/**
 * This month's events for the entrance TV's calendar panel. Pure functions.
 * Months, days and times follow the masjid's timezone (see timezone.ts)
 * whatever timezone the server runs in.
 */
import { expandOccurrences, type CalEvent, type Occurrence } from './recurrence'
import { TIME_ZONE } from './timezone'

const format = (date: Date, opts: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, ...opts }).format(date)

function londonParts(date: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month') - 1, day: get('day'), hour: get('hour'), minute: get('minute') }
}

/** The instant UK clocks read 00:00 on the given day. Month and day may overflow, as with Date.UTC. */
export function londonMidnight(year: number, month: number, day: number): Date {
  const utcMidnight = Date.UTC(year, month, day)
  const p = londonParts(new Date(utcMidnight))
  // How far UK clocks are ahead of UTC at that moment: 0 in winter, 1 hour in summer.
  const offset = Date.UTC(p.year, p.month, p.day, p.hour, p.minute) - utcMidnight
  return new Date(utcMidnight - offset)
}

/** UK calendar day of `date`, e.g. "2026-11-28", for same-day comparisons. */
function dayKey(date: Date): string {
  const p = londonParts(date)
  return `${p.year}-${p.month + 1}-${p.day}`
}

export type CalendarMonth = {
  /** Month name, e.g. "November". */
  label: string
  /** Event occurrences overlapping the month, soonest first. */
  occurrences: Occurrence[]
}

/** The events in the UK calendar month containing `now`, with recurring events expanded. */
export function monthOccurrences(events: readonly CalEvent[], now: Date = new Date()): CalendarMonth {
  const { year, month } = londonParts(now)
  const start = londonMidnight(year, month, 1)
  const end = new Date(londonMidnight(year, month + 1, 1).getTime() - 1)
  const live = events.filter((e) => !e.cancelled)
  return { label: format(now, { month: 'long' }), occurrences: expandOccurrences(live, start, end) }
}

/**
 * Which of the month's occurrences to show when only `max` rows fit. Finished
 * events are dropped first; if the upcoming ones still don't fit, the soonest
 * are shown and `more` says how many were left out (that last row is used for
 * the "+N more" line).
 */
export function pickCalendarRows(
  occurrences: readonly Occurrence[],
  now: Date,
  max: number,
): { rows: Occurrence[]; more: number } {
  if (occurrences.length <= max) return { rows: [...occurrences], more: 0 }
  let finished = 0
  while (finished < occurrences.length && occurrences[finished].end < now) finished++
  if (occurrences.length - finished <= max) {
    return { rows: occurrences.slice(occurrences.length - max), more: 0 }
  }
  const rows = occurrences.slice(finished, finished + Math.max(1, max - 1))
  return { rows, more: occurrences.length - finished - rows.length }
}

/** Weekday and day of the month for a calendar date tile, e.g. { weekday: "Sat", day: "28" }. */
export function dateTile(date: Date): { weekday: string; day: string } {
  return { weekday: format(date, { weekday: 'short' }), day: format(date, { day: 'numeric' }) }
}

/** True when the occurrence starts today or is under way right now. */
export function isToday(o: Occurrence, now: Date): boolean {
  return dayKey(o.start) === dayKey(now) || (o.start <= now && now <= o.end)
}

/** Short time text for a calendar row: "17:45–18:45", "All day", "Until Sun 29 Nov". */
export function formatWhen(o: Occurrence, allDay: boolean): string {
  // An all-day event may be stored as ending at midnight the next day.
  const lastMoment = allDay ? new Date(Math.max(o.start.getTime(), o.end.getTime() - 1)) : o.end
  const sameDay = dayKey(o.start) === dayKey(lastMoment)
  const until = format(lastMoment, { weekday: 'short', day: 'numeric', month: 'short' })
  if (allDay) return sameDay ? 'All day' : `Until ${until}`
  const time = (d: Date) => format(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return sameDay ? `${time(o.start)}–${time(o.end)}` : `${time(o.start)}, until ${until}`
}
