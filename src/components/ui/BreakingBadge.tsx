'use client'

import { useParams } from 'next/navigation'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

export function BreakingBadge({ className }: { className?: string }) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm ${className || ''}`}
      style={{
        background: 'var(--accent-red-bright)',
        color: '#fff',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      ● {dict.breaking}
    </span>
  )
}
