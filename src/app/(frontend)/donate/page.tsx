export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const metadata = { title: 'Donate' }

/** Donate page, filled in from Site Settings → Donate page in the admin panel. */
export default async function DonatePage() {
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const links = settings.donationLinks ?? []
  const accounts = settings.bankAccounts ?? []

  return (
    <>
      <section className="hero">
        <div className="inner">
          <div>
            <h1>Support {settings.shortName || settings.mosqueName}</h1>
            <p className="lead">Your generous donations help us serve our community.</p>
          </div>
        </div>
      </section>

      <main className="page">
        {settings.donateIntro || settings.charityNumber ? (
          <section className="section">
            <h2>Ways to donate</h2>
            {settings.donateIntro ? <p>{settings.donateIntro}</p> : null}
            {settings.charityNumber ? (
              <p>
                {settings.mosqueName} is a registered charity (number <strong>{settings.charityNumber}</strong>).
              </p>
            ) : null}
          </section>
        ) : null}

        {links.length ? (
          <section className="section">
            <h3>Donate online</h3>
            <div className="grid cols-2">
              {links.map((link) => (
                <a
                  key={link.id ?? link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="donation-card"
                >
                  <h4>{link.label}</h4>
                  {link.description ? <p>{link.description}</p> : null}
                  <span className="cta">Donate →</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {accounts.length ? (
          <section className="section">
            <h3>Bank transfer</h3>
            <div className="grid cols-2">
              {accounts.map((account) => (
                <div key={account.id ?? account.name} className="bank-account">
                  <h4>{account.name}</h4>
                  <dl>
                    {(account.details ?? []).map((line) => (
                      <React.Fragment key={line.id ?? line.label}>
                        <dt>{line.label}</dt>
                        <dd>{line.value}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                  {account.note ? <p className="note">{account.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!links.length && !accounts.length ? (
          <section className="section">
            <p>Donation details will appear here soon. Please contact us in the meantime.</p>
          </section>
        ) : null}

        {settings.email || settings.phone ? (
          <section className="section">
            <h3>Questions?</h3>
            <p>
              {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : null}
              {settings.email && settings.phone ? <br /> : null}
              {settings.phone ? <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a> : null}
            </p>
          </section>
        ) : null}

        <section
          className="section"
          style={{ background: 'var(--green-900)', color: '#fff', padding: '2rem', borderRadius: 'var(--radius)', marginTop: '3rem' }}
        >
          <h2 style={{ color: '#fff', marginTop: 0 }}>Jazakallahu khairan</h2>
          <p style={{ marginBottom: 0 }}>Thank you for supporting {settings.mosqueName}.</p>
        </section>
      </main>
    </>
  )
}
