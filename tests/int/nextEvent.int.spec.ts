import { describe, expect, it } from 'vitest'

import { nextOccurrence } from '@/lib/nextEvent'
import type { CalEvent } from '@/lib/recurrence'

// Local-time constructors: recurrence arithmetic runs in local time.
const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min)
const ev = (over: Partial<CalEvent> & Pick<CalEvent, 'id' | 'startDate' | 'endDate'>): CalEvent => ({
  title: `Event ${over.id}`,
  slug: `event-${over.id}`,
  ...over,
})

const NOW = at(2026, 11, 25, 12) // Wed 25 Nov 2026, 12:00

describe('nextOccurrence', () => {
  it('returns null when there are no events', () => {
    expect(nextOccurrence([], NOW)).toBeNull()
  })

  it('picks the soonest upcoming one-off event and ignores finished ones', () => {
    const events = [
      ev({ id: 1, startDate: at(2026, 11, 20, 18).toISOString(), endDate: at(2026, 11, 20, 20).toISOString() }),
      ev({ id: 2, startDate: at(2026, 12, 5, 18).toISOString(), endDate: at(2026, 12, 5, 20).toISOString() }),
      ev({ id: 3, startDate: at(2026, 11, 28, 10).toISOString(), endDate: at(2026, 11, 28, 12).toISOString() }),
    ]
    expect(nextOccurrence(events, NOW)?.event.id).toBe(3)
  })

  it('includes an event that is happening right now', () => {
    const events = [ev({ id: 1, startDate: at(2026, 11, 25, 11).toISOString(), endDate: at(2026, 11, 25, 13).toISOString() })]
    expect(nextOccurrence(events, NOW)?.event.id).toBe(1)
  })

  it('skips cancelled events', () => {
    const events = [
      ev({ id: 1, cancelled: true, startDate: at(2026, 11, 26, 18).toISOString(), endDate: at(2026, 11, 26, 20).toISOString() }),
      ev({ id: 2, startDate: at(2026, 11, 27, 18).toISOString(), endDate: at(2026, 11, 27, 20).toISOString() }),
    ]
    expect(nextOccurrence(events, NOW)?.event.id).toBe(2)
  })

  it('finds the next occurrence of a weekly event that started weeks ago', () => {
    // Every Saturday 10:00–11:00 since Sat 3 Oct 2026.
    const events = [
      ev({
        id: 1,
        startDate: at(2026, 10, 3, 10).toISOString(),
        endDate: at(2026, 10, 3, 11).toISOString(),
        recurring: { enabled: true, frequency: 'weekly', interval: 1 },
      }),
    ]
    const next = nextOccurrence(events, NOW)
    expect(next?.start).toEqual(at(2026, 11, 28, 10))
    expect(next?.end).toEqual(at(2026, 11, 28, 11))
  })

  it('ignores events beyond the lookahead window', () => {
    const events = [ev({ id: 1, startDate: at(2027, 9, 1, 10).toISOString(), endDate: at(2027, 9, 1, 11).toISOString() })]
    expect(nextOccurrence(events, NOW)).toBeNull()
  })
})
