'use client'

import { useState } from 'react'

const editorialEmail = 'varathana.tech@gmail.com'

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General question', message: '' })
  const [opened, setOpened] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = encodeURIComponent(`[Asian Dot] ${formData.subject}`)
    const body = encodeURIComponent(`From: ${formData.name}\nReply email: ${formData.email}\n\n${formData.message}`)
    window.location.href = `mailto:${editorialEmail}?subject=${subject}&body=${body}`
    setOpened(true)
  }

  const fieldClass = 'mt-2 w-full rounded-none border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-red)]'

  return (
    <div className="border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-9">
      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-red)]">Send a message</p>
        <h2 className="mt-2 font-display text-3xl font-bold">Write to the newsroom</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Complete the fields below and your email app will open with the message ready to send.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Full name
            <input className={fieldClass} type="text" autoComplete="name" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Your full name" />
          </label>
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Email address
            <input className={fieldClass} type="email" autoComplete="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="you@company.com" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-[var(--text-primary)]">
          What can we help with?
          <select className={`${fieldClass} appearance-none`} value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })}>
            <option>General question</option>
            <option>Story pitch or news tip</option>
            <option>Correction request</option>
            <option>Press and media inquiry</option>
            <option>Advertising or partnership</option>
            <option>Privacy or legal request</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-[var(--text-primary)]">
          Message
          <textarea className={`${fieldClass} min-h-40 resize-y`} required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="Tell us how we can help. For correction requests, please include the article link and the detail you believe should be reviewed." />
        </label>
        <button type="submit" className="flex w-full items-center justify-center gap-3 bg-[var(--accent-red)] px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white hover:opacity-90">
          Continue to email <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs leading-5 text-[var(--text-muted)]">This form does not upload your message to our website. Your email provider handles delivery when you send it.</p>
        {opened && (
          <p role="status" className="border-l-2 border-[var(--accent-red)] pl-3 text-sm leading-6 text-[var(--text-secondary)]">
            Your email app should now be open. If it did not launch, email us directly at{' '}
            <a className="font-semibold text-[var(--accent-red)] underline" href={`mailto:${editorialEmail}`}>{editorialEmail}</a>.
          </p>
        )}
      </form>
    </div>
  )
}
