'use client'

import React, { useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  articleTitle?: string          // Main article title for deduplication
  adWidgetId?: string            // Top in-article ad (before Continue Reading blur)
  adWidgetId2?: string           // Mid in-article ad (first ad in expanded section)
  adWidgetId3?: string           // Lower in-article ad (lower ad in expanded section)
  underArticleWidgetId?: string  // Under-article native ad grid (rendered at end of expanded content)
  feedWidgetId?: string          // Feed widget
}

function extractNodeText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractNodeText).join(' ')
  }
  return ''
}

// Long article threshold: articles with this many paragraphs get additional in-article ads
const LONG_ARTICLE_THRESHOLD = 6

export const RichText = ({
  content,
  className,
  articleTitle,
  adWidgetId,
  adWidgetId2,
  adWidgetId3,
  underArticleWidgetId,
  feedWidgetId,
}: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const rawNodes = content.root?.children || []

  // Filter out any top nodes that duplicate articleTitle (checks top 3 blocks)
  let nodes = rawNodes
  if (articleTitle && rawNodes.length > 0) {
    const cleanTitle = articleTitle.trim().toLowerCase()
    const titlePrefix = cleanTitle.substring(0, Math.min(25, cleanTitle.length))
    nodes = rawNodes.filter((node: any, idx: number) => {
      if (idx >= 3) return true
      const text = extractNodeText(node).trim().toLowerCase()
      if (!text) return true
      if (
        text === cleanTitle || 
        (titlePrefix.length > 5 && text.startsWith(titlePrefix)) || 
        (text.length > 5 && cleanTitle.startsWith(text.substring(0, 25)))
      ) {
        return false
      }
      return true
    })
  }

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

  // Count total paragraphs and find exact paragraph boundary indices
  let paragraphCount = 0
  let p1EndIndex = nodes.length // index after paragraph 1
  let p2EndIndex = nodes.length // index after paragraph 2
  let p3EndIndex = nodes.length // index after paragraph 3

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') {
      paragraphCount++
      if (paragraphCount === 1) p1EndIndex = i + 1
      if (paragraphCount === 2) p2EndIndex = i + 1
      if (paragraphCount === 3) p3EndIndex = i + 1
    }
  }

  // ─── Assemble topElements (shown before "Continue Reading") ───
  const topElements: React.ReactNode[] = []
  topElements.push(...serializeLexical(nodes.slice(0, p1EndIndex), 'top-p1'))
  topElements.push(
    <div key={`ad-inarticle-1-wrap`} className="my-3 w-full flex justify-center items-center">
      <AdskeeperWidget key={`ad-inarticle-1`} widgetId={primaryWidgetId} className="!my-0" />
    </div>
  )

  // ─── Assemble bottomElements (shown when expanded) ───
  const bottomElements: React.ReactNode[] = []

  // Paragraph 2
  const p2Nodes = nodes.slice(p1EndIndex, p2EndIndex)
  if (p2Nodes.length > 0) {
    bottomElements.push(...serializeLexical(p2Nodes, 'bot-p2'))
    if (secondaryWidgetId) {
      bottomElements.push(
        <div key={`ad-inarticle-2-wrap`} className="my-4 w-full flex justify-center items-center">
          <AdskeeperWidget key={`ad-inarticle-2`} widgetId={secondaryWidgetId} className="!my-0" />
        </div>
      )
    }
  }

  // Paragraph 3
  const p3Nodes = nodes.slice(p2EndIndex, p3EndIndex)
  if (p3Nodes.length > 0) {
    bottomElements.push(...serializeLexical(p3Nodes, 'bot-p3'))
  }

  // Feed Ad Widget (2050525) placed right after P3 (replaces low-RPM Ad 3)
  if (resolvedFeedWidgetId) {
    bottomElements.push(
      <div key={`ad-feed-expanded-wrap`} className="my-4 w-full flex justify-center items-center">
        <AdskeeperWidget widgetId={resolvedFeedWidgetId} className="!my-0" />
      </div>
    )
  }

  // Paragraph 4 & Paragraph 5 (if present, rendered after Feed Ads)
  const restNodes = nodes.slice(p3EndIndex)
  if (restNodes.length > 0) {
    bottomElements.push(...serializeLexical(restNodes, 'bot-p4-p5'))
  }

  // Append Under Article Ad Grid if explicitly passed
  if (underArticleWidgetId) {
    bottomElements.push(
      <div key={`ad-under-article-wrap`} className="my-4 w-full flex justify-center items-center">
        <AdskeeperWidget widgetId={underArticleWidgetId} className="!my-0" />
      </div>
    )
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

        {/* Option 1 Chosen: Sleek Solid Red Pill Continue Reading CTA */}
        <div className="w-full flex justify-center pt-2 pb-3 mt-2 mb-1">
          <button
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full cursor-pointer font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg hover:brightness-110"
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
    <div className={`rich-text ${className || ''}`}>
      {topElements}
      {bottomElements}
    </div>
  )
}
