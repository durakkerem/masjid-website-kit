import React from 'react'

// Shares the site's theme tokens and base styles, then adds the TV layout.
import '../(frontend)/styles.css'
import './tv.css'

export const metadata = {
  title: 'Welcome',
  // Unlisted page for the screen at the masjid entrance: keep it out of search engines.
  robots: { index: false, follow: false },
}

/**
 * Root layout for the entrance TV screen. Deliberately has no site header,
 * navigation, Jumu'ah bar or footer — the page fills one 16:9 screen.
 */
export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="tv-body">{children}</body>
    </html>
  )
}
