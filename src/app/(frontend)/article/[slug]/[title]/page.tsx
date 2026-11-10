import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { sql } from '@payloadcms/db-postgres'
import { getArticle, getRelatedArticles } from '@/lib/api-server'
import { getPayloadClient } from '@/lib/payload'
import { ArticleView } from '@/components/article/ArticleView'
import { toOgImage } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string; title: string }>
}

// Force dynamic rendering to ensure click tracking runs on every visit
export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // slug = tracking key, title = article slug
  const { slug: key, title: slug } = await params
  const locale = 'en'
  const article = await getArticle(slug, locale)
  if (!article) return { title: 'Article Not Found' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'

  const seoTitle = article.og?.metaTitle || article.meta?.title || article.title
  const seoDescription = article.og?.metaDescription || article.meta?.description || article.excerpt
  const ogImage = toOgImage(article.og?.ogImage, siteUrl) ||
                  toOgImage(article.meta?.image, siteUrl) ||
                  toOgImage(article.coverImage, siteUrl)

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/article/${slug}`,
    },
    openGraph: {
      siteName: 'Asian Dot',
      title: seoTitle,
      description: seoDescription,
      images: ogImage ? [ogImage] : [],
      type: 'article',
      url: `${siteUrl}/article/${slug}`,
      publishedTime: article.publishedAt,
      authors: [article.author?.name || 'Asian Dot Staff'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function DynamicArticlePage({ params }: PageProps) {
  // slug = tracking key, title = article slug
  const { slug: key, title: slug } = await params
  const locale = 'en'
  const article = await getArticle(slug, locale)
  if (!article) notFound()

  // A tracking key must resolve to this article, including for crawler previews.
  // Look it up together with the related articles instead of one after the other.
  const payload = await getPayloadClient()
  const [resolved, relatedArticles] = await Promise.all([
    payload.find({ collection: 'share-links' as any,
      where: { and: [{ key: { equals: key } }, { article: { equals: article.id } }] }, limit: 1, depth: 0 }),
    getRelatedArticles(article.id, article.category?.id, locale),
  ])
  if (!resolved.docs.length) notFound()

  // Track the click on the server side
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const isPrefetch =
      headersList.get('next-router-prefetch') === '1' ||
      /prefetch|prerender/i.test(headersList.get('purpose') || headersList.get('sec-purpose') || '')
    // Link-preview fetchers and scripts. In-app browsers (Facebook, LinkedIn,
    // Pinterest...) are real readers and are still counted.
    const isBot =
      !userAgent ||
      /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|^whatsapp\/|vkshare|headless|lighthouse|curl|wget|python|go-http|java\/|okhttp|axios|node-fetch/i.test(userAgent)

    if (!isBot && !isPrefetch) {
      // Count the click after the page has been sent, so the reader from
      // Facebook doesn't wait for the database write.
      // Atomic increment, so simultaneous visits are all counted.
      const linkId = resolved.docs[0].id
      after(async () => {
        try {
          await (payload.db as any).drizzle.execute(
            sql`UPDATE share_links SET clicks = COALESCE(clicks, 0) + 1, updated_at = now() WHERE id = ${linkId}`
          )
        } catch (e) {
          console.error('Error tracking share link click:', e)
        }
      })
    }
  } catch (e) {
    console.error('Error tracking share link click:', e)
  }


  return <ArticleView article={article} related={relatedArticles} />
}
