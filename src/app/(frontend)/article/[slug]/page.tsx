import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Locale } from '@/i18n-config'
import { i18nStrings } from '@/lib/i18n'
import { getArticle, getArticles } from '@/lib/api-server'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { ReadingBar } from '@/components/ui/ReadingBar'
import { RichText } from '@/components/RichText'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Allow older articles not in generateStaticParams to be rendered on-demand and cached
export const dynamicParams = true

// Pre-generate the 20 most recent articles as static pages at deploy time
export async function generateStaticParams() {
  const articles = await getArticles({ limit: 20 })
  return articles.docs.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
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


export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const locale = 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  
  const widgetSidebar = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_SIDEBAR || '2043076'
  const widgetInArticle1 = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1 || '2043077'
  const widgetFeed = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_FEED || '2050525'
  const widgetUnderArticle = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_UNDER_ARTICLE || '2043079'
  const widgetBottomFeed = process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_BOTTOM_FEED || '2050539'
  
  const article = await getArticle(slug, locale)
  if (!article) notFound()

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

      {/* Hero Image Section */}
      <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: 500, maxHeight: 800 }}>
        <Image
          src={heroImage}
          alt={article.coverImage?.alt || article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
        />
        
        {/* Subtle, High-Visibility Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(var(--hero-overlay-rgba), 0.75) 15%, rgba(var(--hero-overlay-rgba), 0) 50%)',
          }}
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col justify-end max-w-[1280px] mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
           {/* Red left bar */}
           <div className="absolute left-0 top-1/2 bottom-20 w-[4px]" style={{ background: 'var(--accent-red)' }} />
           
           <div className="lg:max-w-[1000px]">
              <div className="flex items-center gap-3 mb-6">
                {article.category && (
                  <CategoryBadge name={(dict as any)[article.category.slug] || article.category.name} size="md" />
                )}
                {article.isBreaking && (
                  <span className="font-mono font-bold text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--accent-red)' }}>
                     · {dict.breaking}
                  </span>
                )}
              </div>
              <h1
                className="font-display font-black leading-tight mb-6 tracking-tighter"
                style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--text-primary)' }}
              >
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                 <AuthorChip
                    author={article.author || null}
                    date={article.publishedAt}
                    readTime={article.readTime}
                    size="lg"
                    className="article-hero-chip"
                  />
              </div>
           </div>
        </div>
      </div>

      {/* Article Content Area */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Article Body */}
          <div className="lg:col-span-8">
            {/* Lead Excerpt */}
            <div className="relative mb-12">
               <div className="absolute -left-6 top-0 bottom-0 w-[2px]" style={{ background: 'var(--accent-red)' }} />
               <p
                className="text-xl leading-[1.5] italic"
                style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
              >
                {article.excerpt}
              </p>
            </div>


            {/* Rich Text Body */}
            <div className="article-body prose prose-invert prose-lg max-w-none mb-12">
              {article.content ? (
                <RichText
                  content={article.content}
                  adWidgetId={widgetInArticle1}
                  feedWidgetId={widgetFeed}
                />
              ) : (
                <p className="text-xl leading-relaxed mt-4 italic opacity-50">
                  {dict.comingSoon}
                </p>
              )}
            </div>

           {/* Attribution / Source */}
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


            {/* Author Profile Block */}
            {article.author && (
              <div
                className="mt-16 p-10 border border-[var(--border)] relative bg-[var(--bg-surface)]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <div className="relative w-24 h-24 flex-shrink-0 border border-[var(--border)] p-1">
                    <div className="relative w-full h-full overflow-hidden">
                      {article.author.avatar?.url ? (
                        <Image
                          src={article.author.avatar.url}
                          alt={article.author.name}
                          fill
                          sizes="96px"
                          className="object-cover transition-all duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl font-black"
                          style={{ background: 'var(--accent-red)', color: 'white' }}
                        >
                          {article.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
                      <p className="font-display font-black text-2xl uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {article.author.name}
                      </p>
                      <span className="w-6 h-[1px] bg-[var(--accent-red)] hidden sm:block" />
                      <p className="font-mono font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-red)' }}>
                        {article.author.role}
                      </p>
                    </div>
                    {article.author.bio && (
                      <p className="text-base leading-relaxed mb-4 max-w-2xl" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                        {article.author.bio}
                      </p>
                    )}
                    {article.author.twitter && (
                      <a
                        href={`https://twitter.com/${article.author.twitter}`}
                        className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:text-[var(--accent-red)] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span style={{ color: 'var(--accent-red)' }}>@</span>{article.author.twitter}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              

              {/* Related / Trending Sidebar Ad */}
              <AdskeeperWidget widgetId={widgetSidebar} adType="sidebar" onlyShowOn="desktop" />
            </div>
          </aside>
        </div>


        
        {/* Under Article Native Content Grid */}
        <div className="mt-12 mb-8 border-t border-[var(--border)] pt-8">
           <AdskeeperWidget widgetId={widgetUnderArticle} className="!my-0" />
        </div>

        {/* Feed Bottom Content Widget - Scaled Viewability */}
        <div className="mt-8 mb-12 border-t border-[var(--border)] pt-8">
           <AdskeeperWidget widgetId={widgetBottomFeed} className="!my-0" />
        </div>
      </div>
    </>
  )
}
