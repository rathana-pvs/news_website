'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Article, Category } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'

type FilterType = 'latest' | 'breaking' | 'opinion'

interface CategoryPageClientProps {
  category: Category
  initialArticles: Article[]
}

export function CategoryPageClient({ category, initialArticles }: CategoryPageClientProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [filter, setFilter] = useState<FilterType>('latest')
  const [page, setPage] = useState(1)
  const PER_PAGE = 12

  const filtered = initialArticles.filter((a) => {
    if (filter === 'breaking') return a.isBreaking
    if (filter === 'opinion') return a.category?.slug === 'opinion'
    return true
  })

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore = paginated.length < filtered.length

  const FILTERS: { label: string; value: FilterType }[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Breaking', value: 'breaking' },
    { label: 'Opinion Only', value: 'opinion' },
  ]

  return (
    <>
      {/* Category Hero Banner */}
      <section
        className="relative w-full py-16 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${category.color}15 0%, var(--bg-surface) 60%, var(--bg-primary) 100%)`,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Shimmer overlay */}
        <div className="shimmer-bg absolute inset-0" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-7xl">{category.icon}</span>
            <div>
              <h1
                className="font-display font-bold"
                style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--text-primary)', lineHeight: 1.3 }}
              >
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 text-base max-w-xl" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
                  {category.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ background: category.color }}
                />
                <span
                  className="label-caps text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {filtered.length} articles
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1) }}
              className="px-4 py-2 rounded-full label-caps text-sm transition-all"
              style={{
                background: filter === f.value ? category.color : 'var(--bg-card)',
                color: filter === f.value ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${filter === f.value ? category.color : 'var(--border)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-2xl mb-2" style={{ color: 'var(--text-muted)' }}>No articles found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different filter</p>
          </div>
        ) : (
          <>
            {/* First Article: Featured Full-Width */}
            {paginated[0] && (
              <Link
                href={`/${locale}/article/${paginated[0].slug}`}
                className="group flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden mb-8 border border-transparent hover:border-[var(--accent-gold)] transition-all"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="relative sm:w-1/2" style={{ minHeight: 280 }}>
                  <Image
                    src={paginated[0].coverImage?.url || 'https://picsum.photos/seed/featured/800/500'}
                    alt={paginated[0].coverImage?.alt || paginated[0].title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="sm:w-1/2 p-8 flex flex-col justify-center">
                  <CategoryBadge name={category.name} color={category.color} className="mb-3 self-start" />
                  <h2
                    className="font-display font-bold text-2xl leading-snug mb-3 group-hover:text-[var(--accent-gold)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {paginated[0].title}
                  </h2>
                  <p className="text-base leading-relaxed mb-5 line-clamp-3" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
                    {paginated[0].excerpt}
                  </p>
                  <AuthorChip author={paginated[0].author || null} date={paginated[0].publishedAt} readTime={paginated[0].readTime} />
                </div>
              </Link>
            )}

            {/* Remaining: 3-col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.slice(1).map((article, i) => (
                <ArticleCard key={article.id} article={article} size="md" index={i} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 rounded-lg label-caps text-base font-bold transition-all hover:opacity-80"
                  style={{
                    background: category.color,
                    color: '#fff',
                  }}
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
