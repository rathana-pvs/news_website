import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Articles',
  description: 'Search articles, investigative reports, and political analysis from Asian Dot.',
  alternates: {
    canonical: '/search',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
