import { describe, expect, it } from 'vitest'

import {
  dateTile,
  formatWhen,
  isToday,
  londonMidnight,
  monthOccurrences,
  pickCalendarRows,
} from '@/lib/monthEvents'
import type { CalEvent, Occurrence } from '@/lib/recurrence'

// UTC instants, so the tests mean the same thing in any timezone.
const utc = (iso: string) => new Date(`${iso}Z`)
const ev = (over: Partial<CalEvent> & Pick<CalEvent, 'id' | 'startDate' | 'endDate'>): CalEvent => ({
  title: `Event ${over.id}`,
  slug: `event-${over.id}`,
  ...over,
})
const occ = (id: number, start: string, end: string, over: Partial<CalEvent> = {}): Occurrence => ({
  event: ev({ id, startDate: utc(start).toISOString(), endDate: utc(end).toISOString(), ...over }),
  start: utc(start),
  end: utc(end),
})

describe('londonMidnight', () => {
  it('is midnight UTC in winter', () => {
    expect(londonMidnight(2026, 10, 1)).toEqual(utc('2026-11-01T00:00:00'))
  })

  it('is 23:00 UTC the day before in summer', () => {
    expect(londonMidnight(2026, 6, 1)).toEqual(utc('2026-06-30T23:00:00'))
  })

  it('rolls an overflowing month into the next year', () => {
    expect(londonMidnight(2026, 12, 1)).toEqual(utc('2027-01-01T00:00:00'))
  })
})

describe('monthOccurrences', () => {
  it('lists this month’s events by UK date and skips cancelled ones', () => {
    const events = [
      ev({ id: 1, startDate: utc('2026-10-31T18:00:00').toISOString(), endDate: utc('2026-10-31T20:00:00').toISOString() }),
      ev({ id: 2, startDate: utc('2026-11-28T17:45:00').toISOString(), endDate: utc('2026-11-28T18:45:00').toISOString() }),
      ev({ id: 3, startDate: utc('2026-11-05T18:00:00').toISOString(), endDate: utc('2026-11-05T20:00:00').toISOString() }),
      ev({ id: 4, cancelled: true, startDate: utc('2026-11-10T18:00:00').toISOString(), endDate: utc('2026-11-10T19:00:00').toISOString() }),
      ev({ id: 5, startDate: utc('2026-12-01T10:00:00').toISOString(), endDate: utc('2026-12-01T11:00:00').toISOString() }),
    ]
    const month = monthOccurrences(events, utc('2026-11-23T10:00:00'))
    expect(month.label).toBe('November')
    expect(month.occurrences.map((o) => o.event.id)).toEqual([3, 2])
  })

  it('uses the UK date near midnight in summer', () => {
    const events = [
      // 00:30 on 1 June in London (BST)
      ev({ id: 1, startDate: utc('2026-05-31T23:30:00').toISOString(), endDate: utc('2026-05-31T23:45:00').toISOString() }),
      // 00:30 on 1 July in London: next month
      ev({ id: 2, startDate: utc('2026-06-30T23:30:00').toISOString(), endDate: utc('2026-06-30T23:45:00').toISOString() }),
    ]
    const month = monthOccurrences(events, utc('2026-06-15T12:00:00'))
    expect(month.label).toBe('June')
    expect(month.occurrences.map((o) => o.event.id)).toEqual([1])
  })

  it('expands a weekly event into each week of the month', () => {
    const events = [
      ev({
        id: 1,
        startDate: utc('2026-10-03T10:00:00').toISOString(),
        endDate: utc('2026-10-03T11:00:00').toISOString(),
        recurring: { enabled: true, frequency: 'weekly', interval: 1 },
      }),
    ]
    const days = monthOccurrences(events, utc('2026-11-23T10:00:00')).occurrences.map((o) => dateTile(o.start).day)
    expect(days).toEqual(['7', '14', '21', '28'])
  })
})

describe('pickCalendarRows', () => {
  const now = utc('2026-11-20T12:00:00')
  const past = (id: number, day: number) => occ(id, `2026-11-0${day}T18:00:00`, `2026-11-0${day}T19:00:00`)
  const soon = (id: number, day: number) => occ(id, `2026-11-${day}T18:00:00`, `2026-11-${day}T19:00:00`)

  it('shows everything when it fits, finished events included', () => {
    const all = [past(1, 2), soon(2, 25)]
    expect(pickCalendarRows(all, now, 4)).toEqual({ rows: all, more: 0 })
  })

  it('drops finished events first to make room', () => {
    const all = [past(1, 2), past(2, 3), past(3, 4), soon(4, 25), soon(5, 26), soon(6, 27)]
    const { rows, more } = pickCalendarRows(all, now, 4)
    expect(rows.map((o) => o.event.id)).toEqual([3, 4, 5, 6])
    expect(more).toBe(0)
  })

  it('keeps a row for "+N more" when the upcoming events alone do not fit', () => {
    const all = [past(1, 2), soon(2, 21), soon(3, 22), soon(4, 23), soon(5, 24), soon(6, 25)]
    const { rows, more } = pickCalendarRows(all, now, 4)
    expect(rows.map((o) => o.event.id)).toEqual([2, 3, 4])
    expect(more).toBe(2)
  })
})

describe('calendar row text', () => {
  it('shows the UK weekday and day on the date tile', () => {
    expect(dateTile(utc('2026-11-28T17:45:00'))).toEqual({ weekday: 'Sat', day: '28' })
    expect(dateTile(utc('2026-06-30T23:30:00'))).toEqual({ weekday: 'Wed', day: '1' })
  })

  it('formats times, all-day and multi-day events', () => {
    expect(formatWhen(occ(1, '2026-11-28T17:45:00', '2026-11-28T18:45:00'), false)).toBe('17:45–18:45')
    expect(formatWhen(occ(1, '2026-11-28T00:00:00', '2026-11-29T00:00:00'), true)).toBe('All day')
    expect(formatWhen(occ(1, '2026-11-27T00:00:00', '2026-11-29T23:59:00'), true)).toBe('Until Sun 29 Nov')
    expect(formatWhen(occ(1, '2026-11-27T18:00:00', '2026-11-29T12:00:00'), false)).toBe('18:00, until Sun 29 Nov')
    expect(formatWhen(occ(1, '2026-07-04T18:30:00', '2026-07-04T20:00:00'), false)).toBe('19:30–21:00')
  })

  it('marks events starting today or under way as today', () => {
    const now = utc('2026-11-23T10:00:00')
    expect(isToday(occ(1, '2026-11-23T19:00:00', '2026-11-23T20:00:00'), now)).toBe(true)
    expect(isToday(occ(1, '2026-11-21T09:00:00', '2026-11-24T17:00:00'), now)).toBe(true)
    expect(isToday(occ(1, '2026-11-24T19:00:00', '2026-11-24T20:00:00'), now)).toBe(false)
  })
})
