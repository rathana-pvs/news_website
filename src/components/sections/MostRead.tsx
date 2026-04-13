'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Article } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { formatDate } from '@/lib/utils'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface MostReadProps {
  editorPicks: Article[]
  mostRead: Article[]
}

export function MostRead({ editorPicks, mostRead }: MostReadProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <section className="bg-transparent">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Editor's Picks - 70% */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {dict.editorsPicks}
                </h2>
                <div className="h-0.5 mt-1 w-12" style={{ background: 'var(--accent-gold)' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {editorPicks.slice(0, 3).map((article, i) => (
                <ArticleCard key={article.id} article={article} size="md" index={i} />
              ))}
            </div>
          </div>

          {/* Most Read - 30% */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {dict.mostRead}
                </h2>
                <div className="h-0.5 mt-1 w-12" style={{ background: 'var(--accent-gold)' }} />
              </div>
            </div>

            <div className="flex flex-col gap-0" style={{ borderTop: '1px solid var(--border)' }}>
              {mostRead.slice(0, 5).map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link
                    href={`/${locale}/article/${article.slug}`}
                    className="flex items-start gap-4 py-4 group hover:bg-white/5 px-2 rounded-lg transition-colors -mx-2"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    {/* Number */}
                    <span
                      className="font-display font-bold text-4xl flex-shrink-0 leading-none"
                      style={{ color: i === 0 ? 'var(--accent-gold)' : 'var(--border)', lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      {article.category && (
                        <span
                          className="label-caps text-xs mb-1 block"
                          style={{ color: article.category.color }}
                        >
                          {(dict as any)[article.category.slug || ''] || article.category.name}
                        </span>
                      )}
                      <h3
                        className="font-display font-semibold text-sm leading-snug line-clamp-3 group-hover:text-[var(--accent-gold)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {article.title}
                      </h3>
                      {article.publishedAt && (
                        <p className="label-caps text-xs mt-1.5" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                          {formatDate(article.publishedAt, 'MMM d', locale)}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
