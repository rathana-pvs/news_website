import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'

  const locales = ['en', 'km']
  
  // Static pages
  const staticPages = ['', '/about', '/contact', '/privacy', '/live', '/search']

  // Fetch all articles
  const { docs: articles } = await payload.find({
    collection: 'articles',
    limit: 1000,
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Fetch all categories
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    select: {
      slug: true,
    },
  })

  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Add static pages
    staticPages.forEach((page) => {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: page === '' ? 1 : 0.8,
      })
    })

    // Add category pages
    categories.forEach((cat: any) => {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/category/${cat.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Add article pages
    articles.forEach((article: any) => {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })
  }

  return sitemapEntries
}
