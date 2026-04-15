import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-24 px-4 sm:px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          {dict.privacyPolicy}
        </h1>
        
        <div className="space-y-10 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
          
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>1. Introduction</h2>
            <p>
              Welcome to Asian Dot. We value your privacy and are committed to protecting your personal data. This policy explains how we collect and use information when you visit our platform.
            </p>
          </section>

          <section className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-inner">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--accent-gold)' }}>
              <span>📊</span> {dict.dataCollection}
            </h2>
            <p className="mb-4">
              {dict.privacyText}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Google Analytics helps us see which regions are most interested in our reports and which topics are trending. This data is anonymized and does not identify you personally.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>2. Cookies</h2>
            <p>
              We use functional cookies to remember your language preferences (English or Khmer) and to ensure the website loads as quickly as possible. You can disable cookies in your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>3. Newsletter & Comments</h2>
            <p>
              If you choose to subscribe to our newsletter or comment on articles, we collect your email address purely for communication purposes. We will never sell your data to third parties or political organizations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete any personal information we hold about you. For any privacy-related requests, please contact our data protection officer at <span style={{ color: 'var(--accent-gold)' }}>privacy@asiandot.com</span>.
            </p>
          </section>

          <div className="pt-10 border-t border-[var(--border)]">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Last updated: April 14, 2026. This policy may be updated from time to time to reflect changes in our practices or for legal reasons.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
