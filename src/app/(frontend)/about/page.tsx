export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { RichText } from '@/lib/richtext'
import config from '@/payload.config'

export const metadata = { title: 'About' }

export default async function AboutPage() {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
  })
  const page = result.docs[0]
  if (!page) notFound()

  return (
    <main className="page">
      <h1>{page.title}</h1>
      <RichText data={page.content} />
    </main>
  )
}
