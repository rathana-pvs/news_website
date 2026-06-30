import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticles, getCategories } from '@/lib/api-server'
import { Article, Category } from '@/types'
import { CategoryPageClient } from './CategoryPageClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const locale = 'en'
  const categories = await getCategories(locale)
  const category = (categories as Category[]).find((c) => c.slug === slug)
  if (!category) return { title: 'Category Not Found' }

  return {
    title: category.name,
    description: category.description || `All ${category.name} articles from Asian Dot.`,
    alternates: {
      canonical: `/category/${slug}`,
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
