'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Article, Category } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

type FilterType = 'latest' | 'breaking' | 'opinion'

interface CategoryPageClientProps {
  category: Category
  initialArticles: Article[]
}

export function CategoryPageClient({ category, initialArticles }: CategoryPageClientProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en
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
    { label: dict.latest, value: 'latest' },
    { label: dict.breaking, value: 'breaking' },
    { label: dict.opinionOnly, value: 'opinion' },
  ]

  return (
    <>
      {/* Category Hero Banner */}
      <section
        className="relative w-full py-20 overflow-hidden"
        style={{
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Dot matrix background */}
        <div 
          className="absolute inset-0 opacity-[0.3]" 
          style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="relative">
                 {/* Red left accent bar */}
                 <div className="absolute -left-6 top-0 bottom-0 w-[4px]" style={{ background: 'var(--accent-red)' }} />
                 <h1
                   className="font-display font-black tracking-tighter uppercase"
                   style={{ fontSize: 'clamp(40px, 6vw, 64px)', color: 'var(--text-primary)', lineHeight: 0.9 }}
                 >
                   {category.name}
                 </h1>
                 {category.description && (
                   <p className="mt-4 text-lg max-w-xl italic" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                     {category.description}
                   </p>
                 )}
              </div>
              <div className="flex flex-col items-end">
                 <span className="font-mono font-bold text-[9px] uppercase mb-1" style={{ color: 'var(--accent-red)' }}>
                   {dict.record}
                 </span>
                 <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                   {filtered.length.toString().padStart(3, '0')}
                 </span>
              </div>
           </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-12 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1) }}
              className="px-6 py-2 border font-mono font-bold text-[10px] uppercase tracking-widest transition-all"
              style={{
                background: filter === f.value ? 'var(--accent-red)' : 'var(--bg-card)',
                color: filter === f.value ? '#fff' : 'var(--text-secondary)',
                borderColor: filter === f.value ? 'var(--accent-red)' : 'var(--border)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[var(--border)]">
            <p className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-muted)' }}>{dict.noArticlesFound}</p>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{dict.tryDifferent}</p>
          </div>
        ) : (
          <>
            {/* First Article: Featured Full-Width */}
            {paginated[0] && (
              <Link
                href={`/${locale}/article/${paginated[0].slug}`}
                className="group flex flex-col lg:flex-row gap-0 overflow-hidden mb-12 border border-[var(--border)] hover:border-[var(--accent-red)] transition-all"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="relative lg:w-3/5" style={{ minHeight: 350 }}>
                  <Image
                    src={paginated[0].coverImage?.url || 'https://picsum.photos/seed/featured/800/500'}
                    alt={paginated[0].coverImage?.alt || paginated[0].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle diagonal line decoration */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" 
                       style={{ background: 'linear-gradient(45deg, var(--accent-red) -20%, transparent 40%)' }} />
                </div>
                <div className="lg:w-2/5 p-10 flex flex-col justify-center relative">
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-10" 
                       style={{ backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <CategoryBadge name={category.name} size="sm" />
                    {paginated[0].isBreaking && (
                      <span className="font-mono font-bold text-[9px] uppercase tracking-widest" style={{ color: 'var(--accent-red)' }}>
                        · {dict.breaking}
                      </span>
                    )}
                  </div>

                  <h2
                    className="font-display font-black text-3xl sm:text-4xl leading-tight mb-6 tracking-tight group-hover:text-[var(--accent-red)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {paginated[0].title}
                  </h2>
                  <p className="text-base leading-relaxed mb-8 line-clamp-3" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                    {paginated[0].excerpt}
                  </p>
                  <AuthorChip author={paginated[0].author || null} date={paginated[0].publishedAt} readTime={paginated[0].readTime} />
                </div>
              </Link>
            )}

            {/* Remaining: Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginated.slice(1).map((article, i) => (
                <ArticleCard key={article.id} article={article} size="md" index={i} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-12 py-4 border font-mono font-bold text-xs uppercase tracking-[0.3em] transition-all hover:bg-[var(--accent-red)] hover:text-white hover:border-[var(--accent-red)]"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {dict.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
