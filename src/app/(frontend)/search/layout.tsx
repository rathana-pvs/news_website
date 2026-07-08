import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Articles',
  description: 'Search articles, investigative reports, and political analysis from Asian Dot.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search Articles — Asian Dot',
    description: 'Search articles, investigative reports, and political analysis from Asian Dot.',
    url: '/search',
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
    title: 'Search Articles — Asian Dot',
    description: 'Search articles, investigative reports, and political analysis from Asian Dot.',
    images: ['/logo.png'],
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
