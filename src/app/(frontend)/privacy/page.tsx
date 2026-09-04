import type { Metadata } from 'next'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Asian Dot protects your personal data, privacy rights, and how we handle cookies and analytics.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Asian Dot',
    description: 'Learn how Asian Dot protects your personal data, privacy rights, and how we handle cookies and analytics.',
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
    description: 'Learn how Asian Dot protects your personal data, privacy rights, and how we handle cookies and analytics.',
    images: ['/logo.png'],
  },
}

export default async function PrivacyPage() {
  const locale = 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background dot matrix */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[800px] mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-[4px] h-10 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            {dict.privacyPolicy}
          </h1>
        </div>
        
        <div className="space-y-12 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
          
          <section className="relative">
             <div className="absolute -left-10 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>1. Introduction</h2>
            <p>
              Welcome to Asian Dot. We value your privacy and are committed to protecting your personal data. This policy explains how we collect and use information when you visit our platform.
            </p>
          </section>

          <section className="p-8 sm:p-10 border border-[var(--border)] bg-[var(--bg-card)] relative rounded-lg">
             {/* Decorative dot matrix corner */}
             <div
              className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
                backgroundSize: '8px 8px',
              }}
            />
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-4" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-xl border border-[var(--accent-red)]/20 rounded">📊</span> 
              {dict.dataCollection}
            </h2>
            <div className="space-y-4">
              <p>
                {dict.privacyText}
              </p>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="font-mono text-[11px] uppercase tracking-wider leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Google Analytics collects pseudonymous telemetry (such as session duration, device type, and referral sources) to help our editorial team understand which regions and topics resonate most with readers.
                </p>
              </div>
            </div>
          </section>

          {/* Dedicated Google AdSense & Advertising Section (Required by Google AdSense Policy) */}
          <section className="p-8 sm:p-10 border border-[var(--border)] bg-[var(--bg-card)] relative rounded-lg">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-4" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-xl border border-[var(--accent-red)]/20 rounded">📢</span> 
              3. Advertising & Google AdSense
            </h2>
            <div className="space-y-4">
              <p>
                To fund our independent political reporting and keep content openly accessible, Asian Dot displays advertisements served by third-party advertising networks, including <strong>Google AdSense</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                <li>
                  Third-party vendors, including <strong>Google</strong>, use cookies and device identifiers to serve ads based on your prior visits to Asian Dot and other websites across the internet.
                </li>
                <li>
                  Google&apos;s use of advertising cookies enables it and its partners to serve personalized or contextual advertisements to you based on your visit to this site and/or other sites on the web.
                </li>
                <li>
                  We may also display contextual native content recommendations provided by certified advertising partners (such as AdsKeeper).
                </li>
              </ul>
              
              <div className="pt-4 border-t border-[var(--border)] space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--accent-red)' }}>
                  Your Ad Choices & How to Opt Out
                </h3>
                <p className="text-base">
                  You have full control over personalized advertising. You can opt out of personalized ads at any time through the following official resources:
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider border border-[var(--accent-red)]/40 hover:border-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors rounded"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>Google Ad Settings</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider border border-[var(--border)] hover:border-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors rounded"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>AboutAds.info Choices</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                  <a
                    href="https://www.youronlinechoices.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider border border-[var(--border)] hover:border-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors rounded"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>Your Online Choices (EU)</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-wider pt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Visitors from the European Economic Area (EEA), UK, and Switzerland are presented with a Google-certified Consent Management popup on their initial visit to explicitly grant or decline consent for personalized cookies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>4. Cookies & Tracking Technologies</h2>
            <p>
              We use both first-party cookies (to remember language and theme preferences) and third-party cookies (for traffic analytics and ad delivery). You can modify or block cookie storage directly in your web browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>5. Tips, Submissions & Inquiries</h2>
            <p>
              If you submit a tip, editorial inquiry, or message through our contact channels, we process your email and submission solely to respond to your communication. We never sell, rent, or trade reader contact details to commercial brokers or political campaigns.
            </p>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>6. Your Rights & Data Protection</h2>
            <p>
              Under applicable privacy legislation (including GDPR and CCPA/CPRA), you have the right to access, rectify, or request deletion of any personal data associated with you. To submit a data inquiry or request, please contact our data team at <span className="font-bold border-b border-[var(--accent-red)]" style={{ color: 'var(--text-primary)' }}>privacy@asiandot.com</span>.
            </p>
          </section>

          <div className="pt-16 border-t border-[var(--border)] flex justify-between items-center text-xs font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>LAST UPDATED: SEPTEMBER 2026</span>
            <div className="w-8 h-[1px] bg-[var(--accent-red)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
