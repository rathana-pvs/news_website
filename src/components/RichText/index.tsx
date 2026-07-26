'use client'

import React, { useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  adWidgetId?: string       // First mid-article ad (e.g. 2050530)
  secondAdWidgetId?: string // Second mid-article ad (e.g. 2050533)
  thirdAdWidgetId?: string  // Third mid-article ad (e.g. 2057448)
}

export const RichText = ({ content, className, adWidgetId, secondAdWidgetId, thirdAdWidgetId }: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  const inArticleWidgetIds = [
    adWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1,
    secondAdWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2,
    thirdAdWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_3
  ].filter(Boolean) as string[]

  // If no ads configured or article is too short, render plain
  if (inArticleWidgetIds.length === 0 || nodes.length <= 4) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // Find injection points by counting only PARAGRAPH nodes toward the gap.
  // We space out ads every ~4 paragraphs and require at least 2 initial paragraphs
  // to avoid ad clutter and improve viewability of each ad slot.
  const AD_PARAGRAPH_GAP = 4   // inject an ad after every 4 paragraphs
  const MIN_FIRST_PARAGRAPH = 2 // skip first 2 paragraphs before injecting first ad
  const MAX_ADS = 2            // cap max in-article ads per article

  const injectIndices: number[] = []
  let paragraphsSinceLastAd = 0
  let paragraphsTotal = 0

  for (let i = 0; i < nodes.length; i++) {
    if (injectIndices.length >= MAX_ADS) break
    const node = nodes[i]
    const isParagraph = node.type === 'paragraph'

    if (isParagraph) paragraphsTotal++

    // Never inject before we've seen MIN_FIRST_PARAGRAPH paragraphs
    if (paragraphsTotal <= MIN_FIRST_PARAGRAPH) continue

    if (isParagraph) {
      paragraphsSinceLastAd++
      // inject AFTER this paragraph if we've hit the gap
      if (paragraphsSinceLastAd >= AD_PARAGRAPH_GAP) {
        // inject right after this paragraph node (i + 1)
        const injectAt = i + 1
        if (injectAt < nodes.length) {
          injectIndices.push(injectAt)
          paragraphsSinceLastAd = 0
        }
      }
    }
  }

  // If no suitable injection point found, render plain
  if (injectIndices.length === 0) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // Assemble top elements (up to and including the first injected ad)
  const topElements: React.ReactNode[] = []
  const firstInjectIndex = injectIndices[0]
  const firstSegment = nodes.slice(0, firstInjectIndex)
  topElements.push(...serializeLexical(firstSegment))

  const firstWidgetId = inArticleWidgetIds[0 % inArticleWidgetIds.length]
  topElements.push(
    <AdskeeperWidget key={`ad-${firstInjectIndex}`} widgetId={firstWidgetId} className="my-8" />
  )

  // Assemble remaining elements
  const bottomElements: React.ReactNode[] = []
  let lastIndex = firstInjectIndex

  injectIndices.slice(1).forEach((injectIndex, index) => {
    const adIndex = index + 1 // offset by 1 because we sliced the first item
    const segment = nodes.slice(lastIndex, injectIndex)
    bottomElements.push(...serializeLexical(segment))

    const widgetId = inArticleWidgetIds[adIndex % inArticleWidgetIds.length]
    bottomElements.push(
      <AdskeeperWidget key={`ad-${injectIndex}`} widgetId={widgetId} className="my-8" />
    )

    lastIndex = injectIndex
  })

  // Push remaining elements
  if (lastIndex < nodes.length) {
    const remainingSegment = nodes.slice(lastIndex)
    bottomElements.push(...serializeLexical(remainingSegment))
  }

  if (!isExpanded) {
    const teaserElement = bottomElements[0]

    return (
      <div className={`rich-text relative ${className || ''}`}>
        {topElements}
        
        {/* Teaser element with gradient fade */}
        {teaserElement && (
          <div className="relative overflow-hidden max-h-[50px] mb-2 select-none pointer-events-none opacity-50">
            {teaserElement}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
          </div>
        )}
        
        {/* Read More button layout */}
        <div className="w-full flex justify-center items-center py-6 mt-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setIsExpanded(true)}
            className="px-12 py-3.5 rounded-md border border-[#c9a84c]/30 hover:border-[#c9a84c] bg-[#1c2128]/40 hover:bg-[#c9a84c]/10 text-[#c9a84c] font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Read More
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rich-text ${className || ''}`}>
      {topElements}
      {bottomElements}
    </div>
  )
}
