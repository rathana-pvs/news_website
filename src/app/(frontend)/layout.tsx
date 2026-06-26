import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingTicker } from '@/components/layout/BreakingTicker'
import { getCategories, getBreakingArticles } from '@/lib/api-server'
import { GoogleAnalytics } from '@next/third-parties/google'
import { NavigationProgress } from '@/components/layout/NavigationProgress'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'),
  title: {
    default: 'Asian Dot — Independent Political Reporting',
    template: '%s — Asian Dot',
  },
  description: 'Asian Dot delivers sharp, independent political news coverage. Parliament, elections, international affairs, and more.',
  keywords: ['politics', 'news', 'parliament', 'elections', 'asiandot'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'Asian Dot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asian Dot — Independent Political Reporting',
    description: 'Asian Dot delivers sharp, independent political news coverage. Parliament, elections, international affairs, and more.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = 'en'
  const [categories, breakingArticles] = await Promise.all([
    getCategories(locale),
    getBreakingArticles(locale),
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
          <Footer locale={locale} categories={categories} />
        </div>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
