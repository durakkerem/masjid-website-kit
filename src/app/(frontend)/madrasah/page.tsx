export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import type { Media } from '@/payload-types'
import './madrasah.css'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: await config })
  const m = await payload.findGlobal({ slug: 'madrasah', depth: 0 })
  return { title: m?.title || 'Madrasah', description: m?.intro ?? undefined }
}

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

function mediaUrl(value: number | Media | null | undefined): string | null {
  return value && typeof value === 'object' && value.url ? value.url : null
}

export default async function MadrasahPage() {
  const payload = await getPayload({ config: await config })
  const m = await payload.findGlobal({ slug: 'madrasah', depth: 1 })
  if (!m?.intro) notFound()

  const sessions = m.sessions ?? []
  const subjects = m.subjects ?? []
  const programmes = m.futureProgrammes ?? []
  const portalLinks = m.portalLinks ?? []
  const newsletters = (m.newsletters ?? [])
    .map((n) => ({ ...n, href: mediaUrl(n.file) ?? n.url }))
    .filter((n) => n.href)
  const head = m.headteacher
  const headPhoto = mediaUrl(head?.photo)
  const hasHeadteacher = Boolean(head?.name || head?.bio)
  const logo = mediaUrl(m.logo)

  return (
    <>
      <section className="hero madrasah-hero">
        <div className="inner">
          <div>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="madrasah-logo" />
            ) : null}
            <h1>{m.title || 'Madrasah'}</h1>
            <p className="lead">{m.intro}</p>
            {m.applyUrl || portalLinks.length ? (
              <div className="ctas">
                {m.applyUrl ? (
                  <a href={m.applyUrl} {...external}>
                    Apply / join the waiting list
                  </a>
                ) : null}
                {portalLinks.length ? (
                  <a href="#portal" className="secondary">
                    Portal log-in
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {sessions.length || m.contactEmail ? (
            <aside className="madrasah-times" aria-label="Class times">
              {sessions.length ? (
                <>
                  <h2>Class times</h2>
                  <ul>
                    {sessions.map((s) => (
                      <li key={s.id ?? s.label}>
                        <span className="mt-label">{s.label}</span>
                        {s.days ? <span className="mt-days">{s.days}</span> : null}
                        <span className="mt-time">{s.times}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {m.contactEmail ? (
                <p className="mt-contact">
                  Questions? <a href={`mailto:${m.contactEmail}`}>{m.contactEmail}</a>
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </section>

      <main className="page madrasah">
        {subjects.length || m.curriculumText ? (
          <section className="section">
            <h2>What we teach</h2>
            {m.curriculumText ? (
              <p>
                {m.curriculumText}
                {m.curriculumUrl ? (
                  <>
                    {' '}
                    <a href={m.curriculumUrl} {...external}>
                      Curriculum info ↗
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            {subjects.length ? (
              <ul className="madrasah-subjects">
                {subjects.map((s) => (
                  <li key={s.id ?? s.title} className="card">
                    <h3>{s.title}</h3>
                    {s.description ? <p>{s.description}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {m.vision || programmes.length ? (
          <div className="grid cols-2 madrasah-columns">
            {m.vision ? (
              <section className="section">
                <h2>Our vision</h2>
                <p>{m.vision}</p>
              </section>
            ) : null}
            {programmes.length ? (
              <section className="section">
                <h2>Future programmes</h2>
                <ul className="madrasah-programmes">
                  {programmes.map((p) => (
                    <li key={p.id ?? p.title}>
                      <strong>{p.title}</strong>
                      {p.description ? <span>{p.description}</span> : null}
                    </li>
                  ))}
                </ul>
                {m.futureProgrammesNote ? <p className="madrasah-muted">{m.futureProgrammesNote}</p> : null}
              </section>
            ) : null}
          </div>
        ) : null}

        {m.teachersIntro || hasHeadteacher ? (
          <section className="section">
            <h2>Our teachers</h2>
            {m.teachersIntro ? <p>{m.teachersIntro}</p> : null}
            {hasHeadteacher ? (
              <div className="card madrasah-headteacher">
                {headPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={headPhoto} alt={head?.name ?? 'Headteacher'} width={160} height={160} />
                ) : null}
                <div>
                  {head?.name ? <h3>{head.name}</h3> : null}
                  {head?.role ? <p className="madrasah-role">{head.role}</p> : null}
                  {head?.bio ? <p>{head.bio}</p> : null}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {m.applyUrl || portalLinks.length ? (
          <section className="section" id="portal">
            <h2>Madrasah portal</h2>
            <div className="madrasah-portal">
              {m.applyUrl ? (
                <a href={m.applyUrl} {...external} className="donation-card madrasah-apply">
                  <h4>Join the waiting list</h4>
                  <p>New students: apply for a place.</p>
                  <span className="cta">Apply →</span>
                </a>
              ) : null}
              {portalLinks.map((l) => (
                <a key={l.id ?? l.url} href={l.url} {...external} className="donation-card">
                  {l.arabicLabel ? (
                    <span className="madrasah-arabic" lang="ar" dir="rtl">
                      {l.arabicLabel}
                    </span>
                  ) : null}
                  <h4>{l.label}</h4>
                  <span className="cta">Log in →</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {newsletters.length ? (
          <section className="section">
            <h2>Newsletter</h2>
            {m.newsletterIntro ? <p>{m.newsletterIntro}</p> : null}
            <ul className="madrasah-newsletters">
              {newsletters.map((n) => (
                <li key={n.id ?? n.href}>
                  <a href={n.href!} {...external}>
                    <span className="mn-title">{n.title}</span>
                    {n.issueDate ? <span className="mn-date">{n.issueDate}</span> : null}
                    <span className="mn-type">PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  )
}
