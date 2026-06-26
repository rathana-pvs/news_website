import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'

  
  // Static pages (excluding search to avoid index bloat)
  const staticPages = ['', '/about', '/contact', '/privacy', '/live']

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

  // Add static pages
  staticPages.forEach((page) => {
    sitemapEntries.push({
      url: `${siteUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: page === '' ? 1 : 0.8,
    })
  })

  // Add category pages
  categories.forEach((cat: any) => {
    sitemapEntries.push({
      url: `${siteUrl}/category/${cat.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })

  // Add article pages
  articles.forEach((article: any) => {
    sitemapEntries.push({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  return sitemapEntries
}
