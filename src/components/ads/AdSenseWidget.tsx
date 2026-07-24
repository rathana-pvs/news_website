'use client'

import React, { useEffect, useRef } from 'react'

interface AdSenseWidgetProps {
  slotId: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  style?: React.CSSProperties
  className?: string
}

export default function AdSenseWidget({
  slotId,
  adFormat = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}: AdSenseWidgetProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2441454515104767'
  const isInitialized = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const adsbygoogle = (window as any).adsbygoogle || []
        // Push only once per component mount
        if (!isInitialized.current) {
          adsbygoogle.push({})
          isInitialized.current = true
        }
      } catch (err) {
        console.error('AdSense push error:', err)
      }
    }
  }, [slotId])

  return (
    <div className={`adsense-widget-container my-6 w-full flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
