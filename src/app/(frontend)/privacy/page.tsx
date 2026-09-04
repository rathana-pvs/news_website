import type { Metadata } from 'next'
import Link from 'next/link'

const privacyEmail = 'varathana.tech@gmail.com'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Asian Dot collects, uses, and protects information when you visit our website or contact our newsroom.',
  alternates: { canonical: '/privacy' },
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'information', label: 'Information we collect' },
  { id: 'use', label: 'How we use information' },
  { id: 'cookies', label: 'Cookies and advertising' },
  { id: 'choices', label: 'Your choices and rights' },
  { id: 'retention', label: 'Retention and security' },
  { id: 'contact', label: 'Contact us' },
]

const PolicySection = ({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-36 border-t border-[var(--border)] py-9 sm:py-12">
    <div className="grid gap-4 sm:grid-cols-[64px_1fr]">
      <span className="font-mono text-[11px] font-semibold text-[var(--accent-red)]">{number}</span>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <div className="mt-5 space-y-5 text-[16px] leading-8 text-[var(--text-secondary)]">{children}</div>
      </div>
    </div>
  </section>
)

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-red)]">Legal & transparency</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
            <h1 className="font-display text-5xl font-black leading-none tracking-[-0.04em] sm:text-7xl">Privacy policy</h1>
            <div>
              <p className="text-lg leading-8 text-[var(--text-secondary)]">A plain-language explanation of the information our website uses and the choices available to you.</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Effective: September 4, 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[260px_1fr] lg:gap-20 lg:py-20">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">On this page</p>
          <nav aria-label="Privacy policy sections" className="border-l border-[var(--border)]">
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`} className="block border-l-2 border-transparent py-2 pl-4 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-red)] hover:text-[var(--text-primary)]">
                <span className="mr-2 font-mono text-[9px] text-[var(--text-muted)]">0{index + 1}</span>{section.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="font-display text-lg font-bold">Privacy question?</p>
            <a href={`mailto:${privacyEmail}?subject=Privacy%20request`} className="mt-3 block break-all text-sm font-semibold text-[var(--accent-red)] underline">{privacyEmail}</a>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 border-l-4 border-[var(--accent-red)] bg-[var(--bg-surface)] p-6 sm:p-8">
            <p className="font-display text-xl font-bold">The short version</p>
            <p className="mt-3 leading-7 text-[var(--text-secondary)]">We use limited technical data to operate and understand the site, support advertising, and respond when you contact us. We do not sell the contact information you send to our newsroom.</p>
          </div>

          <PolicySection id="overview" number="01" title="Overview">
            <p>This policy applies to Asian Dot’s website and explains what information may be processed when you read our coverage, use site features, or communicate with us.</p>
            <p>Third-party websites linked from our articles have their own privacy practices. We encourage you to review those policies before providing information to them.</p>
          </PolicySection>

          <PolicySection id="information" number="02" title="Information we collect">
            <p><strong className="text-[var(--text-primary)]">Information you provide.</strong> If you email us or use the contact page, we receive the details you choose to include, such as your name, email address, message, and attachments.</p>
            <p><strong className="text-[var(--text-primary)]">Technical and usage information.</strong> Our service providers may process device type, browser, approximate location, referring page, pages viewed, and similar diagnostic or audience data. Server logs may also include an IP address and request details needed to operate and protect the site.</p>
          </PolicySection>

          <PolicySection id="use" number="03" title="How we use information">
            <ul className="list-disc space-y-3 pl-5 marker:text-[var(--accent-red)]">
              <li>Deliver, maintain, troubleshoot, and secure the website.</li>
              <li>Understand broad readership patterns and improve coverage and site performance.</li>
              <li>Display, measure, and manage advertising that supports access to our journalism.</li>
              <li>Respond to editorial, correction, business, legal, and privacy inquiries.</li>
              <li>Meet legal obligations and protect the rights and safety of readers, sources, and the publication.</li>
            </ul>
          </PolicySection>

          <PolicySection id="cookies" number="04" title="Cookies, analytics, and advertising">
            <p>Cookies and related technologies may remember site preferences, measure usage, prevent abuse, and support advertising. Asian Dot uses third-party services that may include Google Analytics, Google AdSense, AdsKeeper, and website audience measurement tools.</p>
            <p>These providers may process identifiers and activity under their own policies. Where required, a consent notice lets you manage non-essential cookies. You can also limit cookies through your browser and manage Google advertising preferences in <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent-red)] underline">My Ad Center</a>.</p>
          </PolicySection>

          <PolicySection id="choices" number="05" title="Your choices and rights">
            <p>Depending on where you live, you may have rights to request access to, correction of, or deletion of personal information, or to object to or restrict certain processing. You may also withdraw consent where processing relies on consent.</p>
            <p>Send a request to <a href={`mailto:${privacyEmail}?subject=Privacy%20rights%20request`} className="font-semibold text-[var(--accent-red)] underline">{privacyEmail}</a>. We may need to verify your identity and clarify the scope of your request before responding.</p>
          </PolicySection>

          <PolicySection id="retention" number="06" title="Retention and security">
            <p>We keep personal information only as long as reasonably needed for the purpose described in this policy, to maintain appropriate records, or to meet legal obligations.</p>
            <p>We use reasonable safeguards, but no website or email system can guarantee absolute security. Please do not send sensitive documents through standard email before agreeing on an appropriate method with us.</p>
          </PolicySection>

          <PolicySection id="contact" number="07" title="Contact us">
            <p>For questions about this policy or a request concerning your information, email <a href={`mailto:${privacyEmail}?subject=Privacy%20inquiry`} className="font-semibold text-[var(--accent-red)] underline">{privacyEmail}</a>.</p>
            <p>We may revise this policy as the website and our service providers change. The effective date at the top of this page shows when this version took effect.</p>
          </PolicySection>

          <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">Questions beyond privacy?</p>
            <Link href="/contact" className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-red)]">Visit the contact page →</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
