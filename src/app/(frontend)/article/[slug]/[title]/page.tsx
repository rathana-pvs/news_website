import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Locale } from '@/i18n-config'
import { i18nStrings } from '@/lib/i18n'
import { getArticle, getRelatedArticles } from '@/lib/api-server'
import { getPayloadClient } from '@/lib/payload'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { ReadingBar } from '@/components/ui/ReadingBar'
import { RichText } from '@/components/RichText'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'
import { RelatedArticles } from '@/components/article/RelatedArticles'

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
      canonical: `/article/${key}/${slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
      type: 'article',
      url: `${siteUrl}/article/${key}/${slug}`,
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
  const dict = i18nStrings[locale as Locale] || i18nStrings.en
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  
  const widgetSidebar = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_SIDEBAR || '2043076'
  const widgetInArticle1 = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1 || '2050530'
  const widgetInArticle2 = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2 || '2050533'
  const widgetInArticle3 = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3 || '2057448'
  const widgetFeed = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_FEED || '2050525'
  const widgetUnderArticle = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_UNDER_ARTICLE || '2043079'
  const widgetBottomFeed = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_BOTTOM_FEED || '2050539'

  const article = await getArticle(slug, locale)
  if (!article) notFound()

  const relatedArticles = await getRelatedArticles(article.id, article.category?.id, locale)

  // Track the click on the server side
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit/i.test(userAgent)

    if (!isBot) {
      const payload = await getPayloadClient()
      const shareLinkResult = await payload.find({
        collection: 'share-links' as any,
        where: { key: { equals: key } },
        limit: 1,
      })

      const shareLink = shareLinkResult.docs[0]
      if (shareLink) {
        await payload.update({
          collection: 'share-links' as any,
          id: shareLink.id,
          data: {
            clicks: (shareLink.clicks || 0) + 1,
          },
        })
      }
    }
  } catch (e) {
    console.error('Error tracking share link click:', e)
  }


  const heroImage = article.coverImage?.url || 'https://picsum.photos/seed/article/1400/900'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: [heroImage],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [{
      '@type': 'Person',
      name: article.author?.name || 'Asian Dot Staff',
      url: `${siteUrl}/about`,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Asian Dot',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingBar />

      {/* Editorial Article Header */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-1">
        <div className="max-w-[840px] mx-auto">
          {/* Category & Breaking Badge */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            {article.category && (
              <CategoryBadge name={(dict as any)[article.category.slug] || article.category.name} size="md" />
            )}
            {article.isBreaking && (
              <span className="font-mono font-bold text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--accent-red)' }}>
                 · {dict.breaking}
              </span>
            )}
          </div>

          {/* Main Headline (NYT Playfair Serif Style) */}
          <h1
            className="article-title-nyt font-display font-black leading-tight mb-2 sm:mb-4 tracking-tighter"
            style={{ fontSize: 'clamp(24px, 4.5vw, 42px)', color: 'var(--text-primary)' }}
          >
            {article.title}
          </h1>

          {/* Author & Date Chip */}
          <div className="flex flex-wrap items-center gap-4 mb-3 sm:mb-6">
             <AuthorChip
                author={article.author || null}
                date={article.publishedAt}
                readTime={article.readTime}
                size="lg"
                className="article-hero-chip"
              />
          </div>

          {/* Full Uncropped 16:9 Featured Image (Compact Mobile Height) */}
          <div className="relative w-full aspect-video max-h-[190px] sm:max-h-none rounded-xl overflow-hidden mb-3 sm:mb-6 bg-[var(--bg-secondary)] shadow-sm">
            <Image
              src={heroImage}
              alt={article.coverImage?.alt || article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 840px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Article Content Area */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16">
          
          {/* Main Article Body */}
          <div className="lg:col-span-8">
            {/* Lead Excerpt (Executive Briefing Card Style) */}
            {article.excerpt && (
              <div 
                className="border-l-4 border-[var(--accent-red)] pl-4 pr-4 py-3 mb-4 sm:mb-6 rounded-r-lg shadow-xs"
                style={{ background: 'rgba(231, 76, 60, 0.05)' }}
              >
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent-red)] mb-1 block font-sans">
                  EXECUTIVE SUMMARY
                </span>
                <p
                  className="article-excerpt-nyt text-base sm:text-lg leading-relaxed font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.excerpt}
                </p>
              </div>
            )}


            {/* Rich Text Body with Phased In-Article Ads */}
            <div className="article-body prose prose-invert prose-lg max-w-none mb-4 sm:mb-12">
              {article.content ? (
                <RichText
                  content={article.content}
                  articleTitle={article.title}
                  adWidgetId={widgetInArticle1}
                  adWidgetId2={widgetInArticle2}
                  adWidgetId3={widgetInArticle3}
                  feedWidgetId={widgetFeed}
                />
              ) : (
                <p className="text-xl leading-relaxed mt-4 italic opacity-50">
                  {dict.comingSoon}
                </p>
              )}
            </div>

            {article.credit && (
               <div className="mb-12 py-6 border-t border-b border-[var(--border)] flex items-center gap-4">
                  <span className="font-mono font-bold text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-red)' }}>
                    SOURCE
                  </span>
                  <p className="font-mono text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    {article.credit}
                  </p>
               </div>
            )}


            {/* Under Article Native Content Grid - Positioned immediately under article text */}
            <div className="mt-4 mb-2 border-t border-[var(--border)] pt-4">
              <AdskeeperWidget widgetId={widgetUnderArticle} className="!my-0" />
            </div>

            {/* Recommended / Suggested News - Positioned directly below under_article ad */}
            <RelatedArticles articles={relatedArticles} locale={locale} />
          </div>

          {/* Sidebar Area - Hidden on Mobile */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <AdskeeperWidget widgetId={widgetSidebar} adType="sidebar" onlyShowOn="desktop" />
            </div>
          </aside>
        </div>

        {/* Feed Bottom Content Widget - Scaled Viewability */}
        <div className="mt-0 mb-6 border-t border-[var(--border)] pt-2">
           <AdskeeperWidget widgetId={widgetBottomFeed} className="!my-0" />
        </div>
      </div>
    </>
  )
}
