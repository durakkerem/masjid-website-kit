import Link from 'next/link'
import React from 'react'

import { distinctTimes, groupByVenue, upcomingJumuah, type JumuahSession } from '@/lib/jumuah'

/**
 * Slim, static (non-scrolling) strip shown above the site header on every
 * page: this week's Jumu'ah times. Long form on desktop, times only on phones.
 */
export function JumuahBar({ sessions, note }: { sessions: readonly JumuahSession[]; note?: string | null }) {
  if (!sessions.length) return null
  const when = upcomingJumuah()
  const groups = groupByVenue(sessions)

  return (
    <aside className="jumuah-bar" aria-label="This week's Jumu'ah times">
      <div className="inner">
        <p className="jb-line">
          <strong className="jb-when">Jumu&apos;ah {when.isToday ? 'today' : when.label}</strong>
          <span className="jb-full">
            {groups.map((g) => (
              <span key={g.venue} className="jb-group">
                <span className="jb-sep" aria-hidden="true"> · </span>
                <strong>{g.times.join(' & ')}</strong> {g.venue}
              </span>
            ))}
          </span>
          <span className="jb-short">
            <span className="jb-sep" aria-hidden="true"> · </span>
            <strong>{distinctTimes(sessions).join(' & ')}</strong>
          </span>
        </p>
        <Link href="/prayer-times#jumuah" className="jb-link">
          Details →
        </Link>
      </div>
      {note ? <p className="inner jb-note">{note}</p> : null}
    </aside>
  )
}
