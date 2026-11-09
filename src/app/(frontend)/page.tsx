import { jsonLdString } from '@/lib/utils'
import type { Metadata } from 'next'
import {
  TopStories,
  StoryRow,
  InBrief,
  SectionBlock,
  PicksAndPopular,
} from '@/components/home/HomeBlocks'
import { getArticles, getCategories, getFeatured } from '@/lib/api-server'
import { Article, Category } from '@/types'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'
import { adskeeper } from '@/lib/ads'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Asian Dot — Independent Political Reporting',
  description: 'Breaking political news, parliament coverage, international affairs, and deep investigations from Asian Dot.',
  openGraph: {
    title: 'Asian Dot — Independent Political Reporting',
    description: 'Breaking political news, parliament coverage, international affairs, and deep investigations from Asian Dot.',
    url: '/',
    siteName: 'Asian Dot',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Asian Dot Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asian Dot — Independent Political Reporting',
    description: 'Breaking political news, parliament coverage, international affairs, and deep investigations from Asian Dot.',
    images: ['/logo.png'],
  },
}



export default async function HomePage() {
  const locale = 'en'

  const [{ hero, secondary }, allArticles, categories] = await Promise.all([
    getFeatured(locale),
    getArticles({ limit: 60, locale }),
    getCategories(locale),
  ])

  const articles = allArticles.docs as Article[]
  const cats = categories as Category[]

  // Hand out stories top to bottom so the same one never appears twice.
  const used = new Set<Article['id']>()
  const take = (pool: Article[], n: number) => {
    const picked: Article[] = []
    for (const a of pool) {
      if (picked.length >= n) break
      if (!a || used.has(a.id)) continue
      used.add(a.id)
      picked.push(a)
    }
    return picked
  }

  const lead = take(hero ? [hero, ...articles] : articles, 1)[0]
  const secondaryStories = take([...secondary, ...articles.filter((a) => a.isFeatured), ...articles], 2)
  const latest = take(articles, 6)
  const row = take(articles, 4)
  const brief = take(articles, 6)

  const sections = cats.map((cat) => ({
    category: cat,
    articles: take(articles.filter((a) => a.category?.slug === cat.slug), 5),
  }))

  const picks = take(articles.filter((a) => !a.isFeatured), 3)
  // No view counts yet, so "most read" is the most recent stories.
  const mostRead = articles.slice(0, 5)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Asian Dot',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/asiandot',
      'https://www.facebook.com/asiandot',
    ],
    publishingPrinciples: `${siteUrl}/about`,
    ethicsPolicy: `${siteUrl}/about`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {lead && <TopStories lead={lead} secondary={secondaryStories} latest={latest} />}

      <StoryRow articles={row} />

      <InBrief articles={brief} />

      {adskeeper.homeFeed && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 my-10">
          <AdskeeperWidget widgetId={adskeeper.homeFeed} placement="home_feed" />
        </div>
      )}

      {sections.map(({ category, articles: list }) => (
        <SectionBlock key={category.id} category={category} articles={list} />
      ))}

      <PicksAndPopular picks={picks} popular={mostRead} />

      {adskeeper.homeBottom && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-12">
          <AdskeeperWidget widgetId={adskeeper.homeBottom} placement="home_bottom" />
        </div>
      )}
    </>
  )
}
