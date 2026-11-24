export const dynamic = 'force-dynamic'
import { getPayload } from 'payload'
import React from 'react'

import { JumuahSessions } from '@/components/JumuahSessions'
import { MawaqitWidget } from '@/components/MawaqitWidget'
import config from '@/payload.config'

export const metadata = { title: 'Prayer Times' }

export default async function PrayerTimesPage() {
  const payload = await getPayload({ config: await config })
  const [settings, jumuah] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'jumuah-times' }),
  ])

  return (
    <main className="page">
      <h1>Prayer Times</h1>
      <p>Daily prayer times are synchronised live from Mawaqit.</p>

      <div style={{ margin: '1.5rem 0' }}>
        <MawaqitWidget slug={settings.mawaqitMosqueSlug} size="large" />
      </div>

      {jumuah?.sessions?.length ? (
        <section className="section" id="jumuah">
          <h2>Jumu&apos;ah</h2>
          <JumuahSessions sessions={jumuah.sessions} note={jumuah.note} />
        </section>
      ) : null}
    </main>
  )
}
