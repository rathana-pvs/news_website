'use client'

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
  // This ensures ads appear every ~3 actual paragraphs of reading content,
  // regardless of how many headings, images, or lists are interspersed.
  const AD_PARAGRAPH_GAP = 3   // inject an ad after every 3 paragraphs
  const MIN_FIRST_PARAGRAPH = 2 // skip the first 2 paragraphs before any ad
  const SKIP_TYPES = new Set(['h1', 'h2', 'h3', 'h4', 'upload', 'block', 'quote', 'horizontalrule'])

  const injectIndices: number[] = []
  let paragraphsSinceLastAd = 0
  let paragraphsTotal = 0

  for (let i = 0; i < nodes.length; i++) {
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

  // Assemble dynamic segments with ad widgets cycled in between
  const elements: React.ReactNode[] = []
  let lastIndex = 0

  injectIndices.forEach((injectIndex, adIndex) => {
    const segment = nodes.slice(lastIndex, injectIndex)
    elements.push(...serializeLexical(segment))

    const widgetId = inArticleWidgetIds[adIndex % inArticleWidgetIds.length]
    elements.push(
      <AdskeeperWidget key={`ad-${injectIndex}`} widgetId={widgetId} className="my-8" />
    )

    lastIndex = injectIndex
  })

  // Push remaining elements
  if (lastIndex < nodes.length) {
    const remainingSegment = nodes.slice(lastIndex)
    elements.push(...serializeLexical(remainingSegment))
  }

  return (
    <div className={`rich-text ${className || ''}`}>
      {elements}
    </div>
  )
}
