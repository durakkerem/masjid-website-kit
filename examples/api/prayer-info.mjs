// This week's Jumu'ah sessions and the next events, from the public REST API.
// Use it from another website's server, a Discord/WhatsApp bot, a display, ...
//   SITE=https://example.org node prayer-info.mjs
const site = process.env.SITE
if (!site) throw new Error('Set SITE, e.g. https://example.org')

const get = async (path) => {
  const res = await fetch(new URL(path, site))
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

const params = new URLSearchParams({
  'where[status][equals]': 'published',
  'where[endDate][greater_than_equal]': new Date().toISOString(),
  sort: 'startDate',
  limit: '5',
  depth: '0',
})
const [jumuah, events] = await Promise.all([get('/api/globals/jumuah-times'), get(`/api/events?${params}`)])

console.log("Jumu'ah:")
for (const s of jumuah.sessions ?? []) console.log(`  ${s.jamaatTime}  ${s.label}${s.location ? ` · ${s.location}` : ''}`)
if (jumuah.note) console.log(`  Note: ${jumuah.note}`)

console.log('\nNext events:')
for (const e of events.docs) console.log(`  ${new Date(e.startDate).toLocaleString('en-GB')}  ${e.title}`)
