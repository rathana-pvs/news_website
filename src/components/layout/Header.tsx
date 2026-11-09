'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Category } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface HeaderProps {
  categories: Category[]
  locale: string
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center select-none"
      style={{
        background: 'var(--accent-red)',
        color: '#fff',
        fontFamily: 'var(--font-serif)',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        fontSize: small ? 18 : 22,
        padding: small ? '8px 10px' : '10px 14px',
      }}
    >
      Asian Dot
    </span>
  )
}

export function Header({ categories, locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  useEffect(() => {
    // The site is light only. Clear the old dark-mode preference if a reader had one.
    document.documentElement.removeAttribute('data-theme')
    try { localStorage.removeItem('theme') } catch {}
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header
        className="sticky top-0 w-full z-50"
        style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                className="w-9 h-9 -ml-2 flex items-center justify-center lg:hidden"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" aria-label="Asian Dot home" className="flex items-center">
                <Logo />
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              <Link
                href="/about"
                className="hidden md:inline text-sm font-semibold hover:underline underline-offset-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {dict.aboutUs}
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 h-9 px-2 text-sm font-semibold hover:underline underline-offset-4"
                style={{ color: 'var(--text-primary)' }}
                aria-label={dict.search}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="hidden sm:inline">{dict.search}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section nav */}
        <div className="hidden lg:block" style={{ borderTop: '1px solid var(--border)' }}>
          <nav
            className="max-w-[1280px] mx-auto px-6 flex items-center gap-7 h-11 overflow-x-auto"
            aria-label="Category navigation"
          >
            <Link
              href="/"
              className="flex-shrink-0 h-full flex items-center text-[14px] font-semibold border-b-[3px]"
              style={{
                color: 'var(--text-primary)',
                borderBottomColor: pathname === '/' ? 'var(--accent-red)' : 'transparent',
              }}
            >
              {dict.home}
            </Link>
            {categories.map((cat) => {
              const href = `/category/${cat.slug}`
              const active = isActive(href)
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="flex-shrink-0 h-full flex items-center text-[14px] font-medium border-b-[3px] hover:text-[var(--accent-red)]"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottomColor: active ? 'var(--accent-red)' : 'transparent',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {(dict as any)[cat.slug] || cat.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-80 flex flex-col"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between px-4 h-14" style={{ borderBottom: '1px solid var(--border)' }}>
              <Link href="/" aria-label="Asian Dot home">
                <Logo small />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Close menu"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 flex flex-col">
              {[{ href: '/', label: dict.home, active: pathname === '/' },
                ...categories.map((cat) => ({
                  href: `/category/${cat.slug}`,
                  label: (dict as any)[cat.slug] || cat.name,
                  active: isActive(`/category/${cat.slug}`),
                })),
                { href: '/search', label: dict.search, active: isActive('/search') },
                { href: '/about', label: dict.aboutUs, active: isActive('/about') },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-3 text-[16px] font-semibold border-l-[3px]"
                  style={{
                    color: 'var(--text-primary)',
                    borderLeftColor: item.active ? 'var(--accent-red)' : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
