'use client'

import React, { useEffect, useState } from 'react'

import { TvIcon } from './icons'

export type SpotlightSlide = {
  key: string
  eyebrow: string
  title: string
  lines: string[]
  icon: string
  imageUrl?: string | null
  imageAlt?: string
}

const SLIDE_SECONDS = 8

/**
 * The rotating panel on the entrance TV: the next event (if any) followed by
 * the mosque's services, one at a time with a gentle cross-fade.
 */
export function Spotlight({ slides }: { slides: SpotlightSlide[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_SECONDS * 1000)
    return () => window.clearInterval(id)
  }, [slides.length])

  if (slides.length === 0) return null

  return (
    <section className="tv-panel tv-spotlight" aria-roledescription="carousel" aria-label="Events and services">
      <div className="tv-spot-stage">
        {slides.map((s, i) => (
          <article key={s.key} className={`tv-spot-slide${i === index ? ' is-active' : ''}`} aria-hidden={i !== index}>
            <h2>{s.eyebrow}</h2>
            <div className="tv-spot-body">
              {s.imageUrl ? (
                // A poster or photo, shown whole as a thumbnail in place of the icon.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt={s.imageAlt ?? ''} className="tv-spot-image" />
              ) : (
                <span className="tv-spot-icon">
                  <TvIcon name={s.icon} />
                </span>
              )}
              <div>
                <p className="tv-spot-title">{s.title}</p>
                {s.lines.map((line) => (
                  <p key={line} className="tv-spot-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="tv-spot-dots" aria-hidden="true">
          {slides.map((s, i) => (
            <span key={s.key} className={i === index ? 'is-active' : undefined} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
