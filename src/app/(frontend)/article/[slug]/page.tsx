import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticle, getArticles, getRelatedArticles } from '@/lib/api-server'
import { ArticleView } from '@/components/article/ArticleView'
import { toOgImage } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Allow older articles not in generateStaticParams to be rendered on-demand and cached
export const dynamicParams = true
export const revalidate = 60

// Pre-generate the 40 most recent articles as static pages at deploy time
export async function generateStaticParams() {
  const articles = await getArticles({ limit: 40 })
  return articles.docs.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
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


export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const locale = 'en'
  const article = await getArticle(slug, locale)
  if (!article) notFound()

  const relatedArticles = await getRelatedArticles(article.id, article.category?.id, locale)

  return <ArticleView article={article} related={relatedArticles} />
}
