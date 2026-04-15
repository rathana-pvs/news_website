import { Article, Category, PaginatedArticles, Region } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function getArticles(params?: {
  category?: string
  region?: string
  limit?: number
  page?: number
  where?: Record<string, any>
  locale?: string
}): Promise<PaginatedArticles> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.page) searchParams.set('page', String(params.page))
    searchParams.set('where[status][equals]', 'published')
    
    if (params?.locale) {
      searchParams.set('where[or][0][language][equals]', params.locale)
      searchParams.set('where[or][1][language][equals]', 'all')
      searchParams.set('locale', params.locale)
    }

    if (params?.category) searchParams.set('where[category.slug][equals]', params.category)
    if (params?.region) searchParams.set('where[region.slug][equals]', params.region)
    searchParams.set('depth', '2')

    const res = await fetch(`/api/articles?${searchParams}`)
    if (!res.ok) throw new Error('Failed to fetch articles')
    return res.json()
  } catch (e) {
    console.error(e)
    return {
      docs: [],
      totalDocs: 0,
      limit: 12,
      totalPages: 0,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    }
  }
}

export async function getArticle(slug: string, locale?: string): Promise<Article | null> {
  try {
    const res = await fetch(`/api/articles?where[slug][equals]=${slug}&depth=2&limit=1${locale ? `&locale=${locale}` : ''}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.docs[0] || null
  } catch {
    return null
  }
}

export async function getCategories(locale?: string): Promise<Category[]> {
  try {
    const res = await fetch(`/api/categories?limit=20${locale ? `&locale=${locale}` : ''}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch {
    return []
  }
}

export async function getRegions(locale?: string): Promise<Region[]> {
  try {
    const res = await fetch(`/api/regions?limit=20${locale ? `&locale=${locale}` : ''}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.docs || []
  } catch {
    return []
  }
}

export async function getFeatured(locale?: string): Promise<{ hero: Article | null; secondary: Article[] }> {
  try {
    const searchParams = new URLSearchParams({
      'where[isFeatured][equals]': 'true',
      'where[status][equals]': 'published',
      limit: '3',
      depth: '2',
      sort: '-publishedAt'
    })
    if (locale) {
      searchParams.set('where[or][0][language][equals]', locale)
      searchParams.set('where[or][1][language][equals]', 'all')
      searchParams.set('locale', locale)
    }
    const res = await fetch(`/api/articles?${searchParams}`)
    const data = await res.json()
    const docs = data.docs || []
    return { hero: docs[0] || null, secondary: docs.slice(1, 3) }
  } catch {
    return { hero: null, secondary: [] }
  }
}

export async function getBreakingArticles(locale?: string): Promise<Article[]> {
  try {
    const searchParams = new URLSearchParams({
      'where[isBreaking][equals]': 'true',
      'where[status][equals]': 'published',
      limit: '5',
      depth: '1'
    })
    if (locale) {
      searchParams.set('where[or][0][language][equals]', locale)
      searchParams.set('where[or][1][language][equals]', 'all')
      searchParams.set('locale', locale)
    }
    const res = await fetch(`/api/articles?${searchParams}`)
    const data = await res.json()
    return data.docs || []
  } catch {
    return []
  }
}

export async function getRelatedArticles(articleId: string, categoryId?: string, locale?: string): Promise<Article[]> {
  try {
    const params = new URLSearchParams({
      'where[status][equals]': 'published',
      'where[id][not_equals]': articleId,
      limit: '3',
      depth: '2',
    })
    if (categoryId) params.set('where[category][equals]', categoryId)
    if (locale) {
      params.set('where[or][0][language][equals]', locale)
      params.set('where[or][1][language][equals]', 'all')
      params.set('locale', locale)
    }
    const res = await fetch(`/api/articles?${params}`)
    const data = await res.json()
    return data.docs || []
  } catch {
    return []
  }
}
