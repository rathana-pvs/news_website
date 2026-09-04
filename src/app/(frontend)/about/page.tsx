import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us — Asian Dot Independent Reporting',
  description: 'Independent political reporting you can trust. Learn about our mission, editorial standards, masthead leadership, and commitment to democracy.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us — Asian Dot',
    description: 'Independent political reporting you can trust. Learn about our mission, editorial standards, masthead leadership, and commitment to democracy.',
    url: '/about',
    siteName: 'Asian Dot',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'About Asian Dot',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — Asian Dot',
    description: 'Independent political reporting you can trust. Learn about our mission and editorial standards.',
    images: ['/logo.png'],
  },
}

export default async function AboutPage() {
  const locale = 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const stats = [
    { number: '15+', label: 'Years of Independent Reporting' },
    { number: '200K', label: 'Monthly Readers' },
    { number: '100%', label: 'Fact-Checked Multi-Source News' },
    { number: '0', label: 'Political PAC Affiliations' },
  ]

  const values = [
    {
      icon: '⚖️',
      title: 'Uncompromising Accuracy',
      body: 'Every story undergoes a multi-source verification and corroboration process before publication. We prioritize thorough, verified facts over speculative speed.',
    },
    {
      icon: '🔒',
      title: 'Editorial Independence',
      body: 'We accept zero funding from political parties, governments, or political action committees. Our editorial judgment is strictly independent.',
    },
    {
      icon: '🌍',
      title: 'Asia-Pacific & Global Scope',
      body: 'Politics does not exist in a vacuum. We connect regional parliamentary developments, security alliances, trade policies, and global governance.',
    },
    {
      icon: '🔦',
      title: 'Radical Transparency',
      body: 'When corrections are required, we issue them prominently and immediately. We cite source reporting with clear journalistic attribution.',
    },
    {
      icon: '🗝️',
      title: 'Whistleblower Protection',
      body: 'We maintain strict confidentiality for all sources providing non-public records and investigative leads in the public interest.',
    },
    {
      icon: '📊',
      title: 'Policy & Economic Depth',
      body: 'We explain the numbers behind the rhetoric, breaking down international trade data, legislative voting records, and defense expenditures.',
    },
  ]

  const timeline = [
    { year: '2010', event: 'Founded in Phnom Penh by an independent journalist collective committed to impartial political coverage.' },
    { year: '2013', event: 'Launched regional coverage desks tracking Southeast Asian geopolitics and regional summits.' },
    { year: '2017', event: 'Introduced deep-dive parliamentary and legislative analysis for major regional assemblies.' },
    { year: '2021', event: 'Surpassed 100,000 regular readers across the Asia-Pacific region and international observers.' },
    { year: '2025', event: 'Expanded multi-source investigative editorial system to provide comprehensive, citation-rich news.' },
    { year: '2026', event: 'Upgraded digital publishing infrastructure with mobile-first architecture and transparent editorial policies.' },
  ]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const officialEmail = 'varathana.tech@gmail.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'NewsMediaOrganization',
      name: 'Asian Dot',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      foundingDate: '2010',
      description: 'Independent political and geopolitical news covering the Asia-Pacific region and global affairs.',
      email: officialEmail,
      founder: {
        '@type': 'Person',
        name: 'Rathana',
        jobTitle: 'Founder & Editor-in-Chief',
        email: officialEmail,
      },
    },
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden py-24 sm:py-32">
        {/* Background dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Accent lines */}
        <div className="absolute left-0 top-1/4 w-[3px] h-64 opacity-80" style={{ background: 'var(--accent-red)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border mb-8 text-[10px] font-mono font-bold tracking-[0.3em] uppercase"
               style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', background: 'rgba(232,0,45,0.05)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
            Est. 2010 · Independent Journalism
          </div>

          <h1
            className="font-display font-black leading-[0.9] mb-8 tracking-tight"
            style={{
              fontSize: 'clamp(48px, 10vw, 110px)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
            }}
          >
            Asian<span style={{ color: 'var(--accent-red)' }}>dot</span>
          </h1>

          <p
            className="text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}
          >
            Holding power to account through fact-checked reporting, multi-source corroboration, and uncompromising editorial independence.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest border transition-all"
              style={{ background: 'var(--accent-red)', color: 'white', borderColor: 'var(--accent-red)' }}
            >
              Contact the Newsroom
            </Link>
            <a
              href={`mailto:${officialEmail}`}
              className="px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest border transition-all hover:border-[var(--accent-red)]"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {officialEmail}
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="py-10 px-6 text-center"
                style={{
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <p
                  className="font-display font-black mb-2"
                  style={{ fontSize: 'clamp(32px, 4vw, 54px)', color: 'var(--accent-red)', lineHeight: 1 }}
                >
                  {stat.number}
                </p>
                <p className="font-mono font-bold text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[4px] h-6 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
                <h2 className="font-mono font-bold text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent-red)' }}>
                  {dict.ourMission}
                </h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Delivering unbiased information so that citizens, policy experts, and scholars can make informed decisions.
              </p>
            </div>
            <div className="lg:col-span-8">
              <blockquote
                className="font-display font-bold leading-tight mb-10"
                style={{
                  fontSize: 'clamp(22px, 3.5vw, 38px)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                &ldquo;To provide independent, data-driven political reporting that empowers citizens and strengthens the foundations of public accountability.&rdquo;
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                <p>
                  Asian Dot was founded on a firm principle: in a healthy society, citizens require unspun facts about decisions that shape their lives, economy, and legal rights.
                </p>
                <p>
                  We resist algorithmic clickbait and partisan polarization. Each published article synthesizes primary reports and corroborated sources to ensure authoritative, original editorial substance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MASTHEAD & LEADERSHIP ─────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
              <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--accent-red)' }}>
                Editorial Masthead
              </h2>
            </div>
            <h3 className="font-display font-bold text-3xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Newsroom Leadership & Governance
            </h3>
            <p className="text-base max-w-xl mx-auto mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
              Accountability begins at home. Meet the editorial leadership responsible for Asian Dot&apos;s daily journalism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Rathana */}
            <div
              className="p-8 border transition-all duration-200 group hover:border-[var(--accent-red)]"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-xl mb-6 shadow-md"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                R
              </div>
              <span className="font-mono font-bold text-[9px] uppercase tracking-[0.25em] block mb-1.5" style={{ color: 'var(--accent-red)' }}>
                Founder & Lead Editor
              </span>
              <h4 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Rathana
              </h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Directs the editorial vision, newsroom verification standards, and geopolitical coverage across regional and international affairs.
              </p>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <a
                  href={`mailto:${officialEmail}?subject=Editorial%20Direct%20Inquiry`}
                  className="font-mono text-xs font-bold transition-colors hover:text-[var(--accent-red)] flex items-center gap-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{officialEmail}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Miara */}
            <div
              className="p-8 border transition-all duration-200 group hover:border-[var(--accent-red)]"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-xl mb-6 border shadow-sm"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                M
              </div>
              <span className="font-mono font-bold text-[9px] uppercase tracking-[0.25em] block mb-1.5" style={{ color: 'var(--accent-red)' }}>
                Contributing Editor
              </span>
              <h4 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                Miara
              </h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Oversees parliamentary proceedings, constitutional affairs, regional treaties, and judicial reporting across Asia.
              </p>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <a
                  href={`mailto:${officialEmail}?subject=Contributing%20Editor%20Inquiry`}
                  className="font-mono text-xs font-bold transition-colors hover:text-[var(--accent-red)] flex items-center gap-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{officialEmail}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Central Desk */}
            <div
              className="p-8 border transition-all duration-200 group hover:border-[var(--accent-red)]"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-xl mb-6 border shadow-sm"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                ⚖️
              </div>
              <span className="font-mono font-bold text-[9px] uppercase tracking-[0.25em] block mb-1.5" style={{ color: 'var(--accent-red)' }}>
                Fact-Checking & Research
              </span>
              <h4 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                The Editorial Desk
              </h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Responsible for multi-source cross-referencing, verifying agency filings, timeline corroboration, and factual integrity.
              </p>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <a
                  href={`mailto:${officialEmail}?subject=Fact-Checking%20Desk%20Inquiry`}
                  className="font-mono text-xs font-bold transition-colors hover:text-[var(--accent-red)] flex items-center gap-1.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{officialEmail}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES / STANDARDS ───────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>
               {dict.editorialStandards}
            </h2>
            <h3 className="font-display font-bold text-3xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Core Editorial Principles
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="group p-8 transition-all duration-300 border hover:border-[var(--accent-red)]"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl mb-6"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {v.icon}
                </div>
                <h4 className="font-display font-bold text-xl mb-3 group-hover:text-[var(--accent-red)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {v.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>
              Our History
            </h2>
            <h3 className="font-display font-bold text-3xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              15 Years of Public Accountability
            </h3>
          </div>

          <div className="relative">
            <div
              className="absolute left-[72px] top-0 bottom-0 w-[2px]"
              style={{ background: 'linear-gradient(to bottom, var(--accent-red), var(--border) 20%, var(--border) 80%, var(--accent-red))' }}
            />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex gap-8 items-start">
                  <div className="relative z-10 flex-shrink-0 w-[72px] text-right">
                    <span
                      className="font-display font-extrabold tabular-nums"
                      style={{ color: i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: 16 }}
                    >
                      {item.year}
                    </span>
                  </div>

                  <div
                    className="relative z-10 flex-shrink-0 w-3.5 h-3.5 rounded-full mt-1"
                    style={{
                      background: i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--bg-card)',
                      border: `2px solid ${i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--border)'}`,
                      marginLeft: '-7px',
                    }}
                  />

                  <p
                    className="text-base leading-relaxed pt-0"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}
                  >
                    {item.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING QUOTE ────────────────────────────── */}
      <section
        className="py-24 px-4 sm:px-6 text-center border-t relative overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-display font-bold text-5xl mb-6 leading-none" style={{ color: 'var(--accent-red)', opacity: 0.6 }}>&ldquo;</p>
          <blockquote
            className="font-display font-bold italic leading-tight mb-8"
            style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Democracy thrives on transparency. We commit to bringing verified truth into focus.
          </blockquote>
          <div className="w-12 h-[2px] mx-auto mb-4" style={{ background: 'var(--accent-red)' }} />
          <p className="font-mono font-bold text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--accent-red)' }}>
            The Editorial Board, Asian Dot
          </p>
        </div>
      </section>

      {/* ── DIRECT EDITORIAL CONTACT ─────────────────── */}
      <section className="py-20 px-4 sm:px-6" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--accent-red)' }}>
            Direct Newsroom Contact
          </h2>
          <h3 className="font-display font-bold text-3xl sm:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Editorial Office & Public Inquiries
          </h3>
          <p className="text-base max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
            For general questions, story submissions, correction requests, or press correspondence, reach our editorial desk directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${officialEmail}`}
              className="inline-flex items-center gap-3 px-8 py-4 font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:opacity-95"
              style={{
                background: 'var(--accent-red)',
                color: 'white',
              }}
            >
              <span>✉️</span>
              <span>{officialEmail}</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 font-mono font-bold text-sm tracking-wider uppercase border transition-all hover:border-[var(--accent-red)]"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <span>Visit Contact Desk</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
