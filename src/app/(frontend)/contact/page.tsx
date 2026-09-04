import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from './ContactForm'

const editorialEmail = 'varathana.tech@gmail.com'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Asian Dot newsroom with questions, story tips, corrections, press inquiries, or privacy requests.',
  alternates: { canonical: '/contact' },
}

const contactRoutes = [
  {
    label: 'News tips & pitches',
    description: 'Share a potential story, source, document, or idea for our editorial team to review.',
    subject: 'Story tip or pitch',
  },
  {
    label: 'Corrections',
    description: 'Flag a possible factual error. Please include the article link and supporting information.',
    subject: 'Correction request',
  },
  {
    label: 'Press & partnerships',
    description: 'Contact us about interviews, republication, media requests, advertising, or collaboration.',
    subject: 'Press or partnership inquiry',
  },
  {
    label: 'Privacy & legal',
    description: 'Submit a privacy request, rights inquiry, copyright notice, or other formal correspondence.',
    subject: 'Privacy or legal request',
  },
]

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiandot.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Asian Dot',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'NewsMediaOrganization',
      name: 'Asian Dot',
      email: editorialEmail,
      url: siteUrl,
    },
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-[var(--border)] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-red)]">Contact</p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_0.7fr]">
            <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl">Let’s start a conversation.</h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--text-secondary)]">Whether you have a news tip, a correction, or a business inquiry, your message will reach the right place.</p>
          </div>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <div className="border-t-2 border-[var(--text-primary)] py-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">General inbox</p>
              <a href={`mailto:${editorialEmail}`} className="mt-3 block break-all font-display text-2xl font-bold underline decoration-[var(--accent-red)] decoration-2 underline-offset-4 sm:text-3xl">{editorialEmail}</a>
              <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">We read every message. Response times vary by request, and we may not be able to reply to every submission.</p>
            </div>

            <div className="mt-8 border-t border-[var(--border)]">
              {contactRoutes.map((route, index) => (
                <a
                  key={route.label}
                  href={`mailto:${editorialEmail}?subject=${encodeURIComponent(route.subject)}`}
                  className="group grid grid-cols-[32px_1fr_auto] gap-3 border-b border-[var(--border)] py-6"
                >
                  <span className="pt-1 font-mono text-[10px] text-[var(--accent-red)]">0{index + 1}</span>
                  <span>
                    <strong className="font-display text-xl">{route.label}</strong>
                    <span className="mt-2 block text-sm leading-6 text-[var(--text-secondary)]">{route.description}</span>
                  </span>
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </a>
              ))}
            </div>

            <aside className="mt-8 bg-[var(--bg-surface)] p-6">
              <h2 className="font-display text-xl font-bold">Sending sensitive information?</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Standard email is not a secure channel for confidential documents. Make initial contact without attaching sensitive material so we can discuss an appropriate next step.</p>
            </aside>
          </div>

          <div className="lg:sticky lg:top-36 lg:self-start">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-secondary)]">Want to understand how we work before getting in touch?</p>
          <Link href="/about" className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-red)]">Read about our editorial approach →</Link>
        </div>
      </section>
    </div>
  )
}
