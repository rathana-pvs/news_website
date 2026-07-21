'use client'

import { useState, useEffect } from 'react'
import AdskeeperWidget from './AdskeeperWidget'

interface MobileStickyFooterAdProps {
  widgetId: string
}

export function MobileStickyFooterAd({ widgetId }: MobileStickyFooterAdProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Only show on screen size < 1024px (mobile/tablet layout in Tailwind)
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreen()
    window.addEventListener('resize', checkScreen)
    
    // Slide up with a 3-second delay to not jar the user immediately
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => {
      window.removeEventListener('resize', checkScreen)
      clearTimeout(timer)
    }
  }, [])

  if (!isMobile || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out transform translate-y-0 p-2 pb-safe">
      <div className="max-w-md mx-auto relative flex flex-col items-center">
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-10 right-2 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center text-sm font-bold shadow-lg transition-colors cursor-pointer"
          aria-label="Close Ad"
        >
          ✕
        </button>
        
        {/* Ad Container */}
        <div className="w-full flex justify-center overflow-hidden" style={{ minHeight: 50, maxHeight: 120 }}>
          <AdskeeperWidget 
            widgetId={widgetId} 
            className="!my-0 scale-95 origin-center" 
          />
        </div>
      </div>
    </div>
  )
}
