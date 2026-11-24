/**
 * Fills an empty site with example content so you can see every page working:
 * site settings, Jumu'ah sessions, TV contacts and services, an About page,
 * a few events and announcements. Safe to run more than once: it only adds
 * what is missing. It creates no user accounts — open /admin and create the
 * first one yourself (it becomes the administrator).
 *
 *   pnpm seed
 */
import { getPayload } from 'payload'

import config from './payload.config'

const paragraph = (text: string) => ({
  type: 'paragraph',
  format: '' as const,
  indent: 0,
  version: 1,
  direction: null,
  children: [{ type: 'text', format: 0, version: 1, text }],
})

const richText = (...paragraphs: string[]) => ({
  root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: null, children: paragraphs.map(paragraph) },
})

/** A date `days` from now at the given local hour and minute. */
const at = (days: number, hour: number, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

async function main() {
  const payload = await getPayload({ config })

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  if (!settings.address && !settings.services?.length) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        mosqueName: 'Example Masjid',
        shortName: 'Example Masjid',
        tagline: 'Prayer times, events and news for our community.',
        address: '1 Example Street, Example Town, AB1 2CD',
        phone: '01234 567890',
        email: 'info@example.org',
        // Your page on mawaqit.net, e.g. "my-masjid-city". Left blank in the example.
        mawaqitMosqueSlug: '',
        donateIntro: 'Your donations keep the masjid open and fund our classes, events and support for families in need.',
        donationLinks: [
          { label: 'General fund', description: 'Running costs of the masjid', url: 'https://example.org/donate' },
          { label: 'Zakat', description: 'Distributed to those eligible locally', url: 'https://example.org/zakat' },
        ],
        contacts: [
          { label: 'General enquiries', value: 'info@example.org', kind: 'email' },
          { label: 'Madrasah', value: 'madrasah@example.org', kind: 'email' },
          { label: 'Phone', value: '01234 567890', kind: 'phone' },
        ],
        services: [
          { title: 'Daily & Friday prayers', icon: 'mosque', description: "Daily prayers and Jumu'ah in a welcoming space for all" },
          { title: 'Youth activities', icon: 'people', description: 'Positive activities for our youth and the wider community' },
          { title: "Children's Madrasah", icon: 'book', description: 'Islamic education in a safe, nurturing environment' },
          { title: 'New Muslim support', icon: 'microphone', description: 'Guidance, resources and a welcoming community' },
          { title: 'Nikkah ceremonies', icon: 'heart', description: 'Islamic marriage services with support at every step' },
          { title: 'Family counselling', icon: 'support', description: "Confidential support through life's challenges" },
          { title: 'Funeral services', icon: 'care', description: 'Support and arrangements according to Islamic principles' },
          { title: 'Lectures & talks', icon: 'lecture', description: 'Weekly and monthly talks and events for all ages' },
        ],
      },
    })
    console.log('Filled in example site settings')
  }

  const jumuah = await payload.findGlobal({ slug: 'jumuah-times' })
  if (!jumuah.sessions?.length) {
    await payload.updateGlobal({
      slug: 'jumuah-times',
      data: {
        sessions: [
          { label: "Early Jumu'ah", khutbahTime: '12:30', jamaatTime: '13:00', location: 'Main hall', postcode: 'AB1 2CD' },
          { label: "Main Jumu'ah", khutbahTime: '13:15', jamaatTime: '13:45', location: 'Main hall', postcode: 'AB1 2CD' },
        ],
      },
    })
    console.log("Added example Jumu'ah sessions")
  }

  const about = await payload.count({ collection: 'pages', where: { slug: { equals: 'about' } } })
  if (about.totalDocs === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'About us',
        slug: 'about',
        content: richText(
          'Example Masjid serves the Muslim community of Example Town and the surrounding area. We hold daily prayers, Jumu’ah, a weekend madrasah for children and regular community events.',
          'Everyone is welcome. Edit this page in the admin panel under Pages → About us.',
        ),
      },
    })
    console.log('Created the About page')
  }

  const events = await payload.count({ collection: 'events' })
  if (events.totalDocs === 0) {
    const samples = [
      {
        title: 'Weekly halaqah: Stories of the Prophets',
        slug: 'weekly-halaqah',
        category: 'class' as const,
        startDate: at(2, 19, 30),
        minutes: 90,
        venueName: 'Main hall',
        recurring: { enabled: true, frequency: 'weekly' as const, interval: 1 },
      },
      { title: 'Community family day', slug: 'community-family-day', category: 'community' as const, startDate: at(6, 11), minutes: 300, venueName: 'Masjid car park' },
      { title: 'Sisters’ tajweed course', slug: 'sisters-tajweed-course', category: 'class' as const, startDate: at(12, 18), minutes: 120, venueName: 'Sisters’ hall' },
    ]
    for (const e of samples) {
      await payload.create({
        collection: 'events',
        data: {
          title: e.title,
          slug: e.slug,
          status: 'published',
          _status: 'published',
          category: e.category,
          startDate: e.startDate.toISOString(),
          endDate: new Date(e.startDate.getTime() + e.minutes * 60_000).toISOString(),
          allDay: false,
          location: { venueName: e.venueName },
          ...(e.recurring ? { recurring: e.recurring } : {}),
        },
      })
    }
    console.log(`Created ${samples.length} example events`)
  }

  const announcements = await payload.count({ collection: 'announcements' })
  if (announcements.totalDocs === 0) {
    await payload.create({
      collection: 'announcements',
      data: {
        title: 'Welcome to our new website',
        publishedAt: new Date().toISOString(),
        body: richText('Prayer times, events and news now all live here. The committee updates this site from the admin panel.'),
      },
    })
    console.log('Created an example announcement')
  }

  console.log('\nSeed complete. Open http://localhost:3000/admin to create the first (admin) account.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
