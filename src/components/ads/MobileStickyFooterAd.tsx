'use client'

import { useState, useEffect } from 'react'
import AdskeeperWidget from './AdskeeperWidget'

interface MobileStickyFooterAdProps {
  widgetId: string
}

export function MobileStickyFooterAd({ widgetId }: MobileStickyFooterAdProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreen()
    window.addEventListener('resize', checkScreen)
    
    // Slide up with a 2-second delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => {
      window.removeEventListener('resize', checkScreen)
      clearTimeout(timer)
    }
  }, [])

  if (!isMobile || isDismissed) return null

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out p-2 pb-safe ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto relative flex flex-col items-center">
        {/* Close Button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute -top-10 right-2 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center text-sm font-bold shadow-lg transition-colors cursor-pointer"
          aria-label="Close Ad"
        >
          ✕
        </button>
        
        {/* Ad Container */}
        <div className="w-full flex justify-center overflow-hidden" style={{ minHeight: 50, maxHeight: 120 }}>
          {isVisible && (
            <AdskeeperWidget 
              widgetId={widgetId} 
              className="!my-0 scale-95 origin-center" 
            />
          )}
        </div>
      </div>
    </div>
  )
}
