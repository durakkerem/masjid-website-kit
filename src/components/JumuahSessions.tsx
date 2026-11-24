import React from 'react'

import { formatTime, mapUrl, sortSessions, upcomingJumuah, venueName, type JumuahSession } from '@/lib/jumuah'

/** The Jumu'ah card used on the homepage and the Prayer Times page. */
export function JumuahSessions({ sessions, note }: { sessions: readonly JumuahSession[]; note?: string | null }) {
  if (!sessions.length) return null
  const when = upcomingJumuah()

  return (
    <div className="jumuah-card">
      <p className="jumuah-when">{when.isToday ? 'Today' : `This Friday, ${when.label.replace(/^Fri /, '')}`}</p>
      {note ? <p className="jumuah-note">{note}</p> : null}
      <ul className="jumuah-list">
        {sortSessions(sessions).map((s, i) => {
          const map = mapUrl(s)
          return (
            <li key={s.id ?? i} className="jumuah-session">
              <div className="js-time">{formatTime(s.jamaatTime)}</div>
              <div className="js-detail">
                <strong className="js-label">{s.label}</strong>
                <span className="js-venue">
                  {venueName(s)}
                  {s.postcode ? (
                    <>
                      , <span className="js-postcode">{s.postcode}</span>
                    </>
                  ) : null}
                  {map ? (
                    <>
                      {' · '}
                      <a href={map} target="_blank" rel="noopener noreferrer">
                        Map ↗
                      </a>
                    </>
                  ) : null}
                </span>
                {s.khutbahTime ? <span className="js-khutbah">Khutbah {formatTime(s.khutbahTime)}</span> : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
