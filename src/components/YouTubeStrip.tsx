import Link from 'next/link'

type Video = {
  id: string
  title: string
  published: string
}

/**
 * Fetch the latest uploads for a channel from YouTube's public RSS feed.
 * No API key or quota — the feed is world-readable. Cached for an hour.
 */
async function fetchLatestVideos(channelId: string): Promise<Video[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)
    return entries
      .map((entry) => {
        const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? ''
        const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? ''
        const title = rawTitle
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
        return { id, title, published }
      })
      .filter((v) => v.id)
      .slice(0, 12)
  } catch {
    return []
  }
}

export async function YouTubeStrip({ channelId }: { channelId?: string | null }) {
  if (!channelId) return null
  const videos = await fetchLatestVideos(channelId)
  if (videos.length === 0) return null

  const channelUrl = `https://www.youtube.com/channel/${channelId}`

  return (
    <section className="section yt-strip">
      <header>
        <h2>Latest videos</h2>
        <a href={channelUrl} target="_blank" rel="noopener noreferrer">
          Visit our channel →
        </a>
      </header>
      <div className="yt-track" role="list">
        {videos.map((v) => (
          <a
            key={v.id}
            className="yt-card"
            role="listitem"
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="yt-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                loading="lazy"
              />
              <span className="yt-play" aria-hidden="true">▶</span>
            </div>
            <span className="yt-title">{v.title}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
