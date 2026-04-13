import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingTicker } from '@/components/layout/BreakingTicker'
import { getCategories, getBreakingArticles, getRegions } from '@/lib/api'

export const metadata: Metadata = {
  title: {
    default: 'The Tribune — Independent Political Reporting',
    template: '%s — The Tribune',
  },
  description: 'The Tribune delivers sharp, independent political news coverage. Parliament, elections, international affairs, and more.',
  keywords: ['politics', 'news', 'parliament', 'elections', 'tribune'],
  openGraph: {
    siteName: 'The Tribune',
    type: 'website',
  },
}

export default async function FrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [categories, breakingArticles, regions] = await Promise.all([
    getCategories(locale),
    getBreakingArticles(locale),
    getRegions(locale),
  ])
  console.log(categories)

  return (
    <html lang={locale}>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <BreakingTicker articles={breakingArticles as any} />
          <Header categories={categories as any} locale={locale} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer locale={locale} categories={categories as any} regions={regions as any} />
        </div>
      </body>
    </html>
  )
}
