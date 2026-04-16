'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Author } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface AuthorChipProps {
  author?: Author | null
  date?: string
  readTime?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AuthorChip({ author, date, readTime, size = 'md', className }: AuthorChipProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  if (!author || typeof author === 'string') return null;
  if (!author.name) return null; // Ensure we have at least the name

  const avatarSize = size === 'sm' ? 24 : size === 'md' ? 32 : 40

  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <div
        className="relative rounded-full overflow-hidden flex-shrink-0 border"
        style={{ width: avatarSize, height: avatarSize, borderColor: 'var(--border)' }}
      >
        {author.avatar?.url ? (
          <Image
            src={author.avatar.url}
            alt={author.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40px, 64px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            {author.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={`font-semibold truncate leading-tight ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}
          style={{ color: 'var(--text-primary)' }}
        >
          {author.name}
        </span>
        <div
          className="label-caps flex items-center gap-2"
          style={{ color: 'var(--text-muted)', fontSize: '10px' }}
        >
          {date && <span suppressHydrationWarning>{formatDate(date, 'MMM d, yyyy', locale)}</span>}
          {date && readTime && <span>·</span>}
          {readTime && <span>{readTime} {dict.minRead}</span>}
        </div>
      </div>
    </div>
  )
}
