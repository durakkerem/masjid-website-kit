import { TIME_ZONE } from './timezone'

export function formatEventDate(start: string | Date, end?: string | Date | null, allDay = false): string {
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const dateFmt = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  })
  const timeFmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
  const sDate = dateFmt.format(s)
  if (allDay) {
    if (e) {
      const eDate = dateFmt.format(e)
      return sDate === eDate ? `${sDate} (all day)` : `${sDate} — ${eDate}`
    }
    return `${sDate} (all day)`
  }
  const sTime = timeFmt.format(s)
  if (!e) return `${sDate} at ${sTime}`
  const eDate = dateFmt.format(e)
  const eTime = timeFmt.format(e)
  if (sDate === eDate) return `${sDate}, ${sTime}–${eTime}`
  return `${sDate} ${sTime} — ${eDate} ${eTime}`
}

export function formatAnnouncementDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(new Date(date))
}
