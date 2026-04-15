import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'
import type { Metadata } from 'next'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'About Us — Asian Dot',
  description: 'Independent political reporting you can trust. Learn about our mission, editorial standards, and our commitment to democracy since 2010.',
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  const stats = [
    { number: '15+', label: 'Years of Independent Reporting' },
    { number: '200K', label: 'Daily Readers' },
    { number: '12', label: 'Countries Covered' },
    { number: '0', label: 'Political Affiliations' },
  ]

  const values = [
    {
      icon: '⚖️',
      title: 'Uncompromising Accuracy',
      body: 'Every story undergoes a rigorous three-stage verification process before publication. We would rather be last and right than first and wrong.',
    },
    {
      icon: '🔒',
      title: 'Editorial Independence',
      body: 'We accept zero funding from political parties, governments, or PACs. Our revenue comes exclusively from our readership and advertising.',
    },
    {
      icon: '🌍',
      title: 'Global Perspective',
      body: 'Politics does not exist in a vacuum. Our bureaus in five continents ensure we contextualize every local story within its global significance.',
    },
    {
      icon: '🔦',
      title: 'Radical Transparency',
      body: 'When we make mistakes, we correct them prominently. We publish our sourcing methodology and funding disclosures openly.',
    },
    {
      icon: '🗝️',
      title: 'Source Protection',
      body: 'We have a sacred obligation to those who trust us with sensitive information. Our secure infrastructure protects our sources absolutely.',
    },
    {
      icon: '📊',
      title: 'Data-Driven Analysis',
      body: 'We believe in showing our work. Our data journalism team makes complex policy and electoral data accessible and understandable.',
    },
  ]

  const timeline = [
    { year: '2010', event: 'Founded in Phnom Penh by a collective of independent journalists committed to impartial political coverage.' },
    { year: '2013', event: 'Launched the Regional Reporting Bureau, expanding coverage across Southeast Asia.' },
    { year: '2016', event: 'Won the South-East Asia Press Freedom Award for investigative reporting on electoral irregularities.' },
    { year: '2019', event: 'Introduced bilingual English and Khmer coverage, reaching a new generation of readers.' },
    { year: '2022', event: 'Reached 100,000 daily active readers. Launched our dedicated Data & Analysis desk.' },
    { year: '2025', event: 'Launched our digital platform, bringing asiandot.com to readers worldwide.' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.08) 0%, transparent 70%), var(--bg-primary)',
        }}
      >
        <Image
          src="/assets/about-hero.png"
          alt="The Tribune Bureau"
          fill
          priority
          className="object-cover opacity-20 pointer-events-none"
        />
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating accent lines */}
        <div className="absolute left-0 top-1/3 w-px h-48 opacity-30" style={{ background: 'linear-gradient(to bottom, transparent, var(--accent-gold), transparent)' }} />
        <div className="absolute right-0 top-1/2 w-px h-64 opacity-20" style={{ background: 'linear-gradient(to bottom, transparent, var(--accent-gold), transparent)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="label-caps text-xs tracking-[0.3em] mb-8" style={{ color: 'var(--accent-gold)' }}>
            Est. 2010 · Independent Political Reporting
          </p>
          <h1
            className="font-display font-bold leading-[0.9] mb-10"
            style={{
              fontSize: 'clamp(64px, 12vw, 140px)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            asiandot.com
          </h1>
          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
          >
            We hold power to account so that citizens can hold power to the light.
          </p>

          {/* Scroll indicator */}
          <div className="mt-20 flex flex-col items-center gap-2 opacity-40">
            <span className="label-caps text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>Scroll</span>
            <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="py-10 px-8 text-center"
                style={{
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <p
                  className="font-display font-bold mb-2"
                  style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: 'var(--accent-gold)', lineHeight: 1 }}
                >
                  {stat.number}
                </p>
                <p className="label-caps text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4">
              <p className="label-caps text-xs tracking-[0.2em] mb-4" style={{ color: 'var(--accent-gold)' }}>
                {dict.ourMission}
              </p>
              <div className="w-10 h-px" style={{ background: 'var(--accent-gold)' }} />
            </div>
            <div className="lg:col-span-8">
              <blockquote
                className="font-display font-bold leading-tight mb-12"
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  color: 'var(--text-primary)',
                  borderLeft: '3px solid var(--accent-gold)',
                  paddingLeft: '2rem',
                }}
              >
                "To provide independent, data-driven political reporting that empowers citizens and strengthens the foundations of democracy."
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
                <p>
                  Asian Dot was founded on a simple conviction: that in a healthy democracy, citizens need access to accurate, unspun information about those who govern them.
                </p>
                <p>
                  In an era of algorithm-driven feeds and partisan amplification, we stand apart by refusing to optimize for outrage. We optimize for truth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto">
          <p className="label-caps text-xs tracking-[0.2em] text-center mb-4" style={{ color: 'var(--accent-gold)' }}>
            {dict.editorialStandards}
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-16" style={{ color: 'var(--text-primary)' }}>
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  {v.icon}
                </div>
                <h3 className="font-display font-bold text-xl mb-3 group-hover:text-[var(--accent-gold)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Source Serif 4, serif' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="label-caps text-xs tracking-[0.2em] text-center mb-4" style={{ color: 'var(--accent-gold)' }}>
            Our Journey
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-center mb-20" style={{ color: 'var(--text-primary)' }}>
            15 Years of Accountability
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex gap-10 items-start">
                  {/* Year badge */}
                  <div
                    className="relative z-10 flex-shrink-0 w-[72px] text-right"
                  >
                    <span
                      className="font-display font-bold tabular-nums"
                      style={{ color: i === timeline.length - 1 ? 'var(--accent-gold)' : 'var(--text-muted)', fontSize: 15 }}
                    >
                      {item.year}
                    </span>
                  </div>

                  {/* Dot */}
                  <div
                    className="relative z-10 flex-shrink-0 w-3 h-3 rounded-full mt-1.5"
                    style={{
                      background: i === timeline.length - 1 ? 'var(--accent-gold)' : 'var(--bg-card)',
                      border: `2px solid ${i === timeline.length - 1 ? 'var(--accent-gold)' : 'var(--border)'}`,
                      marginLeft: '-6px',
                    }}
                  />

                  {/* Content */}
                  <p
                    className="text-base leading-relaxed pt-0.5"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
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
        className="py-32 px-4 sm:px-6 text-center"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-6xl mb-10" style={{ color: 'var(--accent-gold)', opacity: 0.4 }}>"</p>
          <blockquote
            className="font-display font-medium italic leading-tight mb-10"
            style={{ fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--text-primary)' }}
          >
            Democracy dies in darkness. We carry the light.
          </blockquote>
          <p className="label-caps text-sm tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>
            The Editorial Board, Asian Dot
          </p>
        </div>
      </section>

    </div>
  )
}
