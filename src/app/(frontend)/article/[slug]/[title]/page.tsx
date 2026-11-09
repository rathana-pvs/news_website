import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { sql } from '@payloadcms/db-postgres'
import { getArticle, getRelatedArticles } from '@/lib/api-server'
import { getPayloadClient } from '@/lib/payload'
import { ArticleView } from '@/components/article/ArticleView'

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

  const getImageUrl = (image: any) => {
    if (!image) return null
    let url = ''
    if (typeof image === 'string') {
      url = image
    } else if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
      url = image.url
    } else {
      return null
    }
    if (url.startsWith('/')) {
      return `${siteUrl}${url}`
    }
    return url
  }

  const seoTitle = article.og?.metaTitle || article.meta?.title || article.title
  const seoDescription = article.og?.metaDescription || article.meta?.description || article.excerpt
  const ogImageUrl = getImageUrl(article.og?.ogImage) ||
                     getImageUrl(article.meta?.image) ||
                     getImageUrl(article.coverImage)

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/article/${slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
      type: 'article',
      url: `${siteUrl}/article/${slug}`,
      publishedTime: article.publishedAt,
      authors: [article.author?.name || 'Asian Dot Staff'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
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
  const payload = await getPayloadClient()
  const resolved = await payload.find({ collection: 'share-links' as any,
    where: { and: [{ key: { equals: key } }, { article: { equals: article.id } }] }, limit: 1, depth: 0 })
  if (!resolved.docs.length) notFound()

  const relatedArticles = await getRelatedArticles(article.id, article.category?.id, locale)

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
      // Atomic increment, so simultaneous visits are all counted.
      await (payload.db as any).drizzle.execute(
        sql`UPDATE share_links SET clicks = COALESCE(clicks, 0) + 1, updated_at = now() WHERE id = ${resolved.docs[0].id}`
      )
    }
  } catch (e) {
    console.error('Error tracking share link click:', e)
  }


  return <ArticleView article={article} related={relatedArticles} />
}
