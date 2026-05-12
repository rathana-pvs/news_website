'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Category } from '@/types'
import { LocaleSwitcher } from './LocaleSwitcher'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface HeaderProps {
  categories: Category[]
  locale: string
}

export function Header({ categories, locale }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  useEffect(() => {
    // 1. Check for manually saved theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    
    // 2. Check for system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultTheme = systemPrefersDark ? 'dark' : 'light'

    const initialTheme = savedTheme || defaultTheme
    
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)

    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newSystemTheme = e.matches ? 'dark' : 'light'
        setTheme(newSystemTheme)
        document.documentElement.setAttribute('data-theme', newSystemTheme)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
        className="sticky top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'color-mix(in srgb, var(--bg-surface) 92%, transparent)' : 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
        }}
      >

        <div className="news-shell relative">
          {/* Top Bar: Logo + Actions */}
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 group min-w-0">
              <span className="hidden sm:block h-9 w-[3px] rounded-full" style={{ background: 'var(--accent-red)' }} />
              <span
                className="font-display font-extrabold text-3xl sm:text-4xl whitespace-nowrap"
                style={{ color: 'var(--text-primary)', lineHeight: 1 }}
              >
                Asian<span style={{ color: 'var(--accent-red)' }}>dot</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <LocaleSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  /* High-Visibility Sun Icon */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  /* High-Visibility Moon Icon */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>

              {/* Search */}
              <Link
                href={`/${locale}/search`}
                className="w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label={dict.search}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Link>

              {/* Hamburger */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)] lg:hidden"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Nav */}
          <nav className="hidden lg:flex items-center gap-1 h-12 overflow-x-auto border-t" style={{ borderColor: 'var(--border)' }} aria-label="Category navigation">
            <Link
              href={`/${locale}`}
              className={`flex-shrink-0 px-4 h-full flex items-center font-mono font-bold tracking-[0.1em] text-[11px] uppercase transition-all border-b-2 ${pathname === `/${locale}` ? 'border-[var(--accent-red)] text-[var(--accent-red)]' : 'border-transparent hover:text-[var(--text-primary)]'
                }`}
              style={{ color: pathname === `/${locale}` ? 'var(--accent-red)' : 'var(--text-secondary)' }}
            >
              {dict.home}
            </Link>
            {categories.map((cat) => {
              const href = `/${locale}/category/${cat.slug}`
              const active = isActive(href)
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="flex-shrink-0 px-4 h-full flex items-center font-mono font-bold tracking-[0.1em] text-[11px] uppercase transition-all border-b-2"
                  style={{
                    color: active ? 'var(--accent-red)' : 'var(--text-secondary)',
                    borderBottomColor: active ? 'var(--accent-red)' : 'transparent',
                  }}
                >
                  {cat.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-[min(88vw,360px)] flex flex-col"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Mobile Nav Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <Link href={`/${locale}`}>
                <span
                  className="font-display font-bold text-2xl tracking-tight"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
                >
                  Asian<span style={{ color: 'var(--accent-red)' }}>dot</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-3 px-4 py-3 rounded-md label-caps text-sm transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 10v10h14V10" />
                </svg>
                {dict.home}
              </Link>
              {categories.map((cat) => {
                const href = `/${locale}/category/${cat.slug}`
                const active = isActive(href)
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-md label-caps text-sm transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: active ? 'var(--accent-red)' : 'var(--text-secondary)' }}
                  >
                    {cat.name}
                  </Link>
                )
              })}

              <Link
                href={`/${locale}/search`}
                className="flex items-center gap-3 px-4 py-3 rounded-md label-caps text-sm transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {dict.search}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
