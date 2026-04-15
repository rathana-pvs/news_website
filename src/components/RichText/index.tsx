'use client'

import { serializeLexical } from './serialize'

export type RichTextProps = {
  content: any
  className?: string
}

export const RichText = ({ content, className }: RichTextProps) => {
  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  return (
    <div className={`rich-text ${className || ''}`}>
      {serializeLexical(nodes)}
    </div>
  )
}
