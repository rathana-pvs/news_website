'use client'

import React, { useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  adWidgetId?: string    // First mid-article ad (e.g. 2050530) — always injected
  feedWidgetId?: string  // Feed widget (e.g. 2050525) — injected on long articles only
}

// Long article threshold: articles with this many paragraphs get a mid-article feed widget
const LONG_ARTICLE_THRESHOLD = 8

export const RichText = ({ content, className, adWidgetId, feedWidgetId }: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  const primaryWidgetId =
    adWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1

  const resolvedFeedWidgetId =
    feedWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_FEED

  // If no primary ad configured or article is too short, render plain
  if (!primaryWidgetId || nodes.length < 2) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // Count total paragraphs to decide if this is a long article
  const totalParagraphs = nodes.filter((n: any) => n.type === 'paragraph').length
  const isLongArticle = totalParagraphs >= LONG_ARTICLE_THRESHOLD

  // ─── Injection point #1: in-article_1 ───
  // Find the node index right after MIN_FIRST_PARAGRAPH paragraphs
  const MIN_FIRST_PARAGRAPH = 1
  const AD_PARAGRAPH_GAP_1 = 2  // inject in-article_1 after para 2-3

  let firstInjectIndex = -1
  let paragraphCount = 0

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') paragraphCount++
    if (paragraphCount > MIN_FIRST_PARAGRAPH && paragraphCount >= MIN_FIRST_PARAGRAPH + AD_PARAGRAPH_GAP_1) {
      firstInjectIndex = i + 1
      break
    }
  }

  // Fallback: inject after node index 2 if no gap found
  if (firstInjectIndex === -1) {
    firstInjectIndex = Math.min(2, nodes.length - 1)
  }

  // ─── Injection point #2: feed widget (long articles only) ───
  // Find a node index roughly in the middle of the article (after para 5-6)
  let feedInjectIndex = -1

  if (isLongArticle && resolvedFeedWidgetId) {
    const FEED_MIN_PARAGRAPH = 5
    let pCount = 0
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].type === 'paragraph') pCount++
      if (pCount >= FEED_MIN_PARAGRAPH) {
        feedInjectIndex = i + 1
        break
      }
    }
  }

  // ─── Assemble topElements (shown before "Continue Reading") ───
  // Contains: content up to firstInjectIndex + in-article_1 widget
  const topElements: React.ReactNode[] = []
  topElements.push(...serializeLexical(nodes.slice(0, firstInjectIndex)))
  topElements.push(
    <AdskeeperWidget key={`ad-inarticle-1`} widgetId={primaryWidgetId} className="my-8" />
  )

  // ─── Assemble bottomElements (shown after "Continue Reading" expand) ───
  const bottomElements: React.ReactNode[] = []

  if (feedInjectIndex !== -1 && feedInjectIndex > firstInjectIndex) {
    // Long article: content → feed widget → remaining content
    bottomElements.push(...serializeLexical(nodes.slice(firstInjectIndex, feedInjectIndex)))
    bottomElements.push(
      <AdskeeperWidget
        key={`ad-feed-inline`}
        widgetId={resolvedFeedWidgetId!}
        adType="feed-inline"
        className="my-8"
      />
    )
    bottomElements.push(...serializeLexical(nodes.slice(feedInjectIndex)))
  } else {
    // Short article: remaining content only
    bottomElements.push(...serializeLexical(nodes.slice(firstInjectIndex)))
  }

  // ─── Collapsed state: show teaser + Continue Reading button ───
  if (!isExpanded) {
    const teaserElement = bottomElements[0]

    return (
      <div className={`rich-text relative ${className || ''}`}>
        {topElements}

        {/* Teaser text (1-2 lines) with blur filter and gradient shading mask */}
        {teaserElement && (
          <div className="relative overflow-hidden max-h-[75px] mt-4 mb-2 select-none pointer-events-none">
            <div className="blur-[1.5px] opacity-60 line-clamp-2">
              {teaserElement}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/75 to-[var(--bg-primary)]" />
          </div>
        )}

        {/* Continue Reading CTA — optimized for Facebook mobile traffic */}
        <div className="w-full flex flex-col items-center gap-2 pt-2 pb-8 mt-0">
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative w-full max-w-sm flex items-center justify-center gap-3 py-4 px-6 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #1877f2 0%, #0d5bbf 100%)',
              boxShadow: '0 4px 24px rgba(24,119,242,0.35)',
            }}
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-xl animate-ping opacity-10 bg-[#1877f2]" style={{ animationDuration: '2s' }} />

            {/* Chevron down icon */}
            <svg
              className="w-5 h-5 text-white flex-shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            <span className="flex flex-col items-start leading-none">
              <span className="text-white font-bold text-base tracking-wide">
                Continue Reading
              </span>
              <span className="text-white/70 text-[11px] font-medium mt-0.5 tracking-widest uppercase">
                Free · No Sign-up Required
              </span>
            </span>
          </button>

          {/* Reassurance label */}
          <p className="text-[11px] font-mono text-center" style={{ color: 'var(--text-muted)' }}>
            🔓 Full article · 100% free
          </p>
        </div>
      </div>
    )
  }

  // ─── Expanded state: full article ───
  return (
    <div className={`rich-text ${className || ''}`}>
      {topElements}
      {bottomElements}
    </div>
  )
}

