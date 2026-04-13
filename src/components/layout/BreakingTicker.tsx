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

  // Duplicate for seamless loop
  const items = [...articles, ...articles, ...articles]

  return (
    <div
      className="w-full overflow-hidden flex items-center"
      style={{
        background: 'var(--accent-red)',
        height: 36,
        borderBottom: '1px solid rgba(0,0,0,0.2)',
      }}
    >
      {/* BREAKING Label */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 h-full z-10 border-r"
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderColor: 'rgba(0,0,0,0.15)',
        }}
      >
        <span
          className="live-dot w-1.5 h-1.5 rounded-full bg-white"
        />
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#fff',
          }}
        >
          {dict.breaking}
        </span>
      </div>

      {/* Ticker Content */}
      <div className="flex-1 overflow-hidden">
        <div className="marquee-track">
          {items.map((article, i) => (
            <Link
              key={`${article.id}-${i}`}
              href={`/${locale}/article/${article.slug}`}
              className="flex items-center gap-4 mr-12 hover:underline"
              style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}
            >
              <span
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '9px',
                  letterSpacing: '0.06em',
                  opacity: 0.75,
                }}
              >
                {(dict as any)[article.category?.slug || '']?.toUpperCase() || article.category?.name?.toUpperCase() || 'NEWS'}
              </span>
              <span className="font-serif">{article.title}</span>
              <span style={{ opacity: 0.5 }}>◆</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
