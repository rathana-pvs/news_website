import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background dot matrix */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1280px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left: Contact Info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[4px] h-10 flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
              <h1 className="font-display text-5xl md:text-6xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                {dict.getInTouch}
              </h1>
            </div>
            
            <p className="text-xl leading-relaxed mb-12 max-w-md" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
              Have a question, a press inquiry, or a confidential tip? We want to hear from you.
            </p>

            <div className="space-y-12">
              <div className="flex gap-6 group">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 border border-[var(--border)] group-hover:border-[var(--accent-red)] transition-colors" style={{ background: 'var(--bg-card)' }}>
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h3 className="font-mono font-bold text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-red)' }}>General Inquiries</h3>
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>hello@asiandot.com</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 border border-[var(--border)] group-hover:border-[var(--accent-red)] transition-colors" style={{ background: 'var(--bg-card)' }}>
                  <span className="text-xl">⚖️</span>
                </div>
                <div>
                  <h3 className="font-mono font-bold text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-red)' }}>Legal & Privacy</h3>
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>legal@asiandot.com</p>
                </div>
              </div>

              <div className="p-8 border-l-4 border-[var(--accent-red)] bg-[#e8002d]/05 border-[var(--border)] border-l-[var(--accent-red)] border">
                <div className="flex gap-6 mb-4">
                   <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-red)', color: 'white' }}>
                    <span className="text-xl font-bold">!</span>
                  </div>
                  <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Submit a Secure Tip</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
                  For highly sensitive documents or leaks, please use our secure Signal address or contact us via our PGP-encrypted mail.
                </p>
                <div className="p-3 bg-black/50 font-mono text-[10px] tracking-wider border border-white/10" style={{ color: 'var(--text-muted)' }}>
                  PGP FINGERPRINT: 4A7B 9931 2C09 0E3F 2218
                </div>
              </div>

              {/* Social Connections */}
              <div className="pt-10 border-t border-[var(--border)]">
                <h3 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>Follow Our Coverage</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Twitter / X', icon: '𝕏', color: '#ffffff' },
                    { name: 'Telegram', icon: '✈', color: '#ffffff' },
                    { name: 'Facebook', icon: 'f', color: '#ffffff' }
                  ].map((social) => (
                    <a 
                      key={social.name}
                      href="#" 
                      className="flex items-center gap-3 px-6 py-3 border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-red)] transition-all group"
                    >
                      <span className="font-bold group-hover:scale-110 group-hover:text-[var(--accent-red)] transition-all" style={{ color: social.color }}>{social.icon}</span>
                      <span className="font-mono font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="p-10 border border-[var(--border)] bg-[var(--bg-card)] relative">
             {/* Decorative dot matrix corner */}
             <div
              className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
                backgroundSize: '8px 8px',
              }}
            />

            <form className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 outline-none border transition-all focus:border-[var(--accent-red)]" 
                    placeholder="John Doe"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="space-y-3">
                  <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-5 py-4 outline-none border transition-all focus:border-[var(--accent-red)]" 
                    placeholder="john@example.com"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 outline-none border transition-all appearance-none focus:border-[var(--accent-red)]" 
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option>General Editorial Question</option>
                    <option>Press Inquiry</option>
                    <option>Advertising & Sponsorship</option>
                    <option>Technical Issue</option>
                    <option>Confidential Tip</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>Your Message</label>
                <textarea 
                  rows={6}
                  className="w-full px-5 py-4 outline-none border transition-all resize-none focus:border-[var(--accent-red)]" 
                  placeholder="Tell us what's on your mind..."
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 font-mono font-bold text-xs uppercase tracking-[0.3em] transition-all relative group overflow-hidden"
                style={{ background: 'var(--accent-red)', color: 'white' }}
              >
                <span className="relative z-10">Send Message</span>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
