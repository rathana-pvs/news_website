'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Article } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface BreakingTickerProps {
  articles: Article[]
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!articles || articles.length === 0) return null

  // Duplicated so the marquee loops without a gap
  const items = [...articles, ...articles, ...articles]

  return (
    <div
      className="hidden md:flex w-full overflow-hidden items-center"
      style={{ background: 'var(--bg-primary)', height: 34, borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-[1280px] w-full mx-auto px-6 flex items-center h-full gap-4">
        <span
          className="flex-shrink-0 text-[12px] font-bold uppercase tracking-[0.06em]"
          style={{ color: 'var(--accent-red)' }}
        >
          {dict.breaking}
        </span>
        <div className="flex-1 overflow-hidden h-full flex items-center">
          <div className="marquee-track">
            {items.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                href={`/article/${article.slug}`}
                className="flex items-center gap-3 mr-10 text-[13px] hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {(dict as any)[article.category?.slug || ''] || article.category?.name || 'News'}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)' }}>{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
