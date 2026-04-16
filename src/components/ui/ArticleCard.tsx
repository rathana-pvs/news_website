'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Article } from '@/types'
import { CategoryBadge } from './CategoryBadge'
import { AuthorChip } from './AuthorChip'
import { BreakingBadge } from './BreakingBadge'
import { truncate } from '@/lib/utils'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface ArticleCardProps {
  article: Article
  size?: 'sm' | 'md' | 'lg'
  index?: number
  className?: string
}

export function ArticleCard({ article, size = 'md', index = 0, className }: ArticleCardProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en
  
  const href = `/${locale}/article/${article.slug}`
  const imageUrl = article.coverImage?.url || 'https://picsum.photos/seed/default/800/600'
  const translatedCategoryName = article.category ? ((dict as any)[article.category.slug] || article.category.name) : ''

  if (size === 'sm') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className={`group flex gap-3 border rounded-lg p-3 cursor-pointer transition-all ${className || ''}`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Link href={href} className="flex gap-3 w-full">
          <div className="relative flex-shrink-0 overflow-hidden rounded" style={{ width: 100, height: 72 }}>
            <Image
              src={imageUrl}
              alt={article.coverImage?.alt || article.title}
              fill
              sizes="100px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col justify-between min-w-0 py-0.5">
            <div>
              {article.category && (
                <CategoryBadge name={translatedCategoryName} size="sm" className="mb-1.5 block" />
              )}
              <h3
                className="font-display font-bold leading-tight line-clamp-3 text-sm group-hover:text-[var(--accent-red)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {article.title}
              </h3>
            </div>
            <div className="font-mono flex items-center gap-2 mt-1" style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              {article.author && <span>{article.author.name}</span>}
              {article.readTime && <span>· {article.readTime} {dict.minRead}</span>}
            </div>
          </div>
        </Link>
      </motion.article>
    )
  }

  if (size === 'lg') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className={`group border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[var(--accent-red)] ${className || ''}`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Link href={href}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <Image
              src={imageUrl}
              alt={article.coverImage?.alt || article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.95) 30%, rgba(10,10,10,0.2) 70%, transparent)' }}
            />
            <div className="absolute bottom-0 left-0 p-4 flex gap-2">
              {article.category && (
                <CategoryBadge name={translatedCategoryName} />
              )}
              {article.isBreaking && <BreakingBadge />}
            </div>
          </div>
          <div className="p-5">
            <h2
              className="font-display text-2xl font-bold leading-tight mb-2 line-clamp-4 group-hover:text-[var(--accent-red)] transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-4 line-clamp-3"
              style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}
            >
              {article.excerpt}
            </p>
            <AuthorChip author={article.author || null} date={article.publishedAt} readTime={article.readTime} />
          </div>
        </Link>
      </motion.article>
    )
  }

  // md (default)
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`group border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[var(--accent-red)] ${className || ''}`}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <Link href={href}>
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <Image
            src={imageUrl}
            alt={article.coverImage?.alt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          {article.isBreaking && (
            <div className="absolute top-3 left-3">
              <BreakingBadge />
            </div>
          )}
        </div>
        <div className="p-4">
          {article.category && (
            <CategoryBadge name={translatedCategoryName} size="sm" className="mb-2 block" />
          )}
          <h3
            className="font-display font-bold leading-tight mb-2 line-clamp-3 group-hover:text-[var(--accent-red)] transition-colors duration-200"
            style={{ color: 'var(--text-primary)', fontSize: '17px' }}
          >
            {article.title}
          </h3>
          <p
            className="text-sm leading-relaxed mb-3 line-clamp-2"
            style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}
          >
            {truncate(article.excerpt, 120)}
          </p>
          <AuthorChip
            author={article.author || null}
            date={article.publishedAt}
            readTime={article.readTime}
            size="sm"
          />
        </div>
      </Link>
    </motion.article>
  )
}
