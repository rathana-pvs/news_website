import { notFound } from 'next/navigation'
import { getArticles, getRegions } from '@/lib/api'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Article } from '@/types'

export const revalidate = 60

import { i18n } from '@/i18n-config'

export async function generateStaticParams() {
  const regions = await getRegions()
  return i18n.locales.flatMap((locale) => 
    regions.map((reg) => ({
      slug: reg.slug,
      locale,
    }))
  )
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const regions = await getRegions(locale)
  const region = regions.find((r) => r.slug === slug)

  if (!region) {
    notFound()
  }

  const { docs: articles } = await getArticles({ region: slug, limit: 20, locale })

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
          <span className="label-caps tracking-widest text-[#c9a84c]">Region</span>
        </div>
        <h1 className="text-5xl font-display font-bold text-white mb-4">{region.name}</h1>
        {region.description && (
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {region.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article: Article, i: number) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
          <p className="text-white/40 italic">No articles found in this region yet.</p>
        </div>
      )}
    </div>
  )
}
