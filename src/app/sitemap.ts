import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

// Built on request: the Docker build has no database, and the list must
// include articles published since the last deploy.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 1000
// Google's limit per sitemap file is 50,000 URLs.
const MAX_ARTICLES = 45000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'

  // Static pages (excluding search to avoid index bloat)
  const staticPages = ['', '/about', '/contact', '/privacy', '/live']

  // Published articles only: the local API skips access rules, so drafts
  // would otherwise be listed and show up in Search Console as errors.
  const articles: { slug: string; updatedAt: string }[] = []
  for (let page = 1; articles.length < MAX_ARTICLES; page++) {
    const result = await payload.find({
      collection: 'articles',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: PAGE_SIZE,
      page,
      depth: 0,
      select: { slug: true, updatedAt: true },
    })
    articles.push(...(result.docs as any[]))
    if (!result.hasNextPage) break
  }

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
    select: { slug: true },
  })

  const sitemapEntries: MetadataRoute.Sitemap = []

  staticPages.forEach((page) => {
    sitemapEntries.push({
      url: `${siteUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: page === '' ? 1 : 0.8,
    })
  })

  categories.forEach((cat: any) => {
    sitemapEntries.push({
      url: `${siteUrl}/category/${cat.slug}`,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  articles.forEach((article) => {
    if (!article.slug) return
    sitemapEntries.push({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  return sitemapEntries
}
