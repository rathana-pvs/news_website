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
                className="font-display text-2xl font-bold italic mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                The Tribune
              </h2>
            </Link>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--text-muted)', fontFamily: 'Source Serif 4, serif' }}
            >
              {dict.footerTagline}
            </p>
            <div
              className="label-caps text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              © {new Date().getFullYear()} The Tribune. {dict.copyright}
            </div>
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

          {/* Col 4: Social Links */}
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

            {/* Live Link */}
            <Link
              href={`/${locale}/live`}
              className="mt-6 flex items-center gap-2 text-sm hover:text-red-400 transition-colors"
              style={{ color: 'var(--accent-red)' }}
            >
              <span className="live-dot w-2 h-2 rounded-full bg-current" />
              <span className="label-caps" style={{ fontSize: 10 }}>{dict.live}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
