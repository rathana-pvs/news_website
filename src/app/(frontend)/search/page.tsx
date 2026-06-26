'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Article, Category } from '@/types'
import { getArticles, getCategories } from '@/lib/api'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

type DateRange = 'all' | 'today' | 'week' | 'month'

export default function SearchPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [articlesData, categoriesData] = await Promise.all([
        getArticles({ limit: 100, locale }),
        getCategories(locale)
      ])
      setArticles(articlesData.docs)
      setCategories(categoriesData)
      setLoading(false)
    }
    fetchData()
  }, [locale])

  const filterByDate = (article: any, range: DateRange): boolean => {
    if (range === 'all' || !article.publishedAt) return true
    const pub = new Date(article.publishedAt)
    const now = new Date()
    const diff = now.getTime() - pub.getTime()
    if (range === 'today') return diff < 86400000
    if (range === 'week') return diff < 7 * 86400000
    if (range === 'month') return diff < 30 * 86400000
    return true
  }

  const [visibleCount, setVisibleCount] = useState(12)

  const results = articles.filter((article) => {
    const q = query.toLowerCase()
    const matchesQuery = !q ||
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      (article.author?.name || '').toLowerCase().includes(q)
    const matchesCategory = !selectedCategory || article.category?.slug === selectedCategory
    const matchesDate = filterByDate(article, dateRange)
    return matchesQuery && matchesCategory && matchesDate
  })

  // Display only part of the results based on visibleCount
  const displayedResults = results.slice(0, visibleCount)

  const DATE_FILTERS: { label: string; value: DateRange }[] = [
    { label: dict.allTime, value: 'all' },
    { label: dict.today, value: 'today' },
    { label: dict.thisWeek, value: 'week' },
    { label: dict.thisMonth, value: 'month' },
  ]

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-red)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">INITIALIZING SEARCH ENGINE...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Dot matrix texture background */}
      <div 
        className="absolute inset-0 opacity-[0.2] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="relative z-10">
        {/* Search Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-[4px] h-10" style={{ background: 'var(--accent-red)' }} />
            <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
              {dict.searchArticles}
            </h1>
          </div>
          
          <div className="relative group">
            <svg
              className="absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-[var(--accent-red)] transition-colors"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              style={{ color: 'var(--text-muted)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder={dict.searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setVisibleCount(12) // Reset visible count on search
              }}
              className="w-full pl-16 pr-8 py-5 text-xl outline-none transition-all border border-[var(--border)] focus:border-[var(--accent-red)]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'Syne, sans-serif',
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setVisibleCount(12)
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:text-[var(--accent-red)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="font-mono text-xl">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12 border-b border-[var(--border)] pb-8">
          {/* Category Selection */}
          <div className="flex-1">
             <h3 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>
                FILTER BY CATEGORY
             </h3>
             <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setVisibleCount(12)
                  }}
                  className="font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-2 border transition-all"
                  style={{
                    background: !selectedCategory ? 'var(--accent-red)' : 'var(--bg-card)',
                    color: !selectedCategory ? '#fff' : 'var(--text-secondary)',
                    borderColor: !selectedCategory ? 'var(--accent-red)' : 'var(--border)',
                  }}
                >
                  {dict.allCategories}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const newCat = cat.slug === selectedCategory ? null : cat.slug!
                      setSelectedCategory(newCat)
                      setVisibleCount(12)
                    }}
                    className="font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-2 border transition-all"
                    style={{
                      background: selectedCategory === cat.slug ? 'var(--accent-red)' : 'var(--bg-card)',
                      color: selectedCategory === cat.slug ? '#fff' : 'var(--text-secondary)',
                      borderColor: selectedCategory === cat.slug ? 'var(--accent-red)' : 'var(--border)',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
             </div>
          </div>

          {/* Date Filter */}
          <div className="flex-shrink-0">
             <h3 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>
                TIMELINE
             </h3>
             <div className="flex gap-1 border border-[var(--border)] p-1 bg-[var(--bg-card)]">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setDateRange(f.value)
                      setVisibleCount(12)
                    }}
                    className="font-mono font-bold text-[9px] uppercase tracking-widest px-4 py-2 transition-all"
                    style={{
                      background: dateRange === f.value ? 'var(--accent-red)' : 'transparent',
                      color: dateRange === f.value ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Results Info */}
        {query && (
          <div className="flex items-center gap-4 mb-8">
             <div className="w-8 h-[2px]" style={{ background: 'var(--accent-red)' }} />
             <p className="font-mono font-bold text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
                FOUND {results.length.toString().padStart(2, '0')} RESULTS FOR "{query}"
             </p>
          </div>
        )}

        {/* Results Listing */}
        {results.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-[var(--border)] bg-[var(--bg-surface)]">
            <h2 className="font-display font-black text-4xl uppercase tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              {dict.noResults}
            </h2>
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>
              {dict.tryDifferent}
            </p>
            <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto px-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="px-6 py-3 border font-mono font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-[var(--accent-red)] hover:text-white"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              {displayedResults.map((article) => (
                <Link
                  key={article.id}
                  href={`/${locale}/article/${article.slug}`}
                  className="group flex flex-col sm:flex-row gap-8 p-6 border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-red)] transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-64 h-48 overflow-hidden flex-shrink-0 border border-[var(--border)]">
                    <Image
                      src={article.coverImage?.url || 'https://picsum.photos/seed/result/400/300'}
                      alt={article.coverImage?.alt || article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 256px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {article.category && (
                        <CategoryBadge name={article.category.name} color={article.category.color} size="sm" />
                      )}
                      {article.isBreaking && (
                         <span className="font-mono font-bold text-[9px] uppercase tracking-widest" style={{ color: 'var(--accent-red)' }}>
                           · BREAKING
                         </span>
                      )}
                    </div>
                    <h2
                      className="font-display font-black text-2xl leading-tight mb-4 tracking-tight group-hover:text-[var(--accent-red)] transition-colors line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {article.title}
                    </h2>
                    <p
                      className="text-base leading-relaxed mb-6 line-clamp-2"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}
                    >
                      {article.excerpt}
                    </p>
                    <div className="mt-auto">
                       <AuthorChip author={article.author || null} date={article.publishedAt} readTime={article.readTime} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination / Load More */}
            {results.length > visibleCount && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-12 py-5 border border-[var(--border)] font-mono font-bold text-xs uppercase tracking-[0.3em] transition-all hover:bg-[var(--accent-red)] hover:text-white hover:border-[var(--accent-red)]"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                   LOAD MORE DATA
                </button>
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                  RECORDS {visibleCount} / {results.length} ACCESSED
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
