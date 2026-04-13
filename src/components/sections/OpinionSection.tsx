'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Article } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface OpinionSectionProps {
  articles: Article[]
}

export function OpinionSection({ articles }: OpinionSectionProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!articles || articles.length === 0) return null

  return (
    <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">💬</span>
          <div>
            <h2
              className="font-display font-bold text-2xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {dict.opinion}
            </h2>
            <div className="h-0.5 mt-1 w-12" style={{ background: '#c9a84c' }} />
          </div>
        </div>

        {/* Columnist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/${locale}/article/${article.slug}`}
                className="group block rounded-xl p-6 h-full transition-all hover:bg-white/5 border border-transparent hover:border-[var(--accent-gold)]"
                style={{ background: 'var(--bg-card)' }}
              >
                {/* Author Avatar + Name */}
                {article.author && (
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--accent-gold)]">
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
                          className="w-full h-full flex items-center justify-center text-lg font-bold"
                          style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
                        >
                          {article.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                        {article.author.name}
                      </p>
                      <p className="label-caps" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                        {article.author.role}
                      </p>
                    </div>
                  </div>
                )}

                {/* Article Headline */}
                <h3
                  className="font-display font-bold text-lg leading-snug mb-3 group-hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p
                  className="text-sm leading-relaxed line-clamp-2"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
                >
                  {article.excerpt}
                </p>

                {/* Read More */}
                <div
                  className="label-caps mt-4 flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  {dict.readColumn}
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
