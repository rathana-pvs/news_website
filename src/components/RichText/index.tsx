'use client'

import React, { useEffect, useRef, useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'
import { GateVariant, gateVariantParam, getGateVariant, setGateTestEligible } from '@/lib/experiments'

export type RichTextProps = {
  content: any
  className?: string
  analyticsId?: string
  articleTitle?: string          // Main article title for deduplication
  adWidgetId?: string            // Top in-article ad (before Continue Reading blur)
  adWidgetId2?: string           // Mid in-article ad (after paragraph 4, before Continue Reading)
  adWidgetId3?: string           // Lower in-article ad (lower ad in expanded section)
}

function extractNodeText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractNodeText).join(' ')
  }
  return ''
}

/** Drop top blocks that repeat the article title (checks the first 3 blocks). */
function withoutTitleNodes(rawNodes: any[], articleTitle?: string) {
  if (!articleTitle || rawNodes.length === 0) return rawNodes
  const cleanTitle = articleTitle.trim().toLowerCase()
  const titlePrefix = cleanTitle.substring(0, Math.min(25, cleanTitle.length))
  return rawNodes.filter((node: any, idx: number) => {
    if (idx >= 3) return true
    const text = extractNodeText(node).trim().toLowerCase()
    if (!text) return true
    return !(
      text === cleanTitle ||
      (titlePrefix.length > 5 && text.startsWith(titlePrefix)) ||
      (text.length > 5 && cleanTitle.startsWith(text.substring(0, 25)))
    )
  })
}

// The gate sits right after the second ad (paragraph 4), as on the live site,
// so both early units are seen by every reader. Live articles are short
// (median 4 paragraphs), so it only shows when at least 2 paragraphs remain.
const GATE_AFTER = 4
const GATE_MIN_PARAGRAPHS = GATE_AFTER + 2

export const RichText = ({
  content,
  className,
  articleTitle,
  analyticsId,
  adWidgetId,
  adWidgetId2,
  adWidgetId3,
}: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  // null until mounted; the server always renders the gated version.
  const [variant, setVariant] = useState<GateVariant | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const progressEventsRef = useRef(new Set<number>())

  // Lexical content structure: { root: { children: [...] } }
  const nodes: any[] = withoutTitleNodes(content?.root?.children || [], articleTitle)

  const primaryWidgetId =
    adWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1

  const secondaryWidgetId =
    adWidgetId2 || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2

  const tertiaryWidgetId =
    adWidgetId3 || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3

  const paragraphCount = nodes.filter((n: any) => n.type === 'paragraph').length
  const gateEligible = !!primaryWidgetId && nodes.length >= 2 && paragraphCount >= GATE_MIN_PARAGRAPHS
  const showGate = gateEligible && variant !== 'no_gate'
  const fullyShown = !showGate || isExpanded
  const articleId = analyticsId || articleTitle || 'unknown'

  // Assign the visitor's group and record that they saw a test article.
  useEffect(() => {
    const v = getGateVariant()
    setVariant(v)
    setGateTestEligible(gateEligible)
    if (gateEligible) {
      window.gtag?.('event', 'read_more_test_exposure', {
        article_id: articleId,
        gate_variant: v,
        device_class: window.innerWidth < 1024 ? 'mobile' : 'desktop',
      })
    }
    return () => setGateTestEligible(undefined)
  }, [gateEligible, articleId])

  // Scroll-depth events, measured once the whole article is on the page.
  useEffect(() => {
    if (variant === null || !fullyShown) return

    let frame = 0
    const measureProgress = () => {
      frame = 0
      const element = contentRef.current
      if (!element || element.offsetHeight === 0) return

      const articleTop = element.getBoundingClientRect().top + window.scrollY
      const viewportBottom = window.scrollY + window.innerHeight
      const progress = Math.max(0, Math.min(100, ((viewportBottom - articleTop) / element.offsetHeight) * 100))

      for (const threshold of [25, 50, 75, 100]) {
        if (progress < threshold || progressEventsRef.current.has(threshold)) continue
        progressEventsRef.current.add(threshold)
        window.gtag?.('event', threshold === 100 ? 'article_complete' : `article_${threshold}_percent`, {
          article_id: articleId,
          gate_variant: gateVariantParam(),
          device_class: window.innerWidth < 1024 ? 'mobile' : 'desktop',
        })
      }
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measureProgress)
    }

    measureProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [variant, fullyShown, articleId])

  if (!content) return null

  // If no primary ad configured or article is too short, render plain
  if (!primaryWidgetId || nodes.length < 2) {
    return (
      <div ref={contentRef} className={`rich-text rich-text--complete ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // ─── Ad and "Continue Reading" placement ───
  // Set from the live articles (median 4 short paragraphs, ~134 words): an ad
  // goes in only when at least 2 paragraphs follow it, so short articles get
  // fewer units and the text is never just ads.
  const adSlots = [
    { after: 2, minParagraphs: 3, widgetId: primaryWidgetId, placement: 'article_inline_1' },
    { after: 4, minParagraphs: 6, widgetId: secondaryWidgetId, placement: 'article_inline_2' },
    { after: 8, minParagraphs: 10, widgetId: tertiaryWidgetId, placement: 'article_inline_3' },
  ].filter((slot) => slot.widgetId && paragraphCount >= slot.minParagraphs)

  const topElements: React.ReactNode[] = []
  const bottomElements: React.ReactNode[] = []
  let target = topElements
  let segment: any[] = []
  let segmentIndex = 0
  let seen = 0

  const flush = () => {
    if (segment.length === 0) return
    target.push(...serializeLexical(segment, `seg-${segmentIndex++}`))
    segment = []
  }

  for (const node of nodes) {
    segment.push(node)
    if (node.type !== 'paragraph') continue
    seen++

    const slot = adSlots.find((s) => s.after === seen)
    if (slot) {
      flush()
      target.push(
        <div key={`ad-${slot.placement}-wrap`} className="my-6 w-full">
          <AdskeeperWidget
            key={`ad-${slot.placement}`}
            widgetId={slot.widgetId as string}
            placement={slot.placement}
            className="!my-0"
          />
        </div>
      )
    }

    if (showGate && seen === GATE_AFTER) {
      flush()
      target = bottomElements
    }
  }
  flush()

  // ─── Collapsed state: teaser preview + Continue Reading button ───
  if (!fullyShown && bottomElements.length > 0) {
    const teaserElement = bottomElements[0]

    return (
      <div ref={contentRef} className={`rich-text relative ${className || ''}`}>
        {topElements}

        {/* Teaser text with blur filter and gradient shading mask */}
        {teaserElement && (
          <div className="relative overflow-hidden h-[5.5rem] max-h-[90px] mt-4 mb-3 select-none pointer-events-none">
            <div className="blur-[1.5px] opacity-75 line-clamp-3">
              {teaserElement}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
          </div>
        )}

        {/* Option 1 Chosen: Sleek Solid Red Pill Continue Reading CTA */}
        <div className="w-full flex justify-center pt-2 pb-3 mt-2 mb-1">
          <button
            onClick={() => {
              window.gtag?.('event', 'article_read_more_clicked', {
                article_id: articleId,
                gate_variant: gateVariantParam(),
                device_class: window.innerWidth < 1024 ? 'mobile' : 'desktop',
              })
              setIsExpanded(true)
            }}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 cursor-pointer font-semibold text-sm text-white transition-colors duration-200 hover:bg-[var(--accent-red-dark)]"
            style={{
              background: 'var(--accent-red)',
            }}
          >
            <span>Continue Reading</span>
            <svg
              className="w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ─── Expanded state: full article with phased ads ───
  return (
    <div ref={contentRef} className={`rich-text rich-text--complete ${className || ''}`}>
      {topElements}
      {bottomElements}
    </div>
  )
}
