import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BreakingTicker } from '@/components/layout/BreakingTicker'
import { getCategories, getBreakingArticles } from '@/lib/api-server'
import { GoogleAnalytics } from '@next/third-parties/google'
import { NavigationProgress } from '@/components/layout/NavigationProgress'
import Script from 'next/script'
import { MobileSiteWidget } from '@/components/ads/MobileSiteWidget'
import { adskeeper } from '@/lib/ads'

// Pages are cached and rebuilt at most once a minute; publishing an article
// clears them sooner through revalidateTag('articles') in the Articles hooks.
// The site is built on the server with the real database (deploy.sh), so
// these pages can be prerendered at build time.
export const revalidate = 60

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
  // Large image previews are required for Google Discover cards.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    siteName: 'Asian Dot',
    title: 'Asian Dot — Independent Political Reporting',
    description: 'Asian Dot delivers sharp, independent political news coverage. Parliament, elections, international affairs, and more.',
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
      <head>
        {adskeeper.scriptUrl && (
          // Widgets queue `_mgc.load` in window._mgq, which the script processes
          // when it arrives, so it doesn't need to block the first render.
          <Script
            src={adskeeper.scriptUrl}
            strategy="afterInteractive"
          />
        )}
      </head>
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
        {adskeeper.mobileToaster && (
          <MobileSiteWidget widgetId={adskeeper.mobileToaster} />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <Script id="wau-init" strategy="afterInteractive">
          {`var _wau = _wau || []; _wau.push(["dynamic", "zzpbthitpu", "t8q", "c4302bffffff", "small"]);`}
        </Script>
        <Script src="https://waust.at/d.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
