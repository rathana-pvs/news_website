import { Article, Category, PaginatedArticles } from '@/types'
import { getPayloadClient } from './payload'
import { unstable_cache } from 'next/cache'

// ─── Articles List ────────────────────────────────────────────────────────────

export const getArticles = unstable_cache(
  async (params?: {
    category?: string
    region?: string
    limit?: number
    page?: number
    where?: Record<string, any>
    locale?: string
  }): Promise<PaginatedArticles> => {
    const currentLocale = (params?.locale && ['en', 'km'].includes(params.locale)) ? params.locale : 'en'
    const payload = await getPayloadClient()

    const whereClause: any = {
      status: { equals: 'published' },
      ...(params?.where || {}),
    }

    if (params?.category) {
      whereClause['category.slug'] = { equals: params.category }
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
  },
  ['articles-list'],
  { tags: ['articles'] }
)

// ─── Single Article ───────────────────────────────────────────────────────────

export const getArticle = unstable_cache(
  async (slug: string, localeProp?: string): Promise<Article | null> => {
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
  },
  ['article'],
  { tags: ['articles'] }
)

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = unstable_cache(
  async (locale?: string): Promise<Category[]> => {
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
  },
  ['categories-list'],
  { tags: ['categories'] }
)

// ─── Featured Articles ────────────────────────────────────────────────────────

export const getFeatured = unstable_cache(
  async (localeProp?: string): Promise<{ hero: Article | null; secondary: Article[] }> => {
    const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: {
        isFeatured: { equals: true },
        status: { equals: 'published' },
      },
      limit: 3,
      depth: 2,
      sort: '-publishedAt',
      locale: locale as any,
    })
    const docs = result.docs as unknown as Article[]
    return { hero: docs[0] || null, secondary: docs.slice(1, 3) }
  },
  ['featured-articles'],
  { tags: ['articles'] }
)

// ─── Breaking Articles ────────────────────────────────────────────────────────

export const getBreakingArticles = unstable_cache(
  async (localeProp?: string): Promise<Article[]> => {
    const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: {
        isBreaking: { equals: true },
        status: { equals: 'published' },
      },
      limit: 5,
      depth: 2,
      locale: locale as any,
    })
    return result.docs as unknown as Article[]
  },
  ['breaking-articles'],
  { tags: ['articles'] }
)

// ─── Related Articles ─────────────────────────────────────────────────────────

export const getRelatedArticles = unstable_cache(
  async (articleId: string | number, categoryId?: string | number, localeProp?: string): Promise<Article[]> => {
    const locale = (localeProp && ['en', 'km'].includes(localeProp)) ? localeProp : 'en'
    const payload = await getPayloadClient()
    const where: any = {
      status: { equals: 'published' },
      id: { not_equals: articleId },
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
  },
  ['related-articles'],
  { tags: ['articles'] }
)
