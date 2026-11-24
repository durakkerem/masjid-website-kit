import { describe, expect, it } from 'vitest'

import { distinctTimes, groupByVenue, mapUrl, parseTime, sortSessions, upcomingJumuah } from '@/lib/jumuah'

const SESSIONS = [
  { label: "Main Jumu'ah", jamaatTime: '12:50', location: 'Main Masjid', postcode: 'AB1 2CD' },
  { label: "Main Jumu'ah", jamaatTime: '12:50', location: 'Community Centre – sports hall', postcode: 'AB3 4EF' },
  { label: "Early Jumu'ah", jamaatTime: '12:00', location: 'Main Masjid', postcode: 'AB1 2CD' },
]

describe('parseTime', () => {
  it('accepts 24-hour times with : or .', () => {
    expect(parseTime('12:50')).toBe(770)
    expect(parseTime('9.05')).toBe(545)
    expect(parseTime(' 13:00 ')).toBe(780)
  })
  it('rejects anything else', () => {
    for (const bad of ['', '12', '24:00', '12:60', '1pm', '12:5']) expect(parseTime(bad)).toBeNull()
  })
})

describe('session ordering and grouping', () => {
  it('sorts by prayer time, keeping admin order for ties', () => {
    expect(sortSessions(SESSIONS).map((s) => `${s.jamaatTime} ${s.location}`)).toEqual([
      '12:00 Main Masjid',
      '12:50 Main Masjid',
      '12:50 Community Centre – sports hall',
    ])
  })
  it('groups times by venue', () => {
    expect(groupByVenue(SESSIONS)).toEqual([
      { venue: 'Main Masjid', times: ['12:00', '12:50'] },
      { venue: 'Community Centre – sports hall', times: ['12:50'] },
    ])
  })
  it('lists distinct times', () => {
    expect(distinctTimes(SESSIONS)).toEqual(['12:00', '12:50'])
  })
  it('builds a map link from venue and postcode', () => {
    expect(mapUrl(SESSIONS[1])).toBe(
      'https://www.google.com/maps/search/?api=1&query=Community%20Centre%20%E2%80%93%20sports%20hall%2C%20AB3%204EF',
    )
    expect(mapUrl({ label: 'x', jamaatTime: '12:00' })).toBeNull()
  })
})

describe('upcomingJumuah (London time)', () => {
  it('on a weekday, points at the coming Friday', () => {
    // Wed 26 Nov 2026, 10:00 GMT
    expect(upcomingJumuah(new Date('2026-11-26T10:00:00Z'))).toMatchObject({ isToday: false, label: 'Fri 27 Nov' })
  })
  it('on Friday morning, is today', () => {
    expect(upcomingJumuah(new Date('2026-11-27T11:00:00Z'))).toMatchObject({ isToday: true, isoDate: '2026-11-27' })
  })
  it('on Friday after 14:30 London, moves to next week', () => {
    expect(upcomingJumuah(new Date('2026-11-27T14:31:00Z'))).toMatchObject({ isToday: false, label: 'Fri 4 Dec' })
  })
  it('uses London time in summer (BST), not UTC', () => {
    // Fri 3 Jul 2026 13:45 UTC = 14:45 BST, past the cut-off
    expect(upcomingJumuah(new Date('2026-07-03T13:45:00Z'))).toMatchObject({ isToday: false, label: 'Fri 10 Jul' })
    // Thu 2 Jul 2026 23:30 UTC = Fri 00:30 BST, so it is already Friday
    expect(upcomingJumuah(new Date('2026-07-02T23:30:00Z'))).toMatchObject({ isToday: true, isoDate: '2026-07-03' })
  })
  it('on Saturday, points six days ahead', () => {
    expect(upcomingJumuah(new Date('2026-11-21T15:00:00Z'))).toMatchObject({ label: 'Fri 27 Nov' })
  })
})
