'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Article } from '@/types'
import { AuthorChip } from '@/components/ui/AuthorChip'

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
      <div className="news-shell py-5 sm:py-8 lg:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-3" style={{ borderColor: 'var(--border)' }}>
          <p className="section-eyebrow">{hero.isBreaking ? dict.breaking : heroCategoryName || dict.latestNews}</p>
          <p className="hidden sm:block text-sm" style={{ color: 'var(--text-muted)' }}>
            {new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

          {/* Hero Article — 60% */}
          <motion.div
            className="lg:col-span-8 xl:col-span-9 relative overflow-hidden cursor-pointer group news-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/${locale}/article/${hero.slug}`} className="grid h-full md:grid-cols-5">
              {/* Hero Image */}
              <div className="relative min-h-[280px] md:col-span-3 md:min-h-[520px]">
                <Image
                  src={heroImage}
                  alt={hero.coverImage?.alt || hero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>

              <div className="relative flex min-w-0 flex-col justify-center p-5 sm:p-7 md:col-span-2 lg:p-8 xl:p-9">
                <motion.div
                  className="mb-4 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {hero.category && (
                    <span className="section-eyebrow">{heroCategoryName}</span>
                  )}
                  {hero.isBreaking && (
                    <span className="section-eyebrow">/ {dict.breaking}</span>
                  )}
                </motion.div>

                <motion.h1
                  className="font-display font-extrabold leading-[1.04] mb-4 break-words group-hover:text-[var(--accent-red)] transition-colors"
                  style={{ fontSize: 'clamp(32px, 3.4vw, 52px)', color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {hero.title}
                </motion.h1>

                <motion.div
                  className="mb-5 h-[3px] w-14"
                  style={{ background: 'var(--accent-red)' }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, transformOrigin: 'left' }}
                />

                <motion.p
                  className="mb-5 text-base leading-7 line-clamp-4"
                  style={{ color: 'var(--text-secondary)' }}
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
                  <AuthorChip 
                    author={hero.author || null} 
                    date={hero.publishedAt} 
                    readTime={hero.readTime}
                    className="hero-author-chip"
                  />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary Articles — 40% */}
          <div className="lg:col-span-4 xl:col-span-3 grid gap-5">
            {secondary.slice(0, 2).map((article, i) => {
              const categoryName = article.category ? ((dict as any)[article.category.slug] || article.category.name) : ''
              return (
                <motion.div
                  key={article.id}
                  className="relative cursor-pointer group overflow-hidden news-card"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                >
                  <Link href={`/${locale}/article/${article.slug}`} className="grid h-full grid-cols-[128px_1fr] sm:grid-cols-[180px_1fr] lg:grid-cols-1">
                    <div className="relative min-h-[170px] overflow-hidden lg:min-h-[210px]">
                      <Image
                        src={article.coverImage?.url || `https://picsum.photos/seed/${article.id}/400/300`}
                        alt={article.coverImage?.alt || article.title}
                        fill
                        sizes="(max-width: 1024px) 180px, 420px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div
                      className="flex min-w-0 flex-col justify-center p-4 sm:p-5"
                    >
                      {article.category && (
                        <span className="section-eyebrow mb-2">{categoryName}</span>
                      )}
                      <h2
                        className="font-display font-bold leading-tight line-clamp-3 mb-3 group-hover:text-[var(--accent-red)] transition-colors"
                        style={{ fontSize: 'clamp(18px, 2vw, 25px)', color: 'var(--text-primary)' }}
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
