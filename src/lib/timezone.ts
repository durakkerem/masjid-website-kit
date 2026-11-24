/**
 * The masjid's timezone, used for every date and time shown on the site and
 * the TV screen, whatever timezone the server itself runs in. Set
 * NEXT_PUBLIC_SITE_TIMEZONE in .env (an IANA name such as "Europe/London",
 * "America/Toronto" or "Asia/Karachi") and rebuild.
 */
export const TIME_ZONE = process.env.NEXT_PUBLIC_SITE_TIMEZONE || 'Europe/London'
