import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
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

          <section className="p-10 border border-[var(--border)] bg-[var(--bg-card)] relative">
             {/* Decorative dot matrix corner */}
             <div
              className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
                backgroundSize: '8px 8px',
              }}
            />
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-4" style={{ color: 'var(--text-primary)' }}>
              <span className="w-8 h-8 flex items-center justify-center bg-[#e8002d]/10 text-xl border border-[var(--accent-red)]/20">📊</span> 
              {dict.dataCollection}
            </h2>
            <div className="space-y-4">
              <p>
                {dict.privacyText}
              </p>
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  NOTE: Google Analytics helps us see which regions are most interested in our reports and which topics are trending. This data is anonymized.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>2. Cookies</h2>
            <p>
              We use functional cookies to remember your language preferences (English or Khmer) and to ensure the website loads as quickly as possible. You can disable cookies in your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>3. Newsletter & Comments</h2>
            <p>
              If you choose to subscribe to our newsletter or comment on articles, we collect your email address purely for communication purposes. We will never sell your data to third parties or political organizations.
            </p>
          </section>

          <section>
            <h2 className="font-mono font-bold text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--accent-red)' }}>4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete any personal information we hold about you. For any privacy-related requests, please contact our data protection officer at <span className="font-bold border-b border-[var(--accent-red)]" style={{ color: 'var(--text-primary)' }}>privacy@asiandot.com</span>.
            </p>
          </section>

          <div className="pt-16 border-t border-[var(--border)] flex justify-between items-center text-xs font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <span>LAST UPDATED: APRIL 16, 2026</span>
            <div className="w-8 h-[1px] bg-[var(--accent-red)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
