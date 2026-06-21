'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Article, Region } from '@/types'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface RegionSectionProps {
  regions: Region[]
  articlesByRegion: Record<string, Article[]>
}

export function RegionSection({ regions, articlesByRegion }: RegionSectionProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!regions || regions.length === 0) return null

  // Show only first 4 regions for this layout
  const displayRegions = regions.slice(0, 4)

  return (
    <section className="w-full bg-[var(--bg-surface)] py-12 border-y border-[var(--border)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="label-caps !text-[var(--accent-red)] tracking-[0.2em] mb-2 block">{dict.globalCoverage}</span>
            <h2 className="text-3xl font-display font-bold text-[var(--text-primary)]">{dict.regionalReports}</h2>
          </div>
          <div className="hidden sm:block h-[1px] flex-grow mx-8 bg-gradient-to-r from-[var(--accent-red)]/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayRegions.map((region) => {
            const articles = articlesByRegion[region.slug] || []
            const leadArticle = articles[0]
            const listArticles = articles.slice(1, 3)
            const regionName = (dict as any)[region.slug] || region.name

            return (
              <div key={region.id} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)] group flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />
                    {regionName}
                  </h3>
                  <Link 
                    href={`/${locale}/region/${region.slug}`}
                    className="text-sm font-bold tracking-wider text-right text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors ml-4 whitespace-nowrap"
                  >
                    {dict.allIn}
                  </Link>
                </div>

                {leadArticle ? (
                  <div className="space-y-4">
                    <ArticleCard 
                      article={leadArticle} 
                      size="sm" 
                      index={0}
                    />
                    
                    <div className="space-y-3 pt-2">
                      {listArticles.map((article) => (
                        <Link 
                          key={article.id} 
                          href={`/${locale}/article/${article.slug}`}
                          className="group block border-t border-[var(--border)] pt-3"
                        >
                          <h4 className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-red)] transition-colors line-clamp-2 leading-relaxed">
                            {article.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-[var(--bg-card)] border border-[var(--border)] rounded flex items-center justify-center text-[var(--text-muted)] text-xs italic p-4 text-center">
                    {dict.comingSoon}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
