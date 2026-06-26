'use client'

import { i18nStrings } from '@/lib/i18n'

export default function Loading() {
  // We use a simple fallback here since params are not available inside root loading.tsx easily
  // but we can make it look premium regardless.
  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6">
      {/* Premium Loading Bar */}
      <div className="w-full max-w-[200px] h-[2px] bg-[var(--border)] relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[var(--accent-gold)] animate-loading-slide" />
      </div>
      
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold mb-2 animate-pulse" style={{ color: 'var(--text-primary)' }}>
          asiandot.com
        </h2>
        <p className="label-caps text-[10px] tracking-[0.3em]" style={{ color: 'var(--accent-gold)' }}>
          Retrieving Briefing...
        </p>
      </div>

      <style jsx global>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-slide {
          animation: loading-slide 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
