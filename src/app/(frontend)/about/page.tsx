import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const editorialEmail = 'varathana.tech@gmail.com'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Asian Dot, our editorial purpose, reporting principles, and commitment to clear, independent news coverage.',
  alternates: { canonical: '/about' },
}

const principles = [
  {
    number: '01',
    title: 'Accuracy before speed',
    copy: 'We aim to verify consequential claims, distinguish confirmed facts from developing information, and update stories as reporting evolves.',
  },
  {
    number: '02',
    title: 'Context over noise',
    copy: 'Our coverage explains why a development matters, who is affected, and what readers should watch next—not simply what happened.',
  },
  {
    number: '03',
    title: 'Independence of judgment',
    copy: 'Editorial decisions are guided by public interest and news value. Advertising does not determine what we cover or how we report it.',
  },
  {
    number: '04',
    title: 'Visible accountability',
    copy: 'When a material error is identified, we review it promptly and make the correction clear to readers.',
  },
]

const coverage = [
  'Politics and public institutions',
  'Policy, law, and elections',
  'Regional and international affairs',
  'Economics, security, and society',
]

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${siteUrl}/about`,
    mainEntity: {
      '@type': 'NewsMediaOrganization',
      name: 'Asian Dot',
      url: siteUrl,
      email: editorialEmail,
      description: 'An independent digital publication covering politics, policy, and regional affairs.',
    },
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-[1280px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
            <p className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-red)]">
              About Asian Dot
            </p>
            <h1 className="max-w-2xl font-display text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              News with clarity,<br />context, and purpose.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              Asian Dot is an independent digital publication covering the decisions, institutions, and ideas shaping Asia and the wider world.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/" className="bg-[var(--accent-red)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white">
                Read the latest
              </Link>
              <Link href="/contact" className="border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] hover:border-[var(--text-primary)]">
                Contact the newsroom
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden border-t border-[var(--border)] lg:min-h-[640px] lg:border-l lg:border-t-0">
            <Image
              src="/assets/about-hero.png"
              alt="An editorial newsroom after dark"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 max-w-sm font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-white/80">
              Independent reporting for readers who want to understand what comes next.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-red)]">Our purpose</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">Make complex stories easier to understand.</h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-[var(--text-secondary)]">
            <p>Public life moves quickly. Headlines arrive faster than context, and important details are often buried beneath commentary. Asian Dot exists to help readers see the full picture.</p>
            <p>We focus on accessible reporting and analysis across politics, policy, international affairs, and the issues that connect them. Our goal is straightforward: explain significant developments carefully, fairly, and in language people can use.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-red)]">How we work</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Our editorial principles</h2>
          </div>
          <div className="grid border-l border-t border-[var(--border)] md:grid-cols-2">
            {principles.map((principle) => (
              <article key={principle.number} className="border-b border-r border-[var(--border)] bg-[var(--bg-card)] p-7 sm:p-9">
                <span className="font-mono text-xs font-semibold text-[var(--accent-red)]">{principle.number}</span>
                <h3 className="mt-8 font-display text-2xl font-bold">{principle.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-[var(--text-secondary)]">{principle.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-red)]">Coverage</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">What we follow</h2>
            <p className="mt-5 max-w-lg leading-7 text-[var(--text-secondary)]">Our reporting follows power, policy, and their real-world effects, with particular attention to Asia and its relationship with the world.</p>
          </div>
          <ol className="border-t border-[var(--border)]">
            {coverage.map((item, index) => (
              <li key={item} className="flex items-center gap-5 border-b border-[var(--border)] py-5">
                <span className="font-mono text-[10px] text-[var(--text-muted)]">0{index + 1}</span>
                <span className="font-display text-xl font-bold">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--text-primary)] px-5 py-16 text-[var(--bg-primary)] sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-red)]">A more accountable newsroom</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">Questions, corrections, and thoughtful criticism are welcome.</h2>
          </div>
          <a href={`mailto:${editorialEmail}`} className="inline-flex w-fit items-center gap-3 border border-current px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Email our team <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </div>
  )
}
