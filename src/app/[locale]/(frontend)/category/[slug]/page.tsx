import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticles, getCategories } from '@/lib/api-server'
import { Article, Category } from '@/types'
import { CategoryPageClient } from './CategoryPageClient'

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

import { i18n } from '@/i18n-config'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const categories = await getCategories(locale)
  const category = (categories as Category[]).find((c) => c.slug === slug)
  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} — Asian Dot`,
    description: category.description || `All ${category.name} articles from Asian Dot.`,
  }
}

// Use dynamic rendering — do NOT pre-generate static paths at startup.
// This prevents connection spam to Supabase when the server starts.
export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: PageProps) {
  const { slug, locale } = await params
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
