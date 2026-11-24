'use client'

import { useEffect } from 'react'

/**
 * Reloads the page every `minutes`, but only after checking the server is
 * reachable, so an unattended screen never gets stuck on a browser error
 * page when the network drops. Used by the entrance TV page.
 */
export function AutoRefresh({ minutes }: { minutes: number }) {
  useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
        if (res.ok) window.location.reload()
      } catch {
        // Offline or server down: keep showing the current page and try again next time.
      }
    }, minutes * 60_000)
    return () => window.clearInterval(id)
  }, [minutes])

  return null
}
