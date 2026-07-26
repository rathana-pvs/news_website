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

  // ─── Post-ad text extension (show exactly 1 readable paragraph after ad before button) ───
  let postAdIndex = firstInjectIndex
  let postCount = 0
  for (let i = firstInjectIndex; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') postCount++
    if (postCount >= 1) {
      postAdIndex = i + 1
      break
    }
  }
  if (postAdIndex === firstInjectIndex) {
    postAdIndex = Math.min(firstInjectIndex + 1, nodes.length)
  }

  // ─── Injection point #2: feed widget (long articles only) ───
  // Find a node index roughly in the middle of the article (after para 6-7)
  let feedInjectIndex = -1

  if (isLongArticle && resolvedFeedWidgetId) {
    const FEED_MIN_PARAGRAPH = 6
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
  // Contains: content before ad + in-article_1 widget + 1 readable paragraph after ad
  const topElements: React.ReactNode[] = []
  topElements.push(...serializeLexical(nodes.slice(0, firstInjectIndex), 'top-pre'))
  topElements.push(
    <AdskeeperWidget key={`ad-inarticle-1`} widgetId={primaryWidgetId} className="my-8" />
  )
  topElements.push(...serializeLexical(nodes.slice(firstInjectIndex, postAdIndex), 'top-post'))

  // ─── Assemble bottomElements (shown after "Continue Reading" expand) ───
  const bottomElements: React.ReactNode[] = []

  if (feedInjectIndex !== -1 && feedInjectIndex > postAdIndex) {
    // Long article: content → feed widget → remaining content
    bottomElements.push(...serializeLexical(nodes.slice(postAdIndex, feedInjectIndex), 'bot-mid'))
    bottomElements.push(
      <AdskeeperWidget
        key={`ad-feed-inline`}
        widgetId={resolvedFeedWidgetId!}
        adType="feed-inline"
        className="my-8"
      />
    )
    bottomElements.push(...serializeLexical(nodes.slice(feedInjectIndex), 'bot-rest'))
  } else {
    // Short article: remaining content only
    bottomElements.push(...serializeLexical(nodes.slice(postAdIndex), 'bot-all'))
  }

  // ─── Collapsed state: show teaser + Continue Reading button ───
  if (!isExpanded) {
    const teaserElement = bottomElements[0]

    return (
      <div className={`rich-text relative ${className || ''}`}>
        {topElements}

        {/* Teaser text (3 lines) with blur filter and gradient shading mask */}
        {teaserElement && (
          <div className="relative overflow-hidden h-[5.5rem] max-h-[90px] mt-4 mb-2 select-none pointer-events-none">
            <div className="blur-[1px] opacity-70 line-clamp-3">
              {teaserElement}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
          </div>
        )}

        {/* Simple, clean Continue Reading button */}
        <div className="w-full flex justify-center py-4 my-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg cursor-pointer font-bold text-sm text-white transition-all duration-200 active:scale-[0.98] shadow-md"
            style={{
              background: 'var(--accent-red)',
            }}
          >
            <span>Continue Reading</span>
            <svg
              className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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

