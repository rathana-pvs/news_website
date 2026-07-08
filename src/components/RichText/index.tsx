'use client'

import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  adWidgetId?: string       // First mid-article ad (e.g. 2043077)
  secondAdWidgetId?: string // Second mid-article ad — MUST be a different widget
                            // ID from Adskeeper. If not provided, the second ad
                            // is skipped entirely (safe fallback).
}

/**
 * Finds the best injection index for a mid-article ad.
 * Rules:
 *  - Must be at or after `minIndex`
 *  - Must land on a real paragraph (not a heading, image, blockquote etc.)
 *  - Returns -1 if no suitable node is found (short articles get no mid-ad)
 */
function findInjectIndex(nodes: any[], minIndex: number): number {
  const BLOCK_TYPES = new Set(['h1', 'h2', 'h3', 'h4', 'upload', 'block', 'quote', 'horizontalrule'])
  for (let i = minIndex; i < nodes.length; i++) {
    if (!BLOCK_TYPES.has(nodes[i].type)) return i
  }
  return -1
}

export const RichText = ({ content, className, adWidgetId, secondAdWidgetId }: RichTextProps) => {
  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  // No ad widget requested or article too short to split — render plain
  if (!adWidgetId || nodes.length <= 4) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // ── First mid-article injection ──────────────────────────────────────────
  // Find the first real paragraph at or after index 4 (never land on a
  // heading or image which would look awkward above an ad unit).
  const firstInject = findInjectIndex(nodes, 4)

  // ── Second mid-article injection (long reads only) ───────────────────────
  // Requires BOTH: a dedicated secondAdWidgetId (different Adskeeper widget)
  // AND article length ≥ 13 nodes.
  const canShowSecond = !!secondAdWidgetId && nodes.length >= 13
  const secondInject = canShowSecond
    ? findInjectIndex(nodes, firstInject + 5)
    : -1

  // No good injection point found (e.g. article is all headings/images)
  if (firstInject === -1) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {serializeLexical(nodes)}
      </div>
    )
  }

  // Build segments: [before first ad] → [first ad] → [middle] → [second ad?] → [rest]
  const seg1 = nodes.slice(0, firstInject)
  const seg2 = secondInject !== -1 ? nodes.slice(firstInject, secondInject) : nodes.slice(firstInject)
  const seg3 = secondInject !== -1 ? nodes.slice(secondInject) : []

  return (
    <div className={`rich-text ${className || ''}`}>
      {serializeLexical(seg1)}

      {/* First mid-article ad — widget 2043077, after paragraph ~4 */}
      <AdskeeperWidget widgetId={adWidgetId} className="my-8" />

      {serializeLexical(seg2)}

      {/* Second mid-article ad — dedicated widget ID required.
          Skipped entirely if secondAdWidgetId is not provided. */}
      {secondInject !== -1 && secondAdWidgetId && (
        <>
          <AdskeeperWidget widgetId={secondAdWidgetId} className="my-8" />
          {serializeLexical(seg3)}
        </>
      )}
    </div>
  )
}
