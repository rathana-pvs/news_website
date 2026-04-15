import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingTicker } from '@/components/layout/BreakingTicker'
import { getCategories, getBreakingArticles, getRegions } from '@/lib/api-server'
import { GoogleAnalytics } from '@next/third-parties/google'
import { NavigationProgress } from '@/components/layout/NavigationProgress'

export const metadata: Metadata = {
  title: {
    default: 'Asian Dot — Independent Political Reporting',
    template: '%s — Asian Dot',
  },
  description: 'Asian Dot delivers sharp, independent political news coverage. Parliament, elections, international affairs, and more.',
  keywords: ['politics', 'news', 'parliament', 'elections', 'asiandot'],
  openGraph: {
    siteName: 'Asian Dot',
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

  return (
    <html lang={locale}>
      <body>
        <NavigationProgress />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <BreakingTicker articles={breakingArticles} />
          <Header categories={categories} locale={locale} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer locale={locale} categories={categories} regions={regions} />
        </div>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
