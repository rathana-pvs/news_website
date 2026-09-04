import type { Metadata } from 'next'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Asian Dot Data Protection',
  description: 'Learn how Asian Dot protects your personal data, privacy rights under GDPR and CCPA, and how we handle advertising cookies and telemetry.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Asian Dot',
    description: 'Learn how Asian Dot protects your personal data, privacy rights under GDPR and CCPA, and how we handle advertising cookies and telemetry.',
    url: '/privacy',
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
    title: 'Privacy Policy — Asian Dot',
    description: 'Learn how Asian Dot protects your personal data and handles cookies.',
    images: ['/logo.png'],
  },
}

export default async function PrivacyPage() {
  const locale = 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const officialEmail = 'varathana.tech@gmail.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy & Cookie Disclosures — Asian Dot',
    description: 'Official privacy policy, cookie disclosures, and data protection notice for Asian Dot.',
    url: `${siteUrl}/privacy`,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Asian Dot',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      email: officialEmail,
    },
  }

  const sections = [
    { id: 'intro', label: '1. Introduction' },
    { id: 'data-collection', label: '2. Data Collection' },
    { id: 'adsense', label: '3. Google AdSense' },
    { id: 'cookies', label: '4. Cookies & Tracking' },
    { id: 'tips', label: '5. Inquiries & Tips' },
    { id: 'rights', label: '6. Your Rights (GDPR/CCPA)' },
    { id: 'dpo', label: '7. Contact & DPO' },
  ]

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background dot matrix */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[860px] mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 border mb-6 text-[10px] font-mono font-bold tracking-[0.25em] uppercase"
               style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', background: 'rgba(232,0,45,0.05)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
            Regulatory & Transparency Notice
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {dict.privacyPolicy}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
            Asian Dot respects reader confidentiality and maintains transparent data governance. This statement outlines our handling of cookies, analytical telemetry, and advertising partnerships.
          </p>
        </div>

        {/* Table of Contents Pills */}
        <div className="p-4 sm:p-5 border mb-12 flex flex-wrap gap-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <span className="font-mono text-[10px] uppercase tracking-wider py-1 pr-2 font-bold" style={{ color: 'var(--accent-red)' }}>
            INDEX:
          </span>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-mono text-[11px] px-2.5 py-1 border transition-colors hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-primary)' }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
          
          {/* 1. Introduction */}
          <section id="intro" className="relative pt-2">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--accent-red)' }}>
              1. Introduction
            </h2>
            <p>
              Welcome to Asian Dot (<a href="https://asiandot.com" className="underline hover:text-[var(--accent-red)]">asiandot.com</a>). We operate an independent digital news publication covering political and regional governance across Asia-Pacific and global arenas. We believe privacy is a democratic cornerstone and treat user information with strict fiduciary care.
            </p>
          </section>

          {/* 2. Data Collection */}
          <section id="data-collection" className="p-8 sm:p-10 border relative rounded" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-lg border border-[var(--accent-red)]/20 rounded">📊</span> 
              2. Data Collection & Telemetry
            </h2>
            <div className="space-y-4 text-base">
              <p>
                {dict.privacyText}
              </p>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="font-mono text-xs uppercase tracking-wider leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Google Analytics collects pseudonymous telemetry (such as session duration, device type, geographic city/region, and referral origins) to help our newsroom understand which topics resonate most with readers. IP addresses are anonymized.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Dedicated Google AdSense Section */}
          <section id="adsense" className="p-8 sm:p-10 border relative rounded" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-lg border border-[var(--accent-red)]/20 rounded">📢</span> 
              3. Advertising & Google AdSense Compliance
            </h2>
            <div className="space-y-4 text-base">
              <p>
                To fund our reporting operations and maintain free, unrestricted access for all global readers, Asian Dot displays digital advertisements served by third-party advertising partners, principally <strong>Google AdSense</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
                <li>
                  Third-party vendors, including <strong>Google</strong>, use cookies and advertising identifiers to serve ads based on a user&apos;s prior visits to Asian Dot and other web destinations.
                </li>
                <li>
                  Google&apos;s use of advertising cookies enables it and its certified ad partners to serve relevant advertisements to our visitors based on their browsing activity.
                </li>
                <li>
                  We may also present contextual recommendations provided by audited native networks (such as AdsKeeper) strictly in designated non-intrusive zones.
                </li>
              </ul>
              
              <div className="pt-5 border-t border-[var(--border)] space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent-red)' }}>
                  Opt-Out & Advertising Preferences
                </h3>
                <p className="text-sm">
                  You maintain full autonomy over personalized advertising preferences. You can manage or disable interest-based ads through any of the following verified portals:
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider border transition-colors hover:border-[var(--accent-red)] hover:bg-[var(--accent-red)]/10"
                    style={{ borderColor: 'var(--accent-red)', color: 'var(--text-primary)' }}
                  >
                    <span>Google Ad Settings</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider border transition-colors hover:border-[var(--accent-red)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <span>AboutAds.info Choices</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                  <a
                    href="https://www.youronlinechoices.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider border transition-colors hover:border-[var(--accent-red)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <span>Your Online Choices (EU/UK)</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wider pt-2" style={{ color: 'var(--text-muted)' }}>
                  Visitors from the European Economic Area (EEA), UK, and Switzerland are prompted with a Google-certified Consent Management platform on initial access to explicitly configure personalized ad cookies.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Cookies */}
          <section id="cookies">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--accent-red)' }}>
              4. Cookies & Local Storage
            </h2>
            <p>
              We utilize essential first-party cookies to remember your interface preferences (e.g. reading theme, layout dimensions) and secure sessions. Third-party cookies are deployed for aggregated visitor metrics and advertisement delivery. You can disable or delete cookies via your browser settings at any time without restricting editorial access.
            </p>
          </section>

          {/* 5. Inquiries & Tips */}
          <section id="tips">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--accent-red)' }}>
              5. Communications, Inquiries & Source Tips
            </h2>
            <p>
              When communicating with our newsroom via email or our contact portal, your contact details are used exclusively to process your specific editorial or rights request. We maintain a strict policy: reader contact data is never leased, sold, or shared with commercial brokers or political campaigns.
            </p>
          </section>

          {/* 6. User Rights (GDPR / CCPA) */}
          <section id="rights" className="p-8 sm:p-10 border relative rounded" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-lg border border-[var(--accent-red)]/20 rounded">⚖️</span>
              6. Your Privacy Rights (GDPR & CCPA/CPRA)
            </h2>
            <div className="space-y-4 text-base">
              <p>
                Under international data protection frameworks, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you retain the right to:
              </p>
              <ul className="list-disc pl-6 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                <li>Request disclosure of personal information held about you.</li>
                <li>Request rectification of any inaccurate information.</li>
                <li>Request complete erasure (the &quot;right to be forgotten&quot;).</li>
                <li>Object to or restrict automated processing of your telemetry.</li>
              </ul>
              <p className="pt-2">
                To exercise any of these rights, contact our Data Protection Officer directly at{' '}
                <a href={`mailto:${officialEmail}?subject=Privacy%20Rights%20Request`} className="font-bold underline" style={{ color: 'var(--accent-red)' }}>
                  {officialEmail}
                </a>.
              </p>
            </div>
          </section>

          {/* 7. Contact & DPO Card */}
          <section id="dpo" className="p-8 sm:p-10 border rounded text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
                   style={{ background: 'var(--bg-surface)', borderColor: 'var(--accent-red)' }}>
            <div>
              <span className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] block mb-1" style={{ color: 'var(--accent-red)' }}>
                7. Official Compliance Channel
              </span>
              <h3 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Data Protection Officer & Inquiries
              </h3>
              <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Direct all privacy questions, data requests, or compliance notices to our designated inbox.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href={`mailto:${officialEmail}?subject=Data%20Protection%20Officer%20Inquiry`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:opacity-95"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                <span>✉️</span>
                <span>{officialEmail}</span>
              </a>
            </div>
          </section>

          {/* Footer Metadata */}
          <div className="pt-12 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>LAST UPDATED: SEPTEMBER 2026 · VERSION 2.4</span>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-[var(--accent-red)] transition-colors">About Us</Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-[var(--accent-red)] transition-colors">Contact</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
