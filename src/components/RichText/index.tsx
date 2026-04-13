import React from 'react'
import { serializeLexical } from './serialize'

export const RichText: React.FC<{ content: any; className?: string }> = ({ content, className }) => {
  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const nodes = content.root?.children || []

  return (
    <div className={`rich-text ${className || ''}`}>
      {serializeLexical(nodes)}
    </div>
  )
}
