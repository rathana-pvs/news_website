import Image from 'next/image'
import Link from 'next/link'
import { Article } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { formatDate, jsonLdString } from '@/lib/utils'
import { ReadingBar } from '@/components/ui/ReadingBar'
import { RichText } from '@/components/RichText'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'
import { RelatedArticles } from '@/components/article/RelatedArticles'
import { adskeeper } from '@/lib/ads'

const dict = i18nStrings.en

/** Article layout shared by /article/[slug] and the tracked /article/[key]/[slug] route. */
export function ArticleView({ article, related }: { article: Article; related: Article[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const heroImage = article.coverImage?.url || 'https://picsum.photos/seed/article/1400/900'
  const categoryName = article.category
    ? (dict as any)[article.category.slug] || article.category.name
    : ''
  const authorName = article.author && typeof article.author === 'object' ? article.author.name : ''

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
      name: authorName || 'Asian Dot Staff',
      url: `${siteUrl}/about`,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Asian Dot',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <ReadingBar />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <article className="min-w-0 w-full max-w-[720px] lg:mx-auto">
            {/* Fly-title */}
            <div className="mb-3 flex flex-wrap items-center gap-x-2 text-[14px] font-semibold">
              {article.category && (
                <Link href={`/category/${article.category.slug}`} className="hover:underline" style={{ color: 'var(--accent-red)' }}>
                  {categoryName}
                </Link>
              )}
              {article.isBreaking && (
                <span style={{ color: 'var(--accent-red)' }}>
                  {article.category ? '| ' : ''}Breaking
                </span>
              )}
            </div>

            <h1 className="headline" style={{ fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.08 }}>
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="rubric mt-4" style={{ fontSize: 'clamp(19px, 2.4vw, 23px)', lineHeight: 1.35 }}>
                {article.excerpt}
              </p>
            )}

            {/* Image and caption */}
            <figure className="mt-6 sm:mt-8 -mx-4 sm:mx-0">
              <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: 'var(--bg-surface)' }}>
                <Image
                  src={heroImage}
                  alt={article.coverImage?.alt || article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
              {(() => {
                const alt = article.coverImage?.alt
                const caption = article.credit
                  ? `Source: ${article.credit}`
                  : alt && alt.trim() !== article.title.trim() ? alt : ''
                return caption ? <figcaption className="meta mt-2 px-4 sm:px-0">{caption}</figcaption> : null
              })()}
            </figure>

            {/* Date line */}
            <div
              className="mt-6 pb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]"
              style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
            >
              {article.publishedAt && (
                <time dateTime={article.publishedAt} className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(article.publishedAt, 'MMM do yyyy')}
                </time>
              )}
              {authorName && <span>By {authorName}</span>}
              {article.readTime ? <span>{article.readTime} {dict.minRead}</span> : null}
            </div>

            {/* Body */}
            <div className="article-body max-w-none mt-6 mb-10" data-article-content>
              {article.content ? (
                <RichText
                  content={article.content}
                  articleTitle={article.title}
                  analyticsId={article.slug}
                  adWidgetId={adskeeper.articleInline1}
                  adWidgetId2={adskeeper.articleInline2}
                  adWidgetId3={adskeeper.articleInline3}
                />
              ) : (
                <p className="italic" style={{ color: 'var(--text-muted)' }}>{dict.comingSoon}</p>
              )}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {article.tags.map((tag: any) => (
                  <span
                    key={tag.id || tag.name}
                    className="text-[12px] font-semibold px-2.5 py-1"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Our own stories first, so readers who finish keep reading here;
                the ad feed then catches everyone who keeps scrolling. */}
            <RelatedArticles articles={related} categoryName={categoryName} />

            {adskeeper.articleBottom && (
              // Keep this unit in normal document flow for placement compliance.
              <div className="mt-10 mb-6" data-article-end>
                <AdskeeperWidget widgetId={adskeeper.articleBottom} placement="article_bottom" className="!my-0" />
              </div>
            )}
          </article>

          {/* Right rail, desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              {adskeeper.articleSidebar && (
                <AdskeeperWidget
                  widgetId={adskeeper.articleSidebar}
                  placement="article_sidebar"
                  adType="sidebar"
                  onlyShowOn="desktop"
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
