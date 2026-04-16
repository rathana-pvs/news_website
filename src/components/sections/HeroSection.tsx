'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Article } from '@/types'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { AuthorChip } from '@/components/ui/AuthorChip'
import { BreakingBadge } from '@/components/ui/BreakingBadge'

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
    <section className="w-full relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-px" style={{ borderColor: 'var(--border)' }}>

          {/* Hero Article — 60% */}
          <motion.div
            className="lg:col-span-3 relative overflow-hidden cursor-pointer group"
            style={{ minHeight: 520 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/${locale}/article/${hero.slug}`} className="block h-full">
              {/* Hero Image */}
              <div className="relative w-full h-full" style={{ minHeight: 520 }}>
                <Image
                  src={heroImage}
                  alt={hero.coverImage?.alt || hero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                {/* Dark gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,10,10,1) 40%, rgba(10,10,10,0.4) 70%, transparent)',
                  }}
                />
                {/* Dot Matrix — top right */}
                <div
                  className="absolute top-0 right-0 w-48 h-32 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(232,0,45,0.5) 1px, transparent 1px)',
                    backgroundSize: '8px 8px',
                  }}
                />
              </div>

              {/* Content overlaid */}
              <div className="absolute inset-0 flex flex-col justify-end p-7 pl-10">
                {/* Red left accent bar — matches reference */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: 'var(--accent-red)' }}
                />

                <motion.div
                  className="flex gap-3 mb-4 items-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {/* Red uppercase tag — "BREAKING NEWS · WORLD COVERAGE" style */}
                  {hero.category && (
                    <span
                      className="font-mono font-bold uppercase tracking-[0.2em]"
                      style={{ fontSize: 10, color: 'var(--accent-red)' }}
                    >
                      {heroCategoryName}
                      {hero.isBreaking && ` · ${dict.breaking}`}
                    </span>
                  )}
                  {!hero.category && hero.isBreaking && (
                    <span
                      className="font-mono font-bold uppercase tracking-[0.2em]"
                      style={{ fontSize: 10, color: 'var(--accent-red)' }}
                    >
                      {dict.breaking}
                    </span>
                  )}
                </motion.div>

                {/* Headline — large bold serif */}
                <motion.h1
                  className="font-display font-bold leading-none mb-4"
                  style={{ fontSize: 'clamp(32px, 4vw, 56px)', color: 'var(--text-primary)', lineHeight: 1.05 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {hero.title}
                </motion.h1>

                {/* Red horizontal divider — matches reference */}
                <motion.div
                  className="mb-4 w-12 h-[2px]"
                  style={{ background: 'var(--accent-red)' }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, transformOrigin: 'left' }}
                />

                {/* Excerpt — muted Syne */}
                <motion.p
                  className="text-base leading-relaxed mb-4 line-clamp-2 max-w-xl"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  {hero.excerpt}
                </motion.p>

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

          {/* Secondary Articles — 40% */}
          <div className="lg:col-span-2 flex flex-col" style={{ borderLeft: '1px solid var(--border)' }}>
            {secondary.slice(0, 2).map((article, i) => {
              const categoryName = article.category ? ((dict as any)[article.category.slug] || article.category.name) : ''
              return (
                <motion.div
                  key={article.id}
                  className="relative cursor-pointer group flex-1"
                  style={{
                    background: 'var(--bg-surface)',
                    borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
                  }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                >
                  <Link href={`/${locale}/article/${article.slug}`} className="flex h-full">
                    <div className="relative w-40 flex-shrink-0 overflow-hidden">
                      <Image
                        src={article.coverImage?.url || `https://picsum.photos/seed/${article.id}/400/300`}
                        alt={article.coverImage?.alt || article.title}
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div
                      className="flex flex-col justify-center p-5 min-w-0"
                      style={{ borderLeft: '3px solid var(--accent-red)' }}
                    >
                      {article.category && (
                        <CategoryBadge name={categoryName} size="sm" className="mb-2 block" />
                      )}
                      <h2
                        className="font-display font-bold leading-tight line-clamp-3 mb-2 group-hover:text-[var(--accent-red)] transition-colors"
                        style={{ fontSize: 15, color: 'var(--text-primary)' }}
                      >
                        {article.title}
                      </h2>
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
