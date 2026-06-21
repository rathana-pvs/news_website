'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Article } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface LatestNewsGridProps {
  articles: Article[]
}

export function LatestNewsGrid({ articles }: LatestNewsGridProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!articles || articles.length === 0) return null

  return (
    <section className="w-full" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">

        {/* Section Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-[4px] h-6 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
          <h2 className="font-mono font-bold text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent-red)' }}>
            {dict.latest || 'Latest'}
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              size="sm"
              index={i}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/search`}
            className="inline-flex items-center gap-2 px-8 py-3 font-mono font-bold text-[11px] uppercase tracking-[0.15em] transition-all hover:bg-[var(--accent-red)] hover:text-white"
            style={{
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
            }}
          >
            {dict.viewAll}
          </Link>
        </div>

      </div>
    </section>
  )
}
