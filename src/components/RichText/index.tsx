'use client'

import React, { useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  adWidgetId?: string     // Top in-article ad (before Continue Reading blur)
  adWidgetId2?: string    // Mid in-article ad (first ad in expanded section)
  adWidgetId3?: string    // Lower in-article ad (lower ad in expanded section)
  feedWidgetId?: string   // Feed widget
}

// Long article threshold: articles with this many paragraphs get additional in-article ads
const LONG_ARTICLE_THRESHOLD = 6

export const RichText = ({
  content,
  className,
  adWidgetId,
  adWidgetId2,
  adWidgetId3,
  feedWidgetId,
}: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  const primaryWidgetId =
    adWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1

  const secondaryWidgetId =
    adWidgetId2 || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2

  const tertiaryWidgetId =
    adWidgetId3 || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3

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

  // Count total paragraphs
  const totalParagraphs = nodes.filter((n: any) => n.type === 'paragraph').length
  const isLongArticle = totalParagraphs >= LONG_ARTICLE_THRESHOLD

  // ─── Injection point #1: top in-article ad (Ad Slot 1 - Above The Fold) ───
  // Inject Ad Slot 1 immediately at start of body text so it renders above the fold on mobile
  const firstInjectIndex = 0

  // ─── Post-ad text extension (show exactly 1 paragraph after top ad before Read More blur) ───
  let postAdIndex = 0
  let postCount = 0
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') postCount++
    if (postCount >= 1) {
      postAdIndex = i + 1
      break
    }
  }
  if (postAdIndex === 0) {
    postAdIndex = Math.min(1, nodes.length)
  }

  // ─── Injection point #2 in expanded section: Ad Slot 2 (Mid) ───
  let secondAdInjectIndex = -1
  let postExpandedCount = 0
  for (let i = postAdIndex; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') postExpandedCount++
    if (postExpandedCount >= 2) {
      secondAdInjectIndex = i + 1
      break
    }
  }

  // ─── Injection point #3 in expanded section: Ad Slot 3 / Feed (Lower) ───
  let thirdAdInjectIndex = -1
  if (isLongArticle) {
    let lowerCount = 0
    for (let i = postAdIndex; i < nodes.length; i++) {
      if (nodes[i].type === 'paragraph') lowerCount++
      if (lowerCount >= 5) {
        thirdAdInjectIndex = i + 1
        break
      }
    }
  }

  // ─── Assemble topElements (shown before "Continue Reading") ───
  const topElements: React.ReactNode[] = []
  topElements.push(
    <div key={`ad-inarticle-1-wrap`} className="my-2 w-full flex justify-center items-center">
      <AdskeeperWidget key={`ad-inarticle-1`} widgetId={primaryWidgetId} className="!my-0" />
    </div>
  )
  topElements.push(...serializeLexical(nodes.slice(0, postAdIndex), 'top-post'))

  // ─── Assemble bottomElements (shown when expanded) ───
  const bottomElements: React.ReactNode[] = []
  const remainingNodes = nodes.slice(postAdIndex)

  if (secondaryWidgetId && secondAdInjectIndex !== -1 && secondAdInjectIndex > postAdIndex) {
    // Has Mid Ad
    bottomElements.push(...serializeLexical(nodes.slice(postAdIndex, secondAdInjectIndex), 'bot-sec-pre'))
    bottomElements.push(
      <div key={`ad-inarticle-2-wrap`} className="my-4 w-full flex justify-center items-center">
        <AdskeeperWidget key={`ad-inarticle-2`} widgetId={secondaryWidgetId} className="!my-0" />
      </div>
    )

    if (tertiaryWidgetId && thirdAdInjectIndex !== -1 && thirdAdInjectIndex > secondAdInjectIndex) {
      // Has Lower Ad as well
      bottomElements.push(...serializeLexical(nodes.slice(secondAdInjectIndex, thirdAdInjectIndex), 'bot-tert-pre'))
      bottomElements.push(
        <div key={`ad-inarticle-3-wrap`} className="my-4 w-full flex justify-center items-center">
          <AdskeeperWidget key={`ad-inarticle-3`} widgetId={tertiaryWidgetId} className="!my-0" />
        </div>
      )
      bottomElements.push(...serializeLexical(nodes.slice(thirdAdInjectIndex), 'bot-rest'))
    } else {
      bottomElements.push(...serializeLexical(nodes.slice(secondAdInjectIndex), 'bot-sec-rest'))
    }
  } else {
    // Plain remaining content
    bottomElements.push(...serializeLexical(remainingNodes, 'bot-all'))
  }

  // ─── Collapsed state: teaser preview + Continue Reading button ───
  if (!isExpanded) {
    const teaserElement = bottomElements[0]

    return (
      <div className={`rich-text relative ${className || ''}`}>
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

        {/* Mobile touch-optimized Continue Reading button with 30px touch margin */}
        <div className="w-full flex justify-center pt-4 pb-6 mt-4 mb-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center justify-center gap-2.5 w-full max-w-[340px] py-3.5 px-8 rounded-full cursor-pointer font-bold text-base text-white transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#c0392b]"
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

  // ─── Expanded state: full article with phased ads ───
  return (
    <div className={`rich-text ${className || ''}`}>
      {topElements}
      {bottomElements}
    </div>
  )
}
