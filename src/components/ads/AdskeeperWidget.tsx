'use client'

import { useEffect, useRef, useState } from 'react'

interface AdskeeperWidgetProps {
  widgetId: string
  className?: string
  adType?: 'sidebar' | 'feed-inline'
  onlyShowOn?: 'desktop' | 'mobile'
  placement?: string
}

// Simulated clickbait-style native advertisement mock data
const MOCK_ADS = [
  {
    id: 1,
    title: "The Actual Cost of Dental Implants in 2026 Might Surprise You",
    brand: "Dental Implants | Search Ads",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Unsold SUVs Are Being Cleared Out For Next to Nothing: View Deals!",
    brand: "SUV Deals | Auto News",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "15 Simple Tricks to Drastically Lower Your Electricity Bill This Month",
    brand: "SmartEnergy Tips",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "If You Need to Clean Your Ears, Stop Using Cotton Swabs Immediately",
    brand: "Health & Wellness Portal",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "The Most Beautiful Places on Earth You Can Visit for Under $50 a Day",
    brand: "Explorer Life",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Drivers Stunned: This Simple Device Can Save You Thousands on Repairs",
    brand: "Car Tech Labs",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    title: "Before You Retire, Try This 1 Simple Rule to Maximize Your Wealth",
    brand: "WealthGuard Financial",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    title: "This $49 Portable AC Cooler is Selling Out Fast Across the Country",
    brand: "ChillCool Tech",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
  }
]

function trackAdEvent(
  eventName: string,
  widgetId: string,
  placement: string,
  adType?: 'sidebar' | 'feed-inline'
) {
  window.gtag?.('event', eventName, {
    widget_id: widgetId,
    ad_placement: placement,
    ad_type: adType || 'native',
  })
}

export default function AdskeeperWidget({
  widgetId,
  className = '',
  adType,
  onlyShowOn,
  placement = 'unspecified',
}: AdskeeperWidgetProps) {
  const isDev = process.env.NODE_ENV === 'development'
  const containerRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const [filled, setFilled] = useState<boolean | null>(null) // null = pending
  const [isMatch, setIsMatch] = useState<boolean | null>(null)
  const requestedRef = useRef(false)
  const filledEventRef = useRef(false)
  const viewableEventRef = useRef(false)

  useEffect(() => {
    if (!onlyShowOn) {
      setIsMatch(true)
      return
    }

    const mq = window.matchMedia('(min-width: 1024px)')
    const checkVisibility = () => {
      if (onlyShowOn === 'desktop') {
        setIsMatch(mq.matches)
      } else if (onlyShowOn === 'mobile') {
        setIsMatch(!mq.matches)
      }
    }

    checkVisibility()
    mq.addEventListener('change', checkVisibility)
    return () => mq.removeEventListener('change', checkVisibility)
  }, [onlyShowOn])

  useEffect(() => {
    if (isMatch === false || isDev || !containerRef.current || !slotRef.current) return

    const el = containerRef.current
    const slotEl = slotRef.current

    const resizeObs = new ResizeObserver(() => {
      const h = slotEl.offsetHeight
      if (h > 0) {
        setFilled(true)
        if (!filledEventRef.current) {
          filledEventRef.current = true
          trackAdEvent('adskeeper_slot_filled', widgetId, placement, adType)
        }
        resizeObs.disconnect()
      }
    })
    resizeObs.observe(slotEl)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          if (!requestedRef.current) {
            requestedRef.current = true
            trackAdEvent('adskeeper_slot_requested', widgetId, placement, adType)
          }
          requestAnimationFrame(() => {
            try {
              window._mgq = window._mgq || []
              window._mgq.push(['_mgc.load'])
            } catch (e) {
              console.error('Adskeeper load error:', e)
            }
            setTimeout(() => {
              setFilled((prev) => {
                if (prev === null) {
                  resizeObs.disconnect()
                  trackAdEvent('adskeeper_slot_unfilled', widgetId, placement, adType)
                  return false // unfilled -> hide
                }
                return prev
              })
            }, 8000)
          })
        }
      },
      { rootMargin: '350px 0px' }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      resizeObs.disconnect()
    }
  }, [widgetId, isDev, isMatch, placement, adType])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !filled || viewableEventRef.current) return

    let viewabilityTimer: ReturnType<typeof setTimeout> | null = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!viewabilityTimer) {
            viewabilityTimer = setTimeout(() => {
              viewableEventRef.current = true
              trackAdEvent('adskeeper_slot_viewable', widgetId, placement, adType)
              observer.disconnect()
            }, 1000)
          }
        } else if (viewabilityTimer) {
          clearTimeout(viewabilityTimer)
          viewabilityTimer = null
        }
      },
      { threshold: [0, 0.5, 1] }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (viewabilityTimer) clearTimeout(viewabilityTimer)
    }
  }, [filled, widgetId, placement, adType])

  if (isMatch === null) return null
  if (isMatch === false) return null

  if (isDev) {
    const isSidebar = widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_SIDEBAR ||
                      ['2050538', '2043076'].includes(widgetId)
    const isUnderArticle = widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_UNDER_ARTICLE ||
                           ['2050535', '2043079'].includes(widgetId)
    const isInArticle = widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1 ||
                        widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2 ||
                        widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3 ||
                        ['2050530', '2050533', '2057448', '2043077', '2044156'].includes(widgetId)
    const isMobileAnchor = widgetId === process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_MOBILE_ANCHOR ||
                           widgetId === '2057449'

    if (adType === 'sidebar' || isSidebar) {
      return (
        <div className={`ads-container ${className}`}>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-30 block text-center mb-3">
            [Local Test Mode] Adskeeper Sidebar ({widgetId})
          </span>

          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-0">
            <span className="label-caps !text-[var(--text-primary)] text-[10px] tracking-[0.25em]">
              You Might Like
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Ad</span>
          </div>

          <div className="flex flex-col divide-y divide-[var(--border)]">
            {MOCK_ADS.slice(0, 5).map((ad) => (
              <article key={ad.id} className="group py-4 cursor-pointer">
                <div className="relative w-full overflow-hidden rounded mb-3" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3
                  className="font-card-title leading-snug line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors mb-2"
                  style={{ fontSize: '13px' }}
                >
                  {ad.title}
                </h3>
                <div
                  className="font-mono flex items-center gap-1.5"
                  style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}
                >
                  <span
                    className="uppercase font-bold px-1 py-0.5 rounded-sm"
                    style={{ background: 'var(--accent-red)', color: '#fff', fontSize: 8 }}
                  >
                    Ad
                  </span>
                  <span className="truncate">{ad.brand}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (isMobileAnchor) {
      return (
        <div className={`ads-container border border-dashed border-[var(--border)] bg-[var(--bg-card)] rounded p-2 text-center my-0 flex items-center justify-between gap-4 ${className}`} style={{ height: '70px', width: '100%', maxWidth: '400px' }}>
          <div className="flex items-center gap-2">
            <span className="uppercase text-[var(--accent-red)] font-bold text-[9px] px-1 py-0.5 rounded bg-[var(--accent-red-dim)]">Ad</span>
            <div className="text-left">
              <h3 className="font-card-title text-xs leading-tight text-[var(--text-primary)] line-clamp-1">
                Local Test Mobile Banner
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] leading-none">adskeeper.com/site/1103487</p>
            </div>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40">
            Sticky Anchor ({widgetId})
          </span>
        </div>
      )
    }

    if (adType === 'feed-inline') {
      return (
        <div className={`ads-container border border-dashed border-[var(--border)] bg-[var(--bg-card)] rounded-md p-3 sm:p-4 my-3 sm:my-6 ${className}`}>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
            <span className="label-caps !text-[var(--text-primary)] text-[10px] tracking-[0.25em]">Recommended For You</span>
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Recommended ({widgetId})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOCK_ADS.slice(0, 4).map((ad) => (
              <article key={ad.id} className="group cursor-pointer">
                <div className="relative w-full overflow-hidden rounded mb-2" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                </div>
                <h3 className="font-card-title leading-tight line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors" style={{ fontSize: '12px' }}>
                  {ad.title}
                </h3>
                <div className="font-mono flex items-center gap-1 mt-1" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                  <span className="text-[var(--accent-red)] font-bold">News</span>
                  <span>·</span>
                  <span className="truncate">{ad.brand}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (isInArticle) {
      return (
        <div className={`ads-container border border-dashed border-[var(--border)] bg-[var(--bg-card)] rounded-md p-3 sm:p-4 my-3 sm:my-6 ${className}`}>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 block text-center mb-2">
            [Local Test Mode] Adskeeper In-Article ({widgetId})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_ADS.slice(0, 2).map((ad) => (
              <article key={ad.id} className="group flex gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0 cursor-pointer transition-all">
                <div className="relative flex-shrink-0 overflow-hidden rounded" style={{ width: 100, height: 72 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-between min-w-0 py-0.5">
                  <h3 className="font-card-title leading-tight line-clamp-3 text-sm text-[var(--text-primary)]">
                    <span className="underline-hover pb-[2px]">{ad.title}</span>
                  </h3>
                  <div className="font-mono flex items-center gap-2 mt-1" style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    <span className="uppercase text-[var(--accent-red)] font-bold">News Wire</span>
                    <span>·</span>
                    <span className="truncate">{ad.brand}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (isUnderArticle) {
      return (
        <div className={`ads-container my-3 sm:my-6 ${className}`}>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
            <span className="label-caps !text-[var(--text-primary)] text-[10px] tracking-[0.25em]">
              Trending Around The Web
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Popular News</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MOCK_ADS.slice(3, 7).map((ad, idx) => (
              <article key={ad.id} className="group flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-md overflow-hidden hover:border-[var(--accent-red)] transition-all duration-300 cursor-pointer">
                <div className="relative w-full overflow-hidden bg-[var(--bg-card)]" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 flex flex-col justify-between flex-1">
                  <h3 className="font-card-title text-sm sm:text-base leading-snug line-clamp-3 text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors mb-2">
                    {ad.title}
                  </h3>
                  <div className="font-mono flex items-center gap-1.5 mt-auto pt-2 text-[9px] text-[var(--text-muted)] tracking-wider uppercase">
                    <span className="text-[var(--accent-red)] font-bold">News</span>
                    <span>·</span>
                    <span className="truncate max-w-[120px]">{idx % 2 === 0 ? '2 hours ago' : '4 hours ago'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className={`ads-container ${className}`}>
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-30 block text-center mb-2">
          [Local Test Mode] Adskeeper Feed Widget ({widgetId})
        </span>

        <div className="flex flex-col">
          {MOCK_ADS.map((ad) => (
            <article
              key={ad.id}
              className="group flex gap-4 py-3 cursor-pointer hover:bg-[var(--bg-surface)] transition-colors px-2 -mx-2 rounded"
            >
              <div
                className="relative flex-shrink-0 overflow-hidden rounded"
                style={{ width: 120, height: 80 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                <h3
                  className="font-card-title leading-snug line-clamp-3 text-[var(--text-primary)] group-hover:text-[var(--accent-red)] transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  {ad.title}
                </h3>
                <div
                  className="font-mono flex items-center gap-1.5 mt-2"
                  style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}
                >
                  <span
                    className="uppercase font-bold px-1 py-0.5 rounded-sm"
                    style={{ background: 'var(--accent-red)', color: '#fff', fontSize: 8 }}
                  >
                    Ad
                  </span>
                  <span className="truncate">{ad.brand}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (filled === false) return null

  return (
    <div
      ref={containerRef}
      className={`adskeeper-widget-container ${filled === null ? 'adskeeper-widget-pending' : ''} my-3 sm:my-6 w-full flex justify-center ${className}`}
      data-ad-placement={placement}
    >
      <div
        ref={slotRef}
        suppressHydrationWarning
        data-type="_mgwidget"
        data-widget-id={widgetId}
        style={{ width: '100%' }}
      />
    </div>
  )
}

declare global {
  interface Window {
    _mgq?: any[][]
    gtag?: (...args: any[]) => void
  }
}
