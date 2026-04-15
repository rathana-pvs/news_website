import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/HeroSection'
import { CategoryRow } from '@/components/sections/CategoryRow'
import { RegionSection } from '@/components/sections/RegionSection'
import { OpinionSection } from '@/components/sections/OpinionSection'
import { MostRead } from '@/components/sections/MostRead'
import { LatestNewsGrid } from '@/components/sections/LatestNewsGrid'
import { AdBanner } from '@/components/ads/AdBanner'
import { getArticles, getCategories, getFeatured, getRegions } from '@/lib/api-server'
import { Article, Category, Region } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

export const metadata: Metadata = {
  title: 'Asian Dot — Independent Political Reporting',
  description: 'Breaking political news, parliament coverage, international affairs, and deep investigations from Asian Dot.',
}

export const revalidate = 10

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const [{ hero, secondary }, allArticles, categories, regions] = await Promise.all([
    getFeatured(locale),
    getArticles({ limit: 40, locale }),
    getCategories(locale),
    getRegions(locale),
  ])

  const articles = allArticles.docs as Article[]
  const cats = categories as Category[]
  const regs = regions as Region[]

  // Opinion articles
  const opinionArticles = articles.filter((a) => a.category?.slug === 'opinion')

  // Editor's picks (first 3 non-featured)
  const editorPicks = articles.filter((a) => !a.isFeatured).slice(0, 3)

  // Mock "most read" as top 5
  const mostRead = articles.slice(0, 5)

  // Build articles per category map
  const articlesByCategory: Record<string, Article[]> = {}
  cats.forEach((cat) => {
    articlesByCategory[cat.slug] = articles.filter((a) => a.category?.slug === cat.slug)
  })

  // Build articles per region map
  const articlesByRegion: Record<string, Article[]> = {}
  regs.forEach((reg) => {
    articlesByRegion[reg.slug] = articles.filter((a) => a.region?.slug === reg.slug)
  })

  return (
    <>
      {/* Hero */}
      <HeroSection hero={hero} secondary={secondary} />

      {/* Ad Spot */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <AdBanner format="728x90" label="Sponsor Spotlight" />
      </div>

      {/* Latest News Divider */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 py-8">
          <h2 className="label-caps !text-[#c9a84c] tracking-[0.2em] whitespace-nowrap">
            {dict.latestNews}
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-[#c9a84c]/30 to-transparent" />
        </div>
      </div>

      <LatestNewsGrid articles={articles.slice(0, 8)} />

      {/* Second Ad Spot */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <AdBanner format="728x90" label="Global News Sponsor" />
      </div>

      {/* Category Rows */}
      {cats.slice(0, 2).map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          articles={articlesByCategory[cat.slug] || articles.slice(0, 4)}
        />
      ))}

      {/* Regions Section */}
      <RegionSection regions={regs} articlesByRegion={articlesByRegion} />

      {/* Rest of Categories */}
      {cats.slice(2).map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          articles={articlesByCategory[cat.slug] || articles.slice(0, 4)}
        />
      ))}

      {/* Opinion Section */}
      <OpinionSection articles={opinionArticles.length > 0 ? opinionArticles : articles.slice(0, 3)} />

      {/* Most Read + Editor's Picks */}
      <MostRead editorPicks={editorPicks} mostRead={mostRead} />
    </>
  )
}
