import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/types'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface RelatedArticlesProps {
  articles: Article[]
  locale?: string
}

export function RelatedArticles({ articles, locale = 'en' }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null

  const getImageUrl = (image: any) => {
    if (!image) return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'
    if (typeof image === 'string') return image
    if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
      return image.url
    }
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="mt-8 mb-8 border-t border-[var(--border)] pt-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-5">
        <span className="label-caps !text-[var(--text-primary)] text-[10px] tracking-[0.25em]">
          More From Asian Dot
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Related News</span>
      </div>

      {/* 2-Column Mobile / 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 3).map((article) => {
          const imgUrl = getImageUrl(article.coverImage)
          const timeAgo = formatDate(article.publishedAt)

          return (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="group flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-md overflow-hidden hover:border-[var(--accent-red)] transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative w-full overflow-hidden bg-[var(--bg-card)]" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={imgUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {article.category && (
                  <div className="absolute top-2 left-2 z-10">
                    <CategoryBadge name={article.category.name} size="sm" />
                  </div>
                )}
              </div>

              {/* Content Box */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <h3
                  className="font-card-title text-sm leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors line-clamp-2 mb-2"
                >
                  {article.title}
                </h3>
                {timeAgo && (
                  <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider uppercase mt-auto">
                    {timeAgo}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
