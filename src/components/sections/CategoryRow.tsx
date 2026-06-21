'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Article, Category } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface CategoryRowProps {
  category: Category
  articles: Article[]
}

export function CategoryRow({ category, articles }: CategoryRowProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!articles || articles.length === 0) return null

  const translatedName = (dict as any)[category.slug] || category.name

  return (
    <section className="w-full" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Row Header with red left accent */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-[4px] h-6 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
            <div>
              <h2
                className="font-mono font-bold text-xs uppercase tracking-[0.2em]"
                style={{ color: 'var(--accent-red)' }}
              >
                {translatedName}
              </h2>
            </div>
          </div>
          <Link
            href={`/${locale}/category/${category.slug}`}
            className="font-mono font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {dict.viewAll}
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Horizontal Scroll */}
        <div className="horizontal-scroll gap-4 pb-2">
          {articles.slice(0, 4).map((article, i) => (
            <div key={article.id} className="w-[300px] sm:w-[360px] flex-shrink-0">
              <ArticleCard article={article} size="sm" index={i} className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
