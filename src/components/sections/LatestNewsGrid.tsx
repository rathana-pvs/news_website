'use client'

import { useParams } from 'next/navigation'
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
    <section className="w-full bg-[#0a0a0a]/50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article, i) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              size="sm" 
              index={i} 
              className="h-full bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10"
            />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 rounded-full border border-[#c9a84c]/30 text-[#c9a84c] text-sm label-caps transition-all hover:bg-[#c9a84c]/10">
            {dict.viewAll}
          </button>
        </div>
      </div>
    </section>
  )
}
