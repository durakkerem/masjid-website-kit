export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { JumuahBar } from '@/components/JumuahBar'
import config from '@/payload.config'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  return {
    title: { default: settings.mosqueName, template: `%s — ${settings.shortName || settings.mosqueName}` },
    description: settings.tagline || `Prayer times, events and announcements from ${settings.mosqueName}.`,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: await config })
  const [settings, jumuah, madrasah] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'jumuah-times' }),
    payload.findGlobal({ slug: 'madrasah', depth: 0 }),
  ])

  return (
    <html lang="en">
      <body>
        <JumuahBar sessions={jumuah?.sessions ?? []} note={jumuah?.note} />
        <header className="site-header">
          <div className="inner">
            <Link href="/" className="brand" aria-label={settings.mosqueName}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt={settings.mosqueName} className="site-logo" />
            </Link>
            <nav className="site-nav">
              <Link href="/">Home</Link>
              <Link href="/events">Events</Link>
              <Link href="/prayer-times">Prayer Times</Link>
              <Link href="/announcements">Announcements</Link>
              {/* The Madrasah page appears once its introduction is filled in. */}
              {madrasah?.intro ? <Link href="/madrasah">{madrasah.title || 'Madrasah'}</Link> : null}
              <Link href="/about">About</Link>
              <Link href="/donate" className="donate">
                Donate
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <p>
            {settings.mosqueName}
            {settings.address ? ` · ${settings.address}` : ''}
          </p>
          <p>
            {settings.phone ? <a href={`tel:${settings.phone}`}>{settings.phone}</a> : null}
            {settings.email ? <> · <a href={`mailto:${settings.email}`}>{settings.email}</a></> : null}
          </p>
        </footer>
      </body>
    </html>
  )
}
