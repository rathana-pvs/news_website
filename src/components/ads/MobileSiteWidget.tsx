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
  const [armed, setArmed] = useState(false)
  const isArticlePage = pathname.startsWith('/article/')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const updateDevice = () => setIsMobile(mediaQuery.matches)

    updateDevice()
    mediaQuery.addEventListener('change', updateDevice)
    return () => mediaQuery.removeEventListener('change', updateDevice)
  }, [])

  // Show the sticky unit only once the reader has scrolled about one screen,
  // so it never covers the headline on arrival from Facebook. The slot is not
  // in the DOM before then, so earlier `_mgc.load` calls cannot pick it up.
  useEffect(() => {
    setArmed(false)
    if (!isArticlePage || !isMobile) return

    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.9) return
      setArmed(true)
      window.removeEventListener('scroll', onScroll)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isArticlePage, isMobile, pathname])

  useEffect(() => {
    if (!isArticlePage || !isMobile || !armed) return

    window._mgq = window._mgq || []
    window._mgq.push(['_mgc.load'])
    window.gtag?.('event', 'adskeeper_mobile_site_registered', {
      widget_id: widgetId,
      page_path: window.location.pathname,
      device_class: 'mobile',
    })
  }, [isArticlePage, isMobile, armed, pathname, widgetId])

  if (!isArticlePage || !isMobile || !armed) return null

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

