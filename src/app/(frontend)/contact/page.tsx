import type { Metadata } from 'next'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us — Asian Dot Editorial Office',
  description: 'Reach the editorial team at Asian Dot. Direct inquiries, confidential tips, corrections, and press correspondence via varathana.tech@gmail.com.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us — Asian Dot Editorial Office',
    description: 'Reach the editorial team at Asian Dot. Direct inquiries, confidential tips, corrections, and press correspondence via varathana.tech@gmail.com.',
    url: '/contact',
    siteName: 'Asian Dot',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Asian Dot Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Asian Dot',
    description: 'Reach the editorial team at Asian Dot via varathana.tech@gmail.com.',
    images: ['/logo.png'],
  },
}

export default async function ContactPage() {
  const locale = 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const officialEmail = 'varathana.tech@gmail.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Asian Dot Editorial Office',
    description: 'Official contact portal and confidential tip line for Asian Dot.',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'NewsMediaOrganization',
      name: 'Asian Dot',
      url: siteUrl,
      email: officialEmail,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'Editorial & News Desk',
          email: officialEmail,
          availableLanguage: ['English', 'Khmer'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'Corrections & Editorial Standards',
          email: officialEmail,
        },
        {
          '@type': 'ContactPoint',
          contactType: 'Legal & Privacy Officer',
          email: officialEmail,
        },
      ],
    },
  }

  const channels = [
    {
      icon: '📰',
      tag: 'EDITORIAL DESK',
      title: 'General & Editorial Inquiries',
      description: 'Story pitches, media coverage requests, syndicated republishing, and editorial commentary.',
      email: officialEmail,
      subject: 'Editorial Inquiry — Asian Dot',
      note: 'Response target: Within 24 hours',
    },
    {
      icon: '⚖️',
      tag: 'INTEGRITY & FACT-CHECKING',
      title: 'Corrections & Retractions',
      description: 'We hold our reporting to rigorous standards. If you spot a factual inaccuracy, we will investigate and issue corrections promptly.',
      email: officialEmail,
      subject: 'Factual Correction Request',
      note: 'Priority response: Within 12 hours',
    },
    {
      icon: '🛡️',
      tag: 'LEGAL & DATA RIGHTS',
      title: 'Privacy & Legal Compliance',
      description: 'GDPR, CCPA, DMCA notices, and personal data rights inquiries handled by our data protection team.',
      email: officialEmail,
      subject: 'Legal & Privacy Compliance Inquiry',
      note: 'Standard legal review window',
    },
  ]

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle background matrix */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border mb-6 text-[10px] font-mono font-bold tracking-[0.25em] uppercase"
               style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', background: 'rgba(232,0,45,0.05)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
            Official Communications Desk
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {dict.getInTouch}
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
            Asian Dot operates an open, accountable newsroom. For breaking stories, press releases, corrections, or rights inquiries, our direct editorial channel is:
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={`mailto:${officialEmail}`}
              className="inline-flex items-center gap-3 px-6 py-3 font-mono font-bold text-sm border transition-all hover:bg-[var(--accent-red)] hover:text-white"
              style={{
                borderColor: 'var(--accent-red)',
                color: 'var(--accent-red)',
                background: 'var(--bg-card)',
              }}
            >
              <span>✉️</span>
              <span>{officialEmail}</span>
            </a>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              (Primary Editorial Inbox)
            </span>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Structured Contact Channels */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-6">
              {channels.map((channel, i) => (
                <div
                  key={i}
                  className="p-6 sm:p-8 border transition-all duration-200 group hover:border-[var(--accent-red)]"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{channel.icon}</span>
                      <div>
                        <span className="font-mono font-bold text-[9px] uppercase tracking-[0.25em]" style={{ color: 'var(--accent-red)' }}>
                          {channel.tag}
                        </span>
                        <h3 className="font-display font-bold text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                          {channel.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                    {channel.description}
                  </p>

                  <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                    <a
                      href={`mailto:${channel.email}?subject=${encodeURIComponent(channel.subject)}`}
                      className="inline-flex items-center gap-2 font-mono text-xs font-bold transition-colors group-hover:text-[var(--accent-red)]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>{channel.email}</span>
                      <span className="text-xs">↗</span>
                    </a>
                    <span className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {channel.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Secure Whistleblower & Confidential Tips Box */}
            <div
              className="p-8 border-l-4"
              style={{
                borderColor: 'var(--border)',
                borderLeftColor: 'var(--accent-red)',
                background: 'var(--bg-card)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-red)', color: 'white' }}>
                  !
                </span>
                <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  Confidential Whistleblower Protocol
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                We uphold strict source protection. For high-risk documents or non-public intelligence, contact our desk via encrypted correspondence with subject &quot;CONFIDENTIAL TIP&quot; to <strong style={{ color: 'var(--text-primary)' }}>{officialEmail}</strong>.
              </p>
              <div className="p-3.5 font-mono text-[11px] tracking-wider border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                PGP KEY IDENTIFIER: 4A7B 9931 2C09 0E3F 2218 (ASIAN-DOT-CORE)
              </div>
            </div>

            {/* Social & Syndication Feeds */}
            <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] block mb-4" style={{ color: 'var(--text-muted)' }}>
                Verified Broadcast Channels
              </span>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Twitter / X', href: 'https://twitter.com/asiandot', icon: '𝕏' },
                  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61570774830775', icon: 'f' },
                  { name: 'Telegram', href: '#', icon: '✈' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.href !== '#' ? '_blank' : undefined}
                    rel={item.href !== '#' ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2.5 px-4 py-2 border font-mono text-xs tracking-wider uppercase transition-all hover:border-[var(--accent-red)]"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <span className="font-bold text-sm" style={{ color: 'var(--accent-red)' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dispatch Form */}
          <div className="lg:col-span-6 sticky top-24">
            <ContactForm />
          </div>

        </div>

      </div>
    </div>
  )
}
