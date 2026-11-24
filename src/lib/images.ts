import crypto from 'crypto'
import dns from 'dns'
import https from 'https'
import net from 'net'
import path from 'path'
import sharp from 'sharp'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const FETCH_TIMEOUT_MS = 20_000
const MAX_REDIRECTS = 3

const FORMATS: Record<string, { mimetype: string; ext: string }> = {
  jpeg: { mimetype: 'image/jpeg', ext: 'jpg' },
  png: { mimetype: 'image/png', ext: 'png' },
  webp: { mimetype: 'image/webp', ext: 'webp' },
  gif: { mimetype: 'image/gif', ext: 'gif' },
  heif: { mimetype: 'image/avif', ext: 'avif' }, // sharp reports AVIF as "heif"
}

export type VerifiedImage = { data: Buffer; mimetype: string; name: string; size: number }

/**
 * Confirm the bytes really are a supported image by decoding the header with
 * sharp, rather than trusting a file name or Content-Type. Returns the data
 * in the shape Payload's `file` option expects.
 */
export async function verifyImage(data: Buffer, suggestedName: string): Promise<VerifiedImage> {
  if (data.length === 0) throw new Error('The file is empty.')
  if (data.length > MAX_IMAGE_BYTES) throw new Error('The image is larger than 10 MB.')
  let format: string | undefined
  try {
    format = (await sharp(data).metadata()).format
  } catch {
    throw new Error('That file is not an image this site can use (JPEG, PNG, WebP, GIF or AVIF).')
  }
  const known = format ? FORMATS[format] : undefined
  if (!known) throw new Error('That file is not an image this site can use (JPEG, PNG, WebP, GIF or AVIF).')

  const base =
    path
      .basename(suggestedName)
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image'
  const unique = crypto.randomBytes(3).toString('hex')
  return { data, mimetype: known.mimetype, name: `${base}-${unique}.${known.ext}`, size: data.length }
}

/** True for loopback, private, link-local, CGNAT, multicast and other non-public addresses. */
export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    )
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase()
    if (v === '::' || v === '::1') return true
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPrivateAddress(mapped[1])
    // The same IPv4-mapped address in hex form, as URL parsing normalises it: ::ffff:c0a8:1
    const mappedHex = v.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
    if (mappedHex) {
      const hi = parseInt(mappedHex[1], 16)
      const lo = parseInt(mappedHex[2], 16)
      return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`)
    }
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v)
  }
  return true
}

/** DNS lookup that refuses non-public addresses at connect time (also covers redirects and DNS rebinding). */
const publicOnlyLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 0)
    const list = addresses as dns.LookupAddress[]
    const bad = list.find((a) => isPrivateAddress(a.address))
    if (bad || list.length === 0) {
      return callback(new Error('That address points to a private or internal network.'), '', 0)
    }
    if ((options as dns.LookupOptions).all) return (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list)
    callback(null, list[0].address, list[0].family)
  })
}

function getOnce(url: URL): Promise<{ status: number; location?: string; contentType?: string; body?: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { lookup: publicOnlyLookup, timeout: FETCH_TIMEOUT_MS, headers: { 'User-Agent': 'masjid-website-kit-image-import/1.0', Accept: 'image/*' } },
      (res) => {
        const status = res.statusCode ?? 0
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume()
          return resolve({ status, location: res.headers.location })
        }
        if (status !== 200) {
          res.resume()
          return reject(new Error(`The image address answered with HTTP ${status}.`))
        }
        const declared = Number(res.headers['content-length'] ?? 0)
        if (declared > MAX_IMAGE_BYTES) {
          res.destroy()
          return reject(new Error('The image is larger than 10 MB.'))
        }
        const chunks: Buffer[] = []
        let total = 0
        res.on('data', (chunk: Buffer) => {
          total += chunk.length
          if (total > MAX_IMAGE_BYTES) {
            res.destroy()
            reject(new Error('The image is larger than 10 MB.'))
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => resolve({ status, contentType: res.headers['content-type'], body: Buffer.concat(chunks) }))
        res.on('error', reject)
      },
    )
    req.on('timeout', () => req.destroy(new Error('Timed out downloading the image.')))
    req.on('error', reject)
  })
}

/** Download an image from a public https URL, following up to 3 redirects. */
export async function fetchImageFromUrl(rawUrl: string): Promise<VerifiedImage> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('That is not a valid web address.')
  }
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== 'https:') throw new Error('Only https:// image addresses are accepted.')
    if (url.username || url.password) throw new Error('Image addresses with a username or password are not accepted.')
    // Node skips the DNS lookup (and so publicOnlyLookup) for literal IPs; check those here.
    const host = url.hostname.replace(/^\[|\]$/g, '')
    if (net.isIP(host) && isPrivateAddress(host)) {
      throw new Error('That address points to a private or internal network.')
    }
    const res = await getOnce(url)
    if (res.location) {
      url = new URL(res.location, url)
      continue
    }
    return verifyImage(res.body ?? Buffer.alloc(0), decodeURIComponent(url.pathname))
  }
  throw new Error('The image address redirected too many times.')
}

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')
