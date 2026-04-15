import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-20 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left: Contact Info */}
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {dict.getInTouch}
            </h1>
            <p className="text-xl leading-relaxed mb-12 max-w-md" style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}>
              Have a question, a press inquiry, or a confidential tip? We want to hear from you.
            </p>

            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>General Inquiries</h3>
                  <p style={{ color: 'var(--text-muted)' }}>hello@the-tribune.com</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-xl">⚖️</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Legal & Privacy</h3>
                  <p style={{ color: 'var(--text-muted)' }}>legal@the-tribune.com</p>
                </div>
              </div>

              <div className="flex gap-6 p-6 rounded-2xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}>
                  <span className="text-xl font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--accent-gold)' }}>Submit a Secure Tip</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    For highly sensitive documents or leaks, please use our secure Signal address or contact us via our PGP-encrypted mail.
                  </p>
                  <p className="mt-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Fingerprint: 4A7B 9931 2C09 ...</p>
                </div>
              </div>

              {/* Social Connections */}
              <div className="pt-10 border-t border-[var(--border)]">
                <h3 className="label-caps text-xs tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Follow Our Coverage</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Twitter / X', icon: '𝕏', color: '#000000' },
                    { name: 'Telegram', icon: '✈', color: '#0088cc' },
                    { name: 'Facebook', icon: 'f', color: '#1877F2' }
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href="#" 
                      className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)] transition-all group"
                    >
                      <span className="font-bold group-hover:scale-110 transition-transform" style={{ color: social.color }}>{social.icon}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="p-8 md:p-12 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/50">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-caps text-xs tracking-widest block" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3 rounded-xl outline-none border transition-all" 
                    placeholder="John Doe"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-caps text-xs tracking-widest block" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-5 py-3 rounded-xl outline-none border transition-all" 
                    placeholder="john@example.com"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-xs tracking-widest block" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <select 
                  className="w-full px-5 py-3 rounded-xl outline-none border transition-all appearance-none" 
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option>General Editorial Question</option>
                  <option>Press Inquiry</option>
                  <option>Advertising & Sponsorship</option>
                  <option>Technical Issue</option>
                  <option>Confidential Tip</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="label-caps text-xs tracking-widest block" style={{ color: 'var(--text-muted)' }}>Your Message</label>
                <textarea 
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl outline-none border transition-all resize-none" 
                  placeholder="Tell us what's on your mind..."
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 rounded-xl label-caps font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
