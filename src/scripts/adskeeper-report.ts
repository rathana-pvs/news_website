/**
 * Read-only Adskeeper earnings report per ad position.
 *
 *   npm run ads:report                       # last 30 days, mobile, by position
 *   npm run ads:report -- --days 7           # last 7 days
 *   npm run ads:report -- --device all       # every device type
 *   npm run ads:report -- --by country       # mobile earnings by country
 *   npm run ads:report -- --by date          # daily trend
 *   npm run ads:report -- --days all --by month   # full history, month by month (custom ranges max 90 days)
 *   npm run ads:report -- --raw              # print the API response as-is
 *   npm run ads:report -- --env .env.production
 *
 * Needs, in .env.local (never commit them):
 *   ADSKEEPER_API_TOKEN=<32-character API token>
 *   ADSKEEPER_AUTH_ID=<publisher auth id used in the API path>
 *
 * API: GET https://api.adskeeper.com/v1/publishers/{authId}/widget-custom-report
 * It only reads reports; it cannot change widgets or account settings.
 */

type Row = Record<string, any>

const METRICS = ['adRequests', 'impressions', 'visibilityRate', 'clicks', 'wages', 'eCpm', 'ctr']

function arg(name: string, fallback?: string) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = process.argv[i + 1]
  return next && !next.startsWith('--') ? next : 'true'
}

function loadEnv(file: string) {
  try {
    process.loadEnvFile(file)
  } catch {
    console.warn(`(Could not read ${file}; using the current environment only.)`)
  }
}

/** widgetId -> position names, from the same env vars the site uses. */
function placementNames(): Map<string, string[]> {
  const vars: Record<string, string | undefined> = {
    home_feed: process.env.NEXT_PUBLIC_ADS_KEEPER_HOME_FEED || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_FEED,
    home_bottom: process.env.NEXT_PUBLIC_ADS_KEEPER_HOME_BOTTOM,
    category_feed: process.env.NEXT_PUBLIC_ADS_KEEPER_CATEGORY_FEED || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_FEED,
    category_bottom: process.env.NEXT_PUBLIC_ADS_KEEPER_CATEGORY_BOTTOM,
    search_feed: process.env.NEXT_PUBLIC_ADS_KEEPER_SEARCH_FEED,
    article_inline_1: process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1,
    article_inline_2: process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2,
    article_inline_3: process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3,
    article_bottom: process.env.NEXT_PUBLIC_ADS_KEEPER_ARTICLE_BOTTOM || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_BOTTOM_FEED,
    article_sidebar: process.env.NEXT_PUBLIC_ADS_KEEPER_ARTICLE_SIDEBAR || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_SIDEBAR,
    mobile_sticky: process.env.NEXT_PUBLIC_ADS_KEEPER_MOBILE_TOASTER || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_MOBILE_ANCHOR,
  }
  const map = new Map<string, string[]>()
  for (const [name, id] of Object.entries(vars)) {
    if (!id) continue
    map.set(String(id), [...(map.get(String(id)) || []), name])
  }
  return map
}

/** The docs show no example response, so accept the common shapes. */
function extractRows(json: any): Row[] | null {
  if (Array.isArray(json)) return json
  if (!json || typeof json !== 'object') return null
  for (const key of ['data', 'rows', 'items', 'result', 'report']) {
    if (Array.isArray(json[key])) return json[key]
    if (json[key] && typeof json[key] === 'object') {
      const nested = extractRows(json[key])
      if (nested) return nested
    }
  }
  const values = Object.values(json)
  if (values.length && values.every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
    return values as Row[]
  }
  return null
}

const num = (v: any) => {
  const n = typeof v === 'string' ? Number(v.replace(/,/g, '')) : Number(v)
  return Number.isFinite(n) ? n : 0
}
const pct = (v: number) => (Number.isFinite(v) ? `${v.toFixed(1)}%` : '—')
const money = (v: number) => `$${v.toFixed(2)}`
const int = (v: number) => Math.round(v).toLocaleString('en-US')

function printTable(headers: string[], rows: string[][]) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)))
  const line = (cells: string[]) =>
    cells.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join('  ')
  console.log(line(headers))
  console.log(widths.map((w) => '─'.repeat(w)).join('  '))
  rows.forEach((r) => console.log(line(r)))
}

async function main() {
  loadEnv(arg('env', '.env.local')!)

  const token = process.env.ADSKEEPER_API_TOKEN
  const authId = process.env.ADSKEEPER_AUTH_ID
  if (!token || !authId) {
    console.error('Missing ADSKEEPER_API_TOKEN or ADSKEEPER_AUTH_ID. Add them to .env.local (see the top of this file).')
    process.exit(1)
  }

  const days = arg('days', '30')
  const device = arg('device', 'mobile')!
  const by = arg('by', 'position')!
  const raw = arg('raw') === 'true'

  const presets: Record<string, string> = { '7': 'lastSeven', '30': 'last30Days', today: 'today', yesterday: 'yesterday', all: 'all' }
  // Custom ranges can start at most 90 days back; longer asks use the full history.
  if (Number(days) > 90) console.warn(`(The API only allows 90 days back; showing the full history instead of ${days} days.)`)
  const dateInterval = presets[days!] || (Number(days) > 90 ? 'all' : Number(days) > 0 ? 'interval' : 'last30Days')
  const groupDim = by === 'country' ? 'countryIso' : by === 'date' || by === 'month' ? 'date' : by === 'subid' ? 'subId' : null
  const dimensions = ['widgetId', 'deviceType', ...(groupDim ? [groupDim] : [])]

  const params = new URLSearchParams({
    dateInterval,
    dimensions: dimensions.join(','),
    metrics: METRICS.join(','),
    timeZone: process.env.ADSKEEPER_TIMEZONE || 'Asia/Phnom_Penh',
    perPage: '100000',
  })
  if (device !== 'all') params.set('deviceType', device)
  // The API rejects long custom ranges, so fetch them in 30-day windows.
  const windows: { start?: string; end?: string }[] = []
  if (dateInterval === 'interval') {
    const dayMs = 86_400_000
    const end = new Date()
    let cursor = new Date(end.getTime() - (Number(days) - 1) * dayMs)
    while (cursor <= end) {
      const windowEnd = new Date(Math.min(end.getTime(), cursor.getTime() + 29 * dayMs))
      windows.push({ start: cursor.toISOString().slice(0, 10), end: windowEnd.toISOString().slice(0, 10) })
      cursor = new Date(windowEnd.getTime() + dayMs)
    }
    params.set('startDate', windows[0].start!)
    params.set('endDate', windows[windows.length - 1].end!)
  } else {
    windows.push({})
  }

  const fetchWindow = async (w: { start?: string; end?: string }) => {
    const q = new URLSearchParams(params)
    if (w.start) q.set('startDate', w.start)
    if (w.end) q.set('endDate', w.end)
    const url = `https://api.adskeeper.com/v1/publishers/${encodeURIComponent(authId)}/widget-custom-report?${q}`
    const res = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } })
    const text = await res.text()
    let body: any
    try { body = JSON.parse(text) } catch { body = null }
    if (!res.ok || body?.errors) {
      console.error(`Adskeeper API error ${res.status} (${w.start ?? dateInterval}):`, body?.errors ?? text.slice(0, 500))
      process.exit(1)
    }
    return body
  }

  const responses = []
  for (const w of windows) responses.push(await fetchWindow(w))
  const json = responses.length === 1 ? responses[0] : responses.flatMap((r) => extractRows(r) || [])

  if (raw) {
    console.log(JSON.stringify(json, null, 2))
    return
  }

  const rows = extractRows(json)
  if (!rows) {
    console.error('Could not find report rows in the response. Run with --raw and share the structure (not the token).')
    process.exit(1)
  }

  const names = placementNames()
  const groupKey = (r: Row) => {
    const id = String(r.widgetId ?? r.widget_id ?? '?')
    const label = names.get(id)?.join(' / ') || `widget ${id}`
    const parts = [label]
    if (device === 'all') parts.push(String(r.deviceType ?? ''))
    if (groupDim) parts.push(by === 'month' ? String(r.date ?? '').slice(0, 7) : String(r[groupDim] ?? ''))
    return parts.join(' · ')
  }

  // Sum rows that land in the same bucket (e.g. one widget used in two places).
  const buckets = new Map<string, { requests: number; impressions: number; clicks: number; wages: number }>()
  for (const r of rows) {
    const key = groupKey(r)
    const b = buckets.get(key) || { requests: 0, impressions: 0, clicks: 0, wages: 0 }
    b.requests += num(r.adRequests)
    b.impressions += num(r.impressions)
    b.clicks += num(r.clicks)
    b.wages += num(r.wages)
    buckets.set(key, b)
  }

  const sorted = [...buckets.entries()].sort((a, b) =>
    by === 'date' || by === 'month' ? a[0].localeCompare(b[0]) : b[1].wages - a[1].wages,
  )
  const total = sorted.reduce((t, [, b]) => t + b.wages, 0)

  const range = dateInterval === 'interval' ? `${params.get('startDate')} to ${params.get('endDate')}` : dateInterval
  console.log(`\nAdskeeper report: ${range}, device: ${device}, by: ${by}\n`)
  printTable(
    ['position', 'loaded', 'seen', 'seen %', 'CTR', 'eCPM', 'earnings', 'share'],
    sorted.map(([key, b]) => {
      // Adskeeper counts an impression only when the unit is actually seen,
      // so impressions / requests is the share of loaded units readers saw.
      const seen = b.requests ? (b.impressions / b.requests) * 100 : NaN
      const ctr = b.impressions ? (b.clicks / b.impressions) * 100 : NaN
      const ecpm = b.impressions ? (b.wages / b.impressions) * 1000 : 0
      return [key, int(b.requests), int(b.impressions), pct(seen), pct(ctr), money(ecpm), money(b.wages), pct(total ? (b.wages / total) * 100 : NaN)]
    }),
  )
  console.log(`\nTotal earnings: ${money(total)}`)

  if (by === 'position') {
    const notes: string[] = []
    for (const [key, b] of sorted) {
      const seen = b.requests ? (b.impressions / b.requests) * 100 : 100
      if (b.requests >= 20 && seen < 50) notes.push(`${key}: only ${seen.toFixed(0)}% of loaded units were seen; many readers leave before reaching it.`)
      if (total && b.impressions > 0 && b.wages / total < 0.03) notes.push(`${key}: under 3% of earnings; a candidate to remove for a lighter page.`)
      if (b.requests === 0) notes.push(`${key}: no traffic on this device; expected for desktop-only units.`)
    }
    const small = sorted.reduce((t, [, b]) => t + b.impressions, 0) < 1000
    if (small) notes.push('Fewer than 1,000 seen impressions in total; treat these numbers as early signals, not results.')
    if (notes.length) {
      console.log('\nWorth a look:')
      notes.forEach((n) => console.log(`  - ${n}`))
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
