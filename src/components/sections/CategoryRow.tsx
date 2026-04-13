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
    <section className="w-full">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {/* Row Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h2
                className="font-display font-bold text-xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {translatedName}
              </h2>
              <div
                className="h-0.5 mt-1 w-12"
                style={{ background: category.color }}
              />
            </div>
          </div>
          <Link
            href={`/${locale}/category/${category.slug}`}
            className="label-caps text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: category.color, border: `1px solid ${category.color}40` }}
          >
            {dict.viewAll}
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Horizontal Scroll */}
        <div className="horizontal-scroll gap-4 pb-2">
          {articles.slice(0, 4).map((article, i) => (
            <div key={article.id} className="w-[320px] sm:w-[400px] flex-shrink-0">
              <ArticleCard article={article} size="sm" index={i} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
