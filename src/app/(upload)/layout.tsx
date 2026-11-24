import React from 'react'

// Site theme tokens and base styles, plus this page's own layout.
import '../(frontend)/styles.css'
import './upload.css'

export const metadata = {
  title: 'Upload a photo',
  robots: { index: false, follow: false },
}

/** Minimal root layout for one-time photo upload links: no site navigation. */
export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="upload-body">{children}</body>
    </html>
  )
}
