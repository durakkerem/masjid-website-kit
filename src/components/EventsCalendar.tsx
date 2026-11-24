'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { type CalEvent, expandOccurrences } from '@/lib/recurrence'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function startOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1)
}
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b)
}
function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function EventsCalendar({ events }: { events: CalEvent[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const e of events) if (e.category) set.add(e.category)
    return Array.from(set).sort()
  }, [events])

  // Build the 6-week grid starting on the Sunday of the first week.
  const gridStart = useMemo(() => {
    const first = startOfMonth(year, month)
    const s = new Date(first)
    s.setDate(s.getDate() - s.getDay())
    s.setHours(0, 0, 0, 0)
    return s
  }, [year, month])

  const days = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [gridStart])

  const occurrencesByDay = useMemo(() => {
    const gridEnd = new Date(gridStart)
    gridEnd.setDate(gridEnd.getDate() + 42)
    const filtered =
      activeCategories.size === 0
        ? events
        : events.filter((e) => e.category && activeCategories.has(e.category))
    const occ = expandOccurrences(filtered, gridStart, gridEnd)
    const map = new Map<string, typeof occ>()
    for (const o of occ) {
      const key = dayKey(o.start)
      const list = map.get(key) ?? []
      list.push(o)
      map.set(key, list)
    }
    return map
  }, [events, gridStart, activeCategories])

  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }
  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }
  const toggleCategory = (c: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  return (
    <div className="cal">
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
          <strong className="cal-month">{MONTHS[month]} {year}</strong>
          <button type="button" onClick={() => shift(1)} aria-label="Next month">›</button>
          <button type="button" className="cal-today" onClick={goToday}>Today</button>
        </div>
        {categories.length > 0 && (
          <div className="cal-filters" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`cal-chip${activeCategories.has(c) ? ' active' : ''}`}
                aria-pressed={activeCategories.has(c)}
                onClick={() => toggleCategory(c)}
              >
                {titleCase(c)}
              </button>
            ))}
            {activeCategories.size > 0 && (
              <button type="button" className="cal-chip clear" onClick={() => setActiveCategories(new Set())}>
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
      </div>
      <div className="cal-grid">
        {days.map((d) => {
          const inMonth = d.getMonth() === month
          const isToday = sameDay(d, today)
          const list = occurrencesByDay.get(dayKey(d)) ?? []
          return (
            <div
              key={dayKey(d)}
              className={`cal-cell${inMonth ? '' : ' muted'}${isToday ? ' today' : ''}`}
            >
              <div className="cal-date">{d.getDate()}</div>
              <div className="cal-events">
                {list.map((o, i) => (
                  <Link
                    key={`${o.event.id}-${i}`}
                    href={`/events/${o.event.slug}`}
                    className={`cal-event${o.event.cancelled ? ' cancelled' : ''}`}
                    title={`${o.event.title}${o.event.allDay ? '' : ` · ${formatTime(o.start)}`}`}
                  >
                    {!o.event.allDay && <span className="cal-event-time">{formatTime(o.start)}</span>}
                    <span className="cal-event-title">{o.event.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
