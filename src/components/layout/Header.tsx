'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Category } from '@/types'
import { LocaleSwitcher } from './LocaleSwitcher'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

import Image from 'next/image'

interface HeaderProps {
  categories: Category[]
  locale: string
}

export function Header({ categories, locale }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
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
          background: scrolled ? (theme === 'dark' ? 'rgba(13,17,23,0.95)' : 'rgba(255,255,255,0.95)') : 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          {/* Top Bar: Logo + Actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <div 
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden transition-all duration-500" 
                style={{ 
                  mixBlendMode: theme === 'dark' ? 'screen' : 'multiply'
                }}
              >
                <Image
                  src={theme === 'dark' ? "/icon.png" : "/icon_light.png"}
                  alt=""
                  fill
                  priority
                  className="object-contain" 
                />
              </div>
              <div className="flex flex-col -ml-1">
                <span
                  className="font-display font-bold text-lg sm:text-xl italic group-hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}
                >
                  asiandot
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <LocaleSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 115.636 5.636 9 9 0 0118.364 5.636z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Search */}
              <Link
                href={`/${locale}/search`}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
                aria-label={dict.search}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Link>

              {/* Live Link */}
              <Link
                href={`/${locale}/live`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />
                {dict.live}
              </Link>

              {/* Hamburger */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5 lg:hidden"
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
          <nav className="hidden lg:flex items-center gap-0 h-16 overflow-x-auto" aria-label="Category navigation">
            <Link
              href={`/${locale}`}
              className={`flex-shrink-0 px-6 h-full flex items-center font-mono font-semibold tracking-[0.08em] text-sm transition-all border-b-2 ${pathname === `/${locale}` ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]' : 'border-transparent hover:text-[var(--text-primary)]'
                }`}
              style={{ color: pathname === `/${locale}` ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
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
                  className={`flex-shrink-0 px-6 h-full flex items-center font-mono font-semibold tracking-[0.08em] text-sm transition-all border-b-2`}
                  style={{
                    color: active ? cat.color : 'var(--text-secondary)',
                    borderColor: active ? cat.color : 'transparent',
                  }}
                >
                  <span className="mr-3 text-lg">{cat.icon}</span>
                  {cat.name}
                </Link>
              )
            })}
            <Link
              href={`/${locale}/live`}
              className="flex-shrink-0 px-6 h-full flex items-center font-mono font-semibold tracking-[0.08em] text-sm transition-all border-b-2 border-transparent"
              style={{ color: 'var(--accent-red)' }}
            >
              <span className="live-dot mr-3 w-2.5 h-2.5 rounded-full inline-block bg-current" />
              {dict.live}
            </Link>
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
            className="absolute top-0 right-0 bottom-0 w-80 flex flex-col"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Mobile Nav Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <Link href={`/${locale}`} className="relative h-8 w-32">
                <Image
                  src="/logo.png"
                  alt="Asian Dot"
                  fill
                  className="object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5"
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg label-caps text-base transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                🏠 {dict.home}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg label-caps text-base transition-colors hover:bg-white/5"
                  style={{ color: cat.color }}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
              <Link
                href={`/${locale}/live`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg label-caps text-base transition-colors hover:bg-white/5"
                style={{ color: 'var(--accent-red)' }}
              >
                🔴 {dict.live}
              </Link>
              <Link
                href={`/${locale}/search`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg label-caps text-base transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                🔍 {dict.search}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
