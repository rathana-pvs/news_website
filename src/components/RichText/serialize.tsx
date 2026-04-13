import React, { Fragment, JSX } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Node = {
  type: string
  value?: any
  text?: string
  children?: Node[]
  tag?: string
  format?: number | string
  metadata?: any
  [key: string]: any
}

export function serializeLexical(nodes: Node[]): JSX.Element[] {
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      let text = <Fragment key={i}>{node.text}</Fragment>

      if (node.format & 1) {
        text = <strong key={i}>{text}</strong>
      }
      if (node.format & 2) {
        text = <em key={i}>{text}</em>
      }
      if (node.format & 4) {
        text = <u key={i}>{text}</u>
      }
      if (node.format & 8) {
        text = <strike key={i}>{text}</strike>
      }
      if (node.format & 16) {
        text = <code key={i}>{text}</code>
      }

      return text as any
    }

    if (!node) {
      return null
    }

    const children = node.children ? serializeLexical(node.children) : null

    switch (node.type) {
      case 'h1':
        return (
          <h1 key={i} className="font-display font-bold text-4xl mb-6 mt-10" style={{ color: 'var(--text-primary)' }}>
            {children}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={i} className="font-display font-bold text-3xl mb-4 mt-10" style={{ color: 'var(--text-primary)' }}>
            {children}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={i} className="font-display font-bold text-2xl mb-4 mt-8" style={{ color: 'var(--text-primary)' }}>
            {children}
          </h3>
        )
      case 'h4':
        return (
          <h4 key={i} className="font-display font-bold text-xl mb-4 mt-6" style={{ color: 'var(--text-primary)' }}>
            {children}
          </h4>
        )
      case 'quote':
        return (
          <blockquote 
            key={i} 
            className="border-l-4 pl-6 py-2 my-8 italic text-xl leading-relaxed"
            style={{ borderColor: 'var(--accent-gold)', color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
          >
            {children}
          </blockquote>
        )
      case 'link':
        return (
          <Link
            key={i}
            href={node.fields?.url || ''}
            className="underline transition-colors hover:text-[var(--accent-gold)]"
            style={{ color: 'var(--accent-gold)' }}
          >
            {children}
          </Link>
        )
      case 'block':
        const block = node.fields
        if (!block || block.blockType !== 'videoEmbed') return null

        const embedUrl = block.url
        const ytId = embedUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1]

        return (
          <div key={i} className="my-10">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-video bg-black">
              <iframe
                src={ytId ? `https://www.youtube.com/embed/${ytId}` : embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {block.caption && (
              <p className="text-sm text-center mt-3 text-white/50 italic">{block.caption}</p>
            )}
          </div>
        )

      case 'upload':
        const media = node.value
        if (!media || node.relationTo !== 'media') return null
        
        const isVideo = media.mimeType?.startsWith('video/')

        if (isVideo) {
          return (
            <div key={i} className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-black">
              <video
                src={media.url || ''}
                controls
                className="w-full aspect-video"
                playsInline
              />
              {media.caption && (
                <div className="p-4 bg-muted/30">
                  <p className="text-sm text-white/70 italic font-serif">
                    {media.caption}
                  </p>
                </div>
              )}
            </div>
          )
        }

        return (
          <div key={i} className="my-10 relative rounded-xl overflow-hidden shadow-2xl border border-white/5 group">
            <Image
              src={media.url || ''}
              alt={media.alt || ''}
              width={media.width || 1200}
              height={media.height || 800}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
            {media.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-sm text-white/90 italic font-serif">
                  {media.caption}
                </p>
              </div>
            )}
          </div>
        )
      case 'embed':
      case 'youtube':
        const url = node.value || node.fields?.url
        if (!url) return null
        
        // Simple YouTube ID extraction
        const youtubeId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1]
        
        if (youtubeId) {
          return (
            <div key={i} className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
        }

        // Fallback for other iframes (Facebook, etc)
        // Note: Facebook embeds usually require their own SDK/Embed code, 
        // but if it's an iframe URL we can attempt to render it.
        return (
          <div key={i} className="my-10 rounded-xl overflow-hidden shadow-2xl border border-white/5 aspect-video bg-black">
             <iframe 
               src={url} 
               className="w-full h-full" 
               allowFullScreen 
             />
          </div>
        )

      case 'list':
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul'
        return (
          <ListTag 
            key={i} 
            className={`${node.tag === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 mb-6 space-y-2`} 
            style={{ color: 'var(--text-secondary)' }}
          >
            {children}
          </ListTag>
        )
      case 'listitem':
        return (
          <li key={i} className="leading-relaxed">
            {children}
          </li>
        )
      case 'horizontalrule':
        return (
          <hr key={i} className="my-10 border-t" style={{ borderColor: 'var(--border)' }} />
        )
      case 'paragraph':
      default:
        const hasBlockChild = node.children?.some((child) => 
          ['upload', 'block', 'embed', 'video', 'youtube', 'list', 'horizontalrule'].includes(child.type)
        )
        const Tag = hasBlockChild ? 'div' : 'p'
        
        return (
          <Tag 
            key={i} 
            className="mb-6 text-lg leading-relaxed text-justify"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Source Serif 4, serif' }}
          >
            {children}
          </Tag>
        )
    }
  }) as any
}
