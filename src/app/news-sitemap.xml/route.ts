import { getPayloadClient } from '@/lib/payload'

/**
 * Google News sitemap: articles published in the last 48 hours (Google
 * ignores older entries), at most 1,000 URLs.
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export const dynamic = 'force-dynamic'

const PUBLICATION_NAME = 'Asian Dot'
const LANGUAGE = 'en'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      status: { equals: 'published' },
      publishedAt: { greater_than_equal: since },
    },
    sort: '-publishedAt',
    limit: 1000,
    depth: 0,
    select: { slug: true, title: true, publishedAt: true },
  })

  const urls = (docs as any[])
    .filter((doc) => doc.slug && doc.title && doc.publishedAt)
    .map(
      (doc) => `  <url>
    <loc>${escapeXml(`${siteUrl}/article/${doc.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${new Date(doc.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(doc.title)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
