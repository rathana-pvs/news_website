import React from 'react'

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center">
        {/* Minimalist loader with Tribune aesthetic */}
        <div 
          className="w-24 h-24 rounded-full border border-dashed animate-spin duration-[6000ms]" 
          style={{ borderColor: 'var(--border)' }} 
        />
        <div 
          className="absolute w-16 h-16 rounded-full border border-double animate-reverse-spin duration-[4000ms]" 
          style={{ borderColor: 'var(--accent-gold-dim)', borderWidth: '4px' }} 
        />
        <div 
          className="absolute w-3 h-3 rounded-full skeleton" 
          style={{ background: 'var(--accent-gold)' }} 
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px]" style={{ background: 'var(--border)' }} />
          <h2 
            className="font-display text-2xl font-bold tracking-[0.2em] uppercase italic" 
            style={{ color: 'var(--text-primary)' }}
          >
            The Tribune
          </h2>
          <div className="w-8 h-[1px]" style={{ background: 'var(--border)' }} />
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <p className="label-caps text-sm tracking-[0.3em]" style={{ color: 'var(--accent-gold)' }}>
            Briefing in progress
          </p>
          <div className="w-32 h-[1px] relative overflow-hidden mt-1" style={{ background: 'var(--border)' }}>
            <div className="absolute inset-y-0 left-0 w-1/3 h-full skeleton-slide" style={{ background: 'var(--accent-gold)' }} />
          </div>
        </div>
      </div>

    </div>
  )
}
