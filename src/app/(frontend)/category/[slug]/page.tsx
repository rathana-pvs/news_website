import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticles, getCategories } from '@/lib/api-server'
import { Article, Category } from '@/types'
import { CategoryPageClient } from './CategoryPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Cache category pages like the rest of the site (see the frontend layout).
// New categories are rendered on first visit and cached from then on.
export const dynamicParams = true
export const revalidate = 60

export async function generateStaticParams() {
  const categories = await getCategories('en')
  return (categories as Category[]).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const locale = 'en'
  const categories = await getCategories(locale)
  const category = (categories as Category[]).find((c) => c.slug === slug)
  if (!category) return { title: 'Category Not Found' }

  const title = `${category.name} — Asian Dot`
  const description = category.description || `Read the latest articles about ${category.name} on Asian Dot.`

  return {
    title: category.name,
    description: description,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: title,
      description: description,
      url: `/category/${slug}`,
      siteName: 'Asian Dot',
      images: [
        {
          url: '/logo.png',
          width: 1024,
          height: 1024,
          alt: 'Asian Dot Logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['/logo.png'],
    },
  }
}



export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const locale = 'en'
  const [categories, { docs: articles }] = await Promise.all([
    getCategories(locale),
    getArticles({ category: slug, limit: 50, locale }),
  ])

  const category = (categories as Category[]).find((c) => c.slug === slug)
  if (!category) notFound()

  return (
    <CategoryPageClient
      category={category}
      initialArticles={articles as Article[]}
    />
  )
}
