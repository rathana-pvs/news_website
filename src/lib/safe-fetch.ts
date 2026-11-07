import { lookup } from 'node:dns/promises'
import net from 'node:net'

/**
 * fetch() for URLs that come from users or scraped pages.
 *
 * Only http(s) URLs whose host resolves to a public IP address are fetched,
 * so the server cannot be pointed at localhost, the private network, or the
 * cloud metadata service. Redirects are followed manually (max 5) and every
 * hop is checked again. Requests time out after `timeoutMs`.
 */

const MAX_REDIRECTS = 5

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast and reserved
  )
}

function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip)
  const v6 = ip.toLowerCase()
  // IPv4-mapped IPv6, in dotted (::ffff:127.0.0.1) or hex (::ffff:7f00:1) form.
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  const mappedHex = v6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16)
    const lo = parseInt(mappedHex[2], 16)
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`)
  }
  // NAT64 / IPv4-compatible forms embed an IPv4 address too; refuse them.
  if (v6.startsWith('64:ff9b:') || /^::[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(v6)) return true
  return (
    v6 === '::' ||
    v6 === '::1' ||
    v6.startsWith('fc') ||
    v6.startsWith('fd') || // unique local
    v6.startsWith('fe8') ||
    v6.startsWith('fe9') ||
    v6.startsWith('fea') ||
    v6.startsWith('feb') || // link-local
    v6.startsWith('ff') // multicast
  )
}

export class UnsafeUrlError extends Error {}

async function assertPublicUrl(raw: string | URL): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new UnsafeUrlError('Invalid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http and https URLs are allowed')
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('URLs with credentials are not allowed')
  }

  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = net.isIP(host)
    ? [host]
    : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address)

  if (addresses.length === 0) throw new UnsafeUrlError('Host could not be resolved')
  if (addresses.some(isPrivateIP)) throw new UnsafeUrlError('Private or local addresses are not allowed')
  return url
}

export async function safeFetch(
  input: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...rest } = init
  let url = await assertPublicUrl(input)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(url, {
      ...rest,
      redirect: 'manual',
      signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
    })

    const location = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && location) {
      url = await assertPublicUrl(new URL(location, url))
      continue
    }
    return res
  }
  throw new UnsafeUrlError('Too many redirects')
}
