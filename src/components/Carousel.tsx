'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

export type CarouselSlide = {
  id: string
  title: string
  subtitle?: string
  tag?: string
  imageUrl?: string
  href?: string
  gradient?: string
}

const GRADIENTS = [
  'linear-gradient(135deg, #05222e 0%, #0d3d52 100%)',
  'linear-gradient(135deg, #0d3d52 0%, #1f6f8b 100%)',
  'linear-gradient(135deg, #6b5220 0%, #c8a24a 100%)',
  'linear-gradient(135deg, #05222e 0%, #1f6f8b 100%)',
]

export function Carousel({ slides }: { slides: CarouselSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    timerRef.current = setInterval(next, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, next, slides.length])

  if (slides.length === 0) return null

  const slideClassName = `carousel-slide${slides[current].imageUrl ? '' : ' no-image'}`

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => {
          const bg = slide.gradient ?? GRADIENTS[slides.indexOf(slide) % GRADIENTS.length]
          const content = (
            <>
              <div
                className="carousel-slide-bg"
                style={
                  slide.imageUrl
                    ? { backgroundImage: `url(${slide.imageUrl})` }
                    : { background: bg }
                }
              />
              <div className="carousel-overlay" />
              <div className="carousel-content">
                {slide.tag && <span className="carousel-tag">{slide.tag}</span>}
                <h2>{slide.title}</h2>
                {slide.subtitle && <p>{slide.subtitle}</p>}
                {slide.href && <span className="carousel-cta">View details →</span>}
              </div>
            </>
          )

          return slide.href ? (
            <Link key={slide.id} href={slide.href} className={slideClassName}>
              {content}
            </Link>
          ) : (
            <div key={slide.id} className={slideClassName}>
              {content}
            </div>
          )
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            className="carousel-btn prev"
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel-btn next"
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
