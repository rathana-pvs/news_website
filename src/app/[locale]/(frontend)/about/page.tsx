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
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background dot matrix */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating accent lines */}
        <div className="absolute left-0 top-1/4 w-[3px] h-64 opacity-80" style={{ background: 'var(--accent-red)' }} />
        
        {/* Dot Matrix element like hero */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono font-bold text-[10px] uppercase tracking-[0.4em] mb-8" style={{ color: 'var(--accent-red)' }}>
            Est. 2010 · Independent Political Reporting
          </p>
          <h1
            className="font-display font-bold leading-[0.85] mb-10 tracking-tight"
            style={{
              fontSize: 'clamp(56px, 12vw, 130px)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
            }}
          >
            Asian<span style={{ color: 'var(--accent-red)' }}>dot</span>
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}
          >
            We hold power to account so that citizens can hold power to the light.
          </p>

          {/* Scroll indicator with red accent */}
          <div className="mt-16 flex flex-col items-center gap-2">
            <div className="w-px h-16" style={{ background: 'linear-gradient(to bottom, var(--accent-red), transparent)' }} />
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
                className="py-12 px-8 text-center"
                style={{
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <p
                  className="font-display font-bold mb-2"
                  style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--accent-red)', lineHeight: 1 }}
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
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[4px] h-6 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
                <h2 className="font-mono font-bold text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--accent-red)' }}>
                  {dict.ourMission}
                </h2>
              </div>
            </div>
            <div className="lg:col-span-8">
              <blockquote
                className="font-display font-bold leading-tight mb-12"
                style={{
                  fontSize: 'clamp(24px, 4vw, 44px)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                "To provide independent, data-driven political reporting that empowers citizens and strengthens the foundations of democracy."
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-base leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
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
      <section className="py-24 px-4 sm:px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>
               {dict.editorialStandards}
            </h2>
            <h3 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              What We Stand For
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
                  className="w-12 h-12 flex items-center justify-center text-2xl mb-8"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {v.icon}
                </div>
                <h4 className="font-display font-bold text-xl mb-4 group-hover:text-[var(--accent-red)] transition-colors" style={{ color: 'var(--text-primary)' }}>
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
      <section className="py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>
              Our Journey
            </h2>
            <h3 className="font-display font-bold text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              15 Years of Accountability
            </h3>
          </div>

          <div className="relative">
            {/* Vertical line with red gradient */}
            <div className="absolute left-[72px] top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, var(--accent-red), var(--border) 20%, var(--border) 80%, var(--accent-red))' }} />

            <div className="space-y-16">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex gap-10 items-start">
                  {/* Year badge */}
                  <div className="relative z-10 flex-shrink-0 w-[72px] text-right">
                    <span
                      className="font-display font-extrabold tabular-nums"
                      style={{ color: i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: 16 }}
                    >
                      {item.year}
                    </span>
                  </div>

                  {/* Dot */}
                  <div
                    className="relative z-10 flex-shrink-0 w-4 h-4 rounded-full mt-1.5"
                    style={{
                      background: i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--bg-card)',
                      border: `2px solid ${i === timeline.length - 1 ? 'var(--accent-red)' : 'var(--border)'}`,
                      marginLeft: '-7px',
                    }}
                  />

                  {/* Content */}
                  <p
                    className="text-base leading-relaxed pt-0.5"
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
        className="py-32 px-4 sm:px-6 text-center border-t relative overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Subtle dot matrix again */}
         <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-display font-bold text-6xl mb-10 leading-none" style={{ color: 'var(--accent-red)', opacity: 0.6 }}>"</p>
          <blockquote
            className="font-display font-bold italic leading-tight mb-10"
            style={{ fontSize: 'clamp(24px, 4vw, 42px)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Democracy dies in darkness. We carry the light.
          </blockquote>
          <div className="w-12 h-[2px] mx-auto mb-6" style={{ background: 'var(--accent-red)' }} />
          <p className="font-mono font-bold text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--accent-red)' }}>
             The Editorial Board, Asian Dot
          </p>
        </div>
      </section>

    </div>
  )
}
