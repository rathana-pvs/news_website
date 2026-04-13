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

  const DATE_FILTERS: { label: string; value: DateRange }[] = [
    { label: dict.allTime, value: 'all' },
    { label: dict.today, value: 'today' },
    { label: dict.thisWeek, value: 'week' },
    { label: dict.thisMonth, value: 'month' },
  ]

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--text-muted)]">{dict.searchPlaceholder}...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      {/* Search Bar */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>
          {dict.searchArticles}
        </h1>
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2"
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4 rounded-xl text-lg outline-none transition-all"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border)',
              fontFamily: 'Source Serif 4, serif',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="label-caps text-sm px-3 py-1.5 rounded-full transition-all"
            style={{
              background: !selectedCategory ? 'var(--accent-gold)' : 'var(--bg-card)',
              color: !selectedCategory ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: `1px solid ${!selectedCategory ? 'var(--accent-gold)' : 'var(--border)'}`,
            }}
          >
            {dict.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug!)}
              className="label-caps text-sm px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
              style={{
                background: selectedCategory === cat.slug ? `${cat.color}20` : 'var(--bg-card)',
                color: selectedCategory === cat.slug ? cat.color : 'var(--text-secondary)',
                border: `1px solid ${selectedCategory === cat.slug ? cat.color! : 'var(--border)'}`,
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex gap-2 ml-auto">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateRange(f.value)}
              className="label-caps text-sm px-3 py-1.5 rounded-full transition-all"
              style={{
                background: dateRange === f.value ? 'var(--bg-hover)' : 'transparent',
                color: dateRange === f.value ? 'var(--text-primary)' : 'var(--text-muted)',
                border: `1px solid ${dateRange === f.value ? 'var(--border)' : 'transparent'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {query && (
        <p className="label-caps text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          {results.length} {dict.resultsFor} "{query}"
        </p>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {dict.noResults}
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-muted)', fontFamily: 'Source Serif 4, serif' }}>
            {dict.tryDifferent}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/category/${cat.slug}`}
                className="px-4 py-2 rounded-full label-caps text-sm transition-all hover:opacity-80"
                style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {results.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.slug}`}
              className="group flex gap-5 p-4 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-[var(--accent-gold)]"
              style={{ background: 'var(--bg-card)' }}
            >
              {/* Thumbnail */}
              <div className="relative w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={article.coverImage?.url || 'https://picsum.photos/seed/result/400/300'}
                  alt={article.coverImage?.alt || article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center min-w-0">
                {article.category && (
                  <CategoryBadge name={article.category.name} color={article.category.color} size="sm" className="mb-2 self-start" />
                )}
                <h2
                  className="font-display font-bold text-lg leading-snug mb-1.5 line-clamp-2 group-hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title}
                </h2>
                <p
                  className="text-sm leading-relaxed line-clamp-2 mb-3"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
                >
                  {article.excerpt}
                </p>
                <AuthorChip author={article.author || null} date={article.publishedAt} readTime={article.readTime} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
