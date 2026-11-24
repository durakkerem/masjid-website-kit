import { expandOccurrences, type CalEvent, type Occurrence } from './recurrence'

const LOOKAHEAD_DAYS = 180

/**
 * The soonest event occurrence that hasn't finished yet, expanding recurring
 * events. Cancelled events are skipped. Returns null when nothing is coming up
 * within the lookahead window.
 */
export function nextOccurrence(events: readonly CalEvent[], now: Date = new Date()): Occurrence | null {
  const horizon = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000)
  const live = events.filter((e) => !e.cancelled)
  return expandOccurrences(live, now, horizon).find((o) => o.end >= now) ?? null
}
