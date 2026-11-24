import { describe, expect, it } from 'vitest'

import { fetchImageFromUrl, isPrivateAddress } from '@/lib/images'

describe('isPrivateAddress', () => {
  it('flags internal IPv4 ranges', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '198.18.0.1']) {
      expect(isPrivateAddress(ip), ip).toBe(true)
    }
  })
  it('flags internal IPv6 ranges and IPv4-mapped addresses', () => {
    for (const ip of ['::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1', '::ffff:c0a8:1', '::ffff:7f00:1']) {
      expect(isPrivateAddress(ip), ip).toBe(true)
    }
  })
  it('allows public addresses', () => {
    for (const ip of ['1.1.1.1', '8.8.8.8', '172.32.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8']) {
      expect(isPrivateAddress(ip), ip).toBe(false)
    }
  })
})

describe('fetchImageFromUrl refuses before connecting', () => {
  it.each([
    ['https://127.0.0.1/x.png'],
    ['https://10.1.2.3/x.png'],
    ['https://169.254.169.254/latest/meta-data'],
    ['https://[::1]/x.png'],
    ['https://[::ffff:192.168.0.1]/x.png'],
  ])('%s', async (url) => {
    await expect(fetchImageFromUrl(url)).rejects.toThrow(/private or internal/)
  })
  it('only accepts https', async () => {
    await expect(fetchImageFromUrl('http://example.com/x.png')).rejects.toThrow(/https/)
  })
  it('rejects credentials in the URL', async () => {
    await expect(fetchImageFromUrl('https://user:pass@example.com/x.png')).rejects.toThrow(/username or password/)
  })
})
