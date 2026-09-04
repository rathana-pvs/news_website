'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Editorial Inquiry',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    // Construct mailto link as reliable client-side mail trigger
    const mailtoSubject = encodeURIComponent(`[Asian Dot Contact] ${formData.subject} - ${formData.name}`)
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
    )
    
    // Open user's email client
    window.location.href = `mailto:varathana.tech@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`
    setStatus('submitted')
  }

  return (
    <div
      className="p-8 sm:p-10 border relative"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--accent-red) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: 'var(--accent-red)' }}>
            Send a Direct Dispatch
          </span>
          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Editorial Inquiry Form
          </h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          DIRECT INBOX
        </span>
      </div>

      {status === 'submitted' ? (
        <div className="py-12 text-center space-y-4">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(232, 0, 45, 0.1)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}
          >
            ✓
          </div>
          <h3 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Opening Email Dispatch...
          </h3>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Your email client has been opened with your message addressed to <strong>varathana.tech@gmail.com</strong>.
            You can also write directly to <a href="mailto:varathana.tech@gmail.com" className="underline font-bold" style={{ color: 'var(--accent-red)' }}>varathana.tech@gmail.com</a>.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 px-6 py-2.5 font-mono text-xs uppercase tracking-widest border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>
                Your Name <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-4 py-3.5 outline-none border transition-all text-sm focus:border-[var(--accent-red)]"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>
                Your Email <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full px-4 py-3.5 outline-none border transition-all text-sm focus:border-[var(--accent-red)]"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>
              Subject Category <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <div className="relative">
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3.5 outline-none border transition-all appearance-none text-sm focus:border-[var(--accent-red)] cursor-pointer"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="General Editorial Inquiry">General Editorial Inquiry</option>
                <option value="Story Pitch & Tip">Story Pitch & Confidential Tip</option>
                <option value="Factual Correction Request">Factual Correction / Retraction Request</option>
                <option value="Press & Media Relations">Press Release & Media Kit</option>
                <option value="Advertising & Sponsorship">Advertising & Partnerships</option>
                <option value="Legal & Privacy Rights">Legal & Privacy (GDPR/CCPA)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] block" style={{ color: 'var(--text-muted)' }}>
              Message Content <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Provide background context, source links, or detailed questions for our editorial desk..."
              className="w-full px-4 py-3.5 outline-none border transition-all text-sm resize-none focus:border-[var(--accent-red)]"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 font-mono font-bold text-xs uppercase tracking-[0.25em] transition-all relative group overflow-hidden flex items-center justify-center gap-2 hover:opacity-95 shadow-md"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            <span>Dispatch to varathana.tech@gmail.com</span>
            <span>→</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            <span>🔒 Confidential transmission</span>
            <span>Est. Response: &lt; 24h</span>
          </div>
        </form>
      )}
    </div>
  )
}
