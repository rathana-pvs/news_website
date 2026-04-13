'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Article } from '@/types'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { BreakingBadge } from '@/components/ui/BreakingBadge'
import { ArticleCard } from '@/components/ui/ArticleCard'

import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface HeroSectionProps {
  hero: Article | null
  secondary: Article[]
}

export function HeroSection({ hero, secondary }: HeroSectionProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!hero) return null

  const heroImage = hero.coverImage?.url || 'https://picsum.photos/seed/hero/1200/800'
  const heroCategoryName = hero.category ? ((dict as any)[hero.category.slug] || hero.category.name) : ''

  return (
    <section className="w-full">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Hero Article - 60% */}
          <motion.div
            className="lg:col-span-3 relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ minHeight: 480 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/${locale}/article/${hero.slug}`} className="block h-full">
              {/* Hero Image */}
              <div className="relative w-full h-full" style={{ minHeight: 480 }}>
                <Image
                  src={heroImage}
                  alt={hero.coverImage?.alt || hero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(13,17,23,0.97) 30%, rgba(13,17,23,0.3) 70%, transparent)',
                  }}
                />
              </div>

              {/* Content overlaid */}
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                {/* Badges */}
                <motion.div
                  className="flex gap-2 mb-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {hero.category && (
                    <CategoryBadge name={heroCategoryName} color={hero.category.color} />
                  )}
                  {hero.isBreaking && <BreakingBadge />}
                </motion.div>

                {/* Headline */}
                <motion.h1
                  className="font-display font-bold leading-tight mb-4"
                  style={{ fontSize: 'clamp(26px, 3vw, 48px)', color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {hero.title}
                </motion.h1>

                {/* Excerpt */}
                <motion.p
                  className="text-base leading-relaxed mb-4 line-clamp-2 max-w-xl"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {hero.excerpt}
                </motion.p>

                {/* Author */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <AuthorChip author={hero.author || null} date={hero.publishedAt} readTime={hero.readTime} />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary Articles - 40% */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {secondary.slice(0, 2).map((article, i) => {
              const categoryName = article.category ? ((dict as any)[article.category.slug] || article.category.name) : ''
              return (
                <motion.div
                  key={article.id}
                  className="relative rounded-xl overflow-hidden cursor-pointer group flex-1"
                  style={{ minHeight: 220, background: 'var(--bg-card)' }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                >
                  <Link href={`/${locale}/article/${article.slug}`} className="flex h-full">
                    <div className="relative w-48 flex-shrink-0 overflow-hidden">
                      <Image
                        src={article.coverImage?.url || `https://picsum.photos/seed/${article.id}/400/300`}
                        alt={article.coverImage?.alt || article.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-5 min-w-0">
                      {article.category && (
                        <CategoryBadge name={categoryName} color={article.category.color} size="sm" className="mb-2 self-start" />
                      )}
                      <h2
                        className="font-display font-bold leading-tight line-clamp-3 mb-3 group-hover:text-[var(--accent-gold)] transition-colors"
                        style={{ fontSize: 16, color: 'var(--text-primary)' }}
                      >
                        {article.title}
                      </h2>
                      <p
                        className="text-sm line-clamp-2 mb-3"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
                      >
                        {article.excerpt}
                      </p>
                      <AuthorChip author={article.author || null} date={article.publishedAt} size="sm" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
