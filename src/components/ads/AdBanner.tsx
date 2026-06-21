'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slotId?: string // This will be your Adsterra Key
  format?: '728x90' | '300x250' | '160x600' | 'native'
  className?: string
  label?: string
}

export function AdBanner({ slotId, format = '728x90', className = '', label = 'Advertisement' }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)

  // Mapping formats to dimensions
  const dimensions = {
    '728x90': { width: '728px', height: '90px' },
    '300x250': { width: '300px', height: '250px' },
    '160x600': { width: '160px', height: '600px' },
    'native': { width: '100%', height: 'auto' }
  }

  const dim = dimensions[format]

  useEffect(() => {
    // If we have a real slotId, we would inject the Adsterra script here
    if (slotId && adContainerRef.current) {
      const script = document.createElement('script')
      // Adsterra logic usually goes here...
      // script.src = `//.../invoke.js`
      // adContainerRef.current.appendChild(script)
    }
  }, [slotId])

  return (
    <div className={`ad-container flex flex-col items-center my-10 ${className}`}>
      {label && (
        <span className="label-caps text-[10px] mb-2 tracking-widest opacity-30">
          {label}
        </span>
      )}
      
      <div 
        ref={adContainerRef}
        className="relative bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center text-[var(--text-muted)] italic text-sm transition-all hover:border-[var(--accent-gold)]/50"
        style={{ 
          width: dim.width, 
          height: dim.height,
          maxWidth: '100%',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
          // Scale down for mobile if it's the large leaderboard
          transform: format === '728x90' ? 'scale(var(--ad-scale, 1))' : 'none',
          transformOrigin: 'top center'
        }}
      >
        <style jsx>{`
          div {
            --ad-scale: 1;
          }
          @media (max-width: 768px) {
            div {
              --ad-scale: 0.45; /* Scales 728px down to roughly fit 330px width */
            }
          }
           @media (max-width: 400px) {
            div {
              --ad-scale: 0.4;
            }
          }
        `}</style>
        {!slotId && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl">📢</span>
            <span>{format} Ad Slot</span>
          </div>
        )}
      </div>
    </div>
  )
}
