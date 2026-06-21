import { Article, Category, PaginatedArticles, Region } from '@/types'
import { getPayloadClient } from './payload'

export async function getArticles(params?: {
  category?: string
  region?: string
  limit?: number
  page?: number
  where?: Record<string, any>
  locale?: string
}): Promise<PaginatedArticles> {
  const currentLocale = (params?.locale && ['en', 'km'].includes(params.locale)) ? params.locale : 'en'
  const payload = await getPayloadClient()
  
  const whereClause: any = {
    status: { equals: 'published' },
    ...(params?.where || {}),
  }

  if (params?.category) {
    whereClause['category.slug'] = { equals: params.category }
  }
  if (params?.region) {
    whereClause['region.slug'] = { equals: params.region }
  }

  if (params?.locale) {
    whereClause.or = [
      { language: { equals: params.locale } },
      { language: { equals: 'all' } }
    ]
  }

  const result = await payload.find({
    collection: 'articles',
    limit: params?.limit || 12,
    page: params?.page || 1,
    where: whereClause,
    locale: currentLocale as any,
    depth: 2,
    sort: '-publishedAt',
  })

  return result as unknown as PaginatedArticles
}

export async function getArticle(slug: string, localeProp?: string): Promise<Article | null> {
  const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    locale: locale as any,
  })
  return (result.docs[0] as unknown as Article) || null
}

export async function getCategories(locale?: string): Promise<Category[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    limit: 20,
    locale: locale as any,
    select: {
      name: true,
      slug: true,
      color: true,
    }
  })
  return result.docs as unknown as Category[]
}

export async function getRegions(locale?: string): Promise<Region[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'regions',
    limit: 20,
    locale: locale as any,
  })
  return result.docs as unknown as Region[]
}

export async function getFeatured(localeProp?: string): Promise<{ hero: Article | null; secondary: Article[] }> {
  const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: {
      isFeatured: { equals: true },
      status: { equals: 'published' },
      or: [
        { language: { equals: locale || 'en' } },
        { language: { equals: 'all' } }
      ]
    },
    limit: 3,
    depth: 2,
    sort: '-publishedAt',
    locale: locale as any,
  })
  const docs = result.docs as unknown as Article[]
  return { hero: docs[0] || null, secondary: docs.slice(1, 3) }
}

export async function getBreakingArticles(localeProp?: string): Promise<Article[]> {
  const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: {
      isBreaking: { equals: true },
      status: { equals: 'published' },
      or: [
        { language: { equals: locale || 'en' } },
        { language: { equals: 'all' } }
      ]
    },
    limit: 5,
    depth: 2,
    locale: locale as any,
  })
  return result.docs as unknown as Article[]
}

export async function getRelatedArticles(articleId: string | number, categoryId?: string | number, localeProp?: string): Promise<Article[]> {
  const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
  const payload = await getPayloadClient()
  const where: any = {
    status: { equals: 'published' },
    id: { not_equals: articleId },
    or: [
      { language: { equals: locale || 'en' } },
      { language: { equals: 'all' } }
    ]
  }
  if (categoryId) where.category = { equals: categoryId }

  const result = await payload.find({
    collection: 'articles',
    where,
    limit: 3,
    depth: 2,
    locale: locale as any,
  })
  return result.docs as unknown as Article[]
}
