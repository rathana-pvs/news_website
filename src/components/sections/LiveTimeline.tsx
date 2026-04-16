'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { LiveUpdate } from '@/types'
import { formatDate } from '@/lib/utils'
import { i18nStrings } from '@/lib/i18n'
import { Locale } from '@/i18n-config'

interface LiveTimelineProps {
  updates: LiveUpdate[]
}

export function LiveTimeline({ updates }: LiveTimelineProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const dict = i18nStrings[locale as Locale] || i18nStrings.en

  return (
    <div className="flex flex-col gap-0">
      {updates.map((update, i) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }}
          className="flex gap-4 py-5"
          style={{
            borderLeft: `3px solid ${update.isBreaking ? 'var(--accent-red-bright)' : i === 0 ? 'var(--accent-gold)' : 'var(--border)'}`,
            paddingLeft: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="min-w-0 flex-1">
            {/* Timestamp + Badge row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="label-caps"
                style={{ color: 'var(--accent-gold)', fontSize: 10 }}
                suppressHydrationWarning
              >
                {formatDate(update.timestamp, 'HH:mm', locale)}
              </span>
              {update.category && (
                <span
                  className="label-caps px-1.5 py-0.5 rounded-sm text-xs"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {update.category}
                </span>
              )}
              {update.isBreaking && (
                <span
                  className="label-caps px-1.5 py-0.5 rounded-sm text-xs"
                  style={{ background: 'var(--accent-red)', color: '#fff' }}
                >
                  {dict.breaking}
                </span>
              )}
            </div>

            {/* Headline */}
            <h3
              className="font-display font-bold text-base leading-snug mb-2"
              style={{ color: update.isBreaking ? 'var(--accent-red-bright)' : 'var(--text-primary)' }}
            >
              {update.headline}
            </h3>

            {/* Body */}
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
            >
              {update.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
