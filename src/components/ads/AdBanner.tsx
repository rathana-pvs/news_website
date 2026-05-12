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
    <div className={`ad-container flex flex-col items-center my-8 sm:my-10 ${className}`}>
      {label && (
        <span className="label-caps text-[10px] mb-2 tracking-widest opacity-30">
          {label}
        </span>
      )}
      
      <div 
        ref={adContainerRef}
        className="relative bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center text-[var(--text-muted)] italic text-sm transition-all hover:border-[var(--accent-red)]/50"
        style={{ 
          width: dim.width, 
          height: dim.height,
          maxWidth: '100%',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
        }}
      >
        <style jsx>{`
          @media (max-width: 768px) {
            div {
              width: 100% !important;
              height: 76px !important;
            }
          }
        `}</style>
        {!slotId && (
          <div className="flex flex-col items-center gap-2">
            <span className="h-1 w-12 bg-[var(--accent-red)]" />
            <span>{format} Ad Slot</span>
          </div>
        )}
      </div>
    </div>
  )
}
