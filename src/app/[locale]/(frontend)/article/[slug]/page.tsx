import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticle, getArticles, getRelatedArticles } from '@/lib/api'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { BreakingBadge } from '@/components/ui/BreakingBadge'
import { ReadingBar } from '@/components/ui/ReadingBar'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { RichText } from '@/components/RichText'
import { formatDate } from '@/lib/utils'
import { Article } from '@/types'

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

import { i18n, Locale } from '@/i18n-config'
import { i18nStrings } from '@/lib/i18n'

export async function generateStaticParams() {
  const { docs } = await getArticles({ limit: 100 })
  return i18n.locales.flatMap((locale) => 
    docs.map((article) => ({ slug: article.slug, locale }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const article = await getArticle(slug, locale)
  if (!article) return { title: 'Article Not Found' }

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage?.url ? [article.coverImage.url] : [],
      type: 'article',
    },
  }
}

export const revalidate = 5

export default async function ArticlePage({ params }: PageProps) {
  const { slug, locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en
  
  const article = await getArticle(slug, locale)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id, article.category?.id, locale)

  const heroImage = article.coverImage?.url || 'https://picsum.photos/seed/article/1400/900'

  return (
    <>
      <ReadingBar />

      {/* Hero Image */}
      <div className="relative w-full" style={{ height: '60vh', minHeight: 400, maxHeight: 700 }}>
        <Image
          src={heroImage}
          alt={article.coverImage?.alt || article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.2) 0%, rgba(13,17,23,0.97) 85%)' }}
        />

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-[900px] mx-auto">
          <div className="flex gap-2 mb-4">
            {article.category && (
              <CategoryBadge name={(dict as any)[article.category.slug] || article.category.name} color={article.category.color} />
            )}
            {article.isBreaking && <BreakingBadge />}
          </div>
          <h1
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--text-primary)' }}
          >
            {article.title}
          </h1>
        </div>
      </div>

      {/* Article Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Author + Meta */}
            <div
              className="flex flex-wrap items-center gap-4 pb-6 mb-8"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <AuthorChip
                author={article.author || null}
                date={article.publishedAt}
                readTime={article.readTime}
                size="lg"
              />
            </div>

            {/* Excerpt – Lead */}
            <p
              className="text-xl leading-relaxed mb-8 font-semibold"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '1.25rem' }}
            >
              {article.excerpt}
            </p>

            {/* Article Body */}
            <div className="article-body">
              {article.content ? (
                <RichText content={article.content} />
              ) : (
                <p className="text-xl leading-relaxed mt-4 italic" style={{ color: 'var(--text-muted)' }}>
                  {dict.comingSoon}
                </p>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div
                className="mt-10 pt-6"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="label-caps text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      #{t.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {article.author && (
              <div
                className="mt-10 p-6 rounded-xl flex gap-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  {article.author.avatar?.url ? (
                    <Image
                      src={article.author.avatar.url}
                      alt={article.author.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-xl font-bold"
                      style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
                    >
                      {article.author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {article.author.name}
                  </p>
                  <p className="label-caps text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    {article.author.role}
                  </p>
                  {article.author.bio && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
                      {article.author.bio}
                    </p>
                  )}
                  {article.author.twitter && (
                    <a
                      href={`https://twitter.com/${article.author.twitter}`}
                      className="label-caps text-sm mt-2 flex items-center gap-1.5 hover:underline"
                      style={{ color: 'var(--accent-gold)' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{article.author.twitter}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Share Buttons */}
              <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="label-caps text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {dict.shareArticle}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Share on X / Twitter', icon: '𝕏', color: '#1DA1F2' },
                    { label: 'Share on Facebook', icon: 'f', color: '#4267B2' },
                    { label: 'Share on Telegram', icon: '✈', color: '#0088cc' },
                    { label: 'Copy Link', icon: '🔗', color: 'var(--text-muted)' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 text-left"
                      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      <span className="font-bold" style={{ color: btn.color }}>{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Article Meta */}
              <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="label-caps text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {dict.articleDetails}
                </p>
                <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {article.publishedAt && (
                    <div>
                      <span className="label-caps text-xs block mb-0.5" style={{ color: 'var(--text-muted)' }}>{dict.published}</span>
                      {formatDate(article.publishedAt, 'MMMM d, yyyy · HH:mm', locale)}
                    </div>
                  )}
                  {article.readTime && (
                    <div>
                      <span className="label-caps text-xs block mb-0.5" style={{ color: 'var(--text-muted)' }}>{dict.readTime}</span>
                      {article.readTime} {dict.minRead}
                    </div>
                  )}
                  {article.category && (
                    <div>
                      <span className="label-caps text-xs block mb-0.5" style={{ color: 'var(--text-muted)' }}>{dict.category}</span>
                      <CategoryBadge name={(dict as any)[article.category.slug || ''] || article.category.name} color={article.category.color} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {related && related.length > 0 && (
          <div className="mt-16 pt-10" style={{ borderTop: '1px solid var(--border)' }}>
            <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
              {dict.relatedArticles}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(related as Article[]).map((a, i) => (
                <ArticleCard key={a.id} article={a} size="md" index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
