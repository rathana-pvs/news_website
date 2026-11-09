import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/types'

interface RelatedArticlesProps {
  articles: Article[]
  categoryName?: string
}

/**
 * Sits just above the bottom ad feed, which earns most of the revenue. On
 * phones it is a short list of headlines (~200px) so the feed stays close;
 * from `sm` up it becomes a row of image cards.
 */
export function RelatedArticles({ articles, categoryName }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null

  return (
    <section className="mt-10">
      <div className="section-head !mb-2 sm:!mb-5">
        <h2>{categoryName ? `More from ${categoryName}` : 'More stories'}</h2>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 sm:gap-6">
        {articles.slice(0, 3).map((article, i) => (
          <li
            key={article.id}
            className={`py-3 sm:py-0 ${i > 0 ? 'border-t sm:border-t-0' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <Link href={`/article/${article.slug}`} className="group block">
              <div className="hidden sm:block relative w-full mb-3" style={{ aspectRatio: '3 / 2', background: 'var(--bg-surface)' }}>
                <Image
                  src={article.coverImage?.url || 'https://picsum.photos/seed/related/600/400'}
                  alt={article.coverImage?.alt || article.title}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
              <h3 className="headline" style={{ fontSize: 17, lineHeight: 1.25 }}>{article.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
