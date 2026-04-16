import Link from 'next/link'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'
import { Category, Region } from '@/types'

export function Footer({ 
  locale = 'en',
  categories = [],
  regions = []
}: { 
  locale?: string,
  categories?: Category[],
  regions?: Region[]
}) {
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Col 1: Logo + Tagline */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href={`/${locale}`}>
              <h2
                className="font-display text-2xl font-bold italic mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                asiandot
              </h2>
            </Link>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)', fontFamily: 'Source Serif 4, serif' }}
            >
              {dict.footerTagline}
            </p>
          </div>

          {/* Col 2: Category Links */}
          <div>
            <h3
              className="label-caps mb-4"
              style={{ color: 'var(--accent-gold)', fontSize: 13, letterSpacing: '0.12em' }}
            >
              {dict.category}
            </h3>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/category/${cat.slug}`}
                  className="text-sm py-1 hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Region Links */}
          <div>
            <h3
              className="label-caps mb-4"
              style={{ color: 'var(--accent-gold)', fontSize: 13, letterSpacing: '0.12em' }}
            >
              {dict.region}
            </h3>
            <div className="flex flex-col gap-1.5">
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/${locale}/region/${region.slug}`}
                  className="text-sm py-1 hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                   {region.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Organization */}
          <div>
            <h3
              className="label-caps mb-4"
              style={{ color: 'var(--accent-gold)', fontSize: 13, letterSpacing: '0.12em' }}
            >
              {dict.organization || 'Organization'}
            </h3>
            <div className="flex flex-col gap-1.5">
              <Link
                href={`/${locale}/about`}
                className="text-sm py-1 hover:text-[var(--accent-gold)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dict.aboutUs}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm py-1 hover:text-[var(--accent-gold)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dict.contactUs}
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="text-sm py-1 hover:text-[var(--accent-gold)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {dict.privacyPolicy || 'Privacy Policy'}
              </Link>
            </div>
          </div>

          {/* Col 5: Social Links */}
          <div className="col-span-2 md:col-span-1">
            <h3
              className="label-caps mb-4"
              style={{ color: 'var(--accent-gold)', fontSize: 13, letterSpacing: '0.12em' }}
            >
              {dict.followUs}
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { name: 'Twitter / X', href: '#', icon: '𝕏' },
                { name: 'Facebook', href: '#', icon: 'f' },
                { name: 'YouTube', href: '#', icon: '▶' },
                { name: 'Telegram', href: '#', icon: '✈' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center gap-2.5 text-sm hover:text-[var(--accent-gold)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    {social.icon}
                  </span>
                  {social.name}
                </a>
              ))}
            </div>

          </div>
        </div>
        
        {/* Bottom Bar: Copyright */}
        <div 
          className="mt-12 md:mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="label-caps text-[10px] tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            © {new Date().getFullYear()} ASIANDOT — {dict.copyright}
          </div>
          
          <div className="flex gap-6 text-[10px] label-caps tracking-widest" style={{ color: 'var(--text-muted)' }}>
            <Link href={`/${locale}/privacy`} className="hover:text-[var(--accent-gold)] transition-colors">
              {dict.privacyPolicy || 'Privacy'}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-[var(--accent-gold)] transition-colors">
              {dict.contactUs}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
