'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n } from '@/i18n-config'

export function LocaleSwitcher() {
  const pathname = usePathname()
  
  const redirectedPathname = (locale: string) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const currentLocale = pathname.split('/')[1] || i18n.defaultLocale

  return (
    <div 
      className="flex items-center p-1 rounded-lg gap-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {i18n.locales.map((locale) => {
        const active = currentLocale === locale
        return (
          <Link
            key={locale}
            href={redirectedPathname(locale)}
            className="px-2.5 py-1 rounded-md text-sm font-bold uppercase transition-all"
            style={{ 
              background: active ? 'var(--accent-red)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-secondary)',
              fontFamily: 'IBM Plex Mono, monospace'
            }}
          >
            {locale === 'en' ? 'EN' : 'ខ្មែរ'}
          </Link>
        )
      })}
    </div>
  )
}
