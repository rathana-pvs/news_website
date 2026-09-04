'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface MobileSiteWidgetProps {
  widgetId: string
}

/**
 * Bootstrap container for Adskeeper's native Mobile Site Widget.
 * Position, delay, frequency capping, and dismissal are managed in Adskeeper.
 */
export function MobileSiteWidget({ widgetId }: MobileSiteWidgetProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const isArticlePage = pathname.startsWith('/article/')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const updateDevice = () => setIsMobile(mediaQuery.matches)

    updateDevice()
    mediaQuery.addEventListener('change', updateDevice)
    return () => mediaQuery.removeEventListener('change', updateDevice)
  }, [])

  useEffect(() => {
    if (!isArticlePage || !isMobile) return

    window._mgq = window._mgq || []
    window._mgq.push(['_mgc.load'])
    window.gtag?.('event', 'adskeeper_mobile_site_registered', {
      widget_id: widgetId,
      page_path: window.location.pathname,
      device_class: 'mobile',
    })
  }, [isArticlePage, isMobile, pathname, widgetId])

  if (!isArticlePage || !isMobile) return null

  return (
    <div
      data-type="_mgwidget"
      data-widget-id={widgetId}
      data-ad-placement="mobile_site_widget"
      suppressHydrationWarning
    />
  )
}

declare global {
  interface Window {
    _mgq?: any[][]
    gtag?: (...args: any[]) => void
  }
}

