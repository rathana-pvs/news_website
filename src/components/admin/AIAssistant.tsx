'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from '@payloadcms/ui'

interface AIResult {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  coverImage?: number | string
  scrapedImageUrl?: string
}

export const AIAssistant: React.FC = () => {
  const { dispatchFields } = useForm()
  
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState('')
  const [applied, setApplied] = useState<Record<string, boolean>>({})
  const [pulse, setPulse] = useState(true)
  const [scrapeUrlValue, setScrapeUrlValue] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scrapeUrlValue) return

    setStatus('loading')
    setError('')
    setResult(null)
    setApplied({})

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape_direct', url: scrapeUrlValue }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Something went wrong')
      }
      setResult(json.data)
      setStatus('success')
    } catch (err: any) {
      setError(err?.message || 'Failed to import. Try again.')
      setStatus('error')
    }
  }

  const convertTextToLexicalJson = (text: string) => {
    if (!text) return null
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)

    const children = paragraphs.map(paraText => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'text',
          text: paraText,
          format: 0,
          style: '',
          version: 1,
        },
      ],
      direction: 'ltr',
    }))

    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: children.length > 0 ? children : [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [],
            direction: 'ltr',
          }
        ],
        direction: 'ltr',
      },
    }
  }

  const applyField = (fieldName: string, value: any) => {
    if (fieldName === 'tags' && Array.isArray(value)) {
      dispatchFields({ type: 'UPDATE', path: 'tags', value: value.map((tag: string) => ({ tag })) })
    } else if (fieldName === 'metaTitle') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaTitle', value })
      dispatchFields({ type: 'UPDATE', path: 'meta.title', value })
    } else if (fieldName === 'metaDescription') {
      dispatchFields({ type: 'UPDATE', path: 'og.metaDescription', value })
      dispatchFields({ type: 'UPDATE', path: 'meta.description', value })
    } else if (fieldName === 'coverImage') {
      dispatchFields({ type: 'UPDATE', path: 'coverImage', value })
      dispatchFields({ type: 'UPDATE', path: 'og.ogImage', value })
      dispatchFields({ type: 'UPDATE', path: 'meta.image', value })
    } else if (fieldName === 'content' && typeof value === 'string') {
      const lexicalValue = convertTextToLexicalJson(value)
      dispatchFields({ type: 'UPDATE', path: 'content', value: lexicalValue, initialValue: lexicalValue })
    } else {
      dispatchFields({ type: 'UPDATE', path: fieldName, value })
    }
    setApplied(prev => ({ ...prev, [fieldName]: true }))
  }

  const isLoading = status === 'loading'

  if (!mounted) return null

  return createPortal(
    <>
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,106,247,0.6); }
          50% { box-shadow: 0 0 0 10px rgba(124,106,247,0); }
        }
        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ai-slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ai-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ai-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 999999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c6af7 0%, #2085ec 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(124,106,247,0.5);
        }
        .ai-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(124,106,247,0.7);
        }
        .ai-fab.pulse {
          animation: ai-pulse 1.8s ease-in-out infinite;
        }
        .ai-panel {
          position: fixed;
          bottom: 100px;
          right: 32px;
          z-index: 999998;
          width: 340px;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 16px;
          background: var(--theme-elevation-100, #1c2128);
          border: 1px solid rgba(124,106,247,0.3);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          animation: ai-slide-in 0.25s ease forwards;
        }
        .ai-panel::-webkit-scrollbar { width: 4px; }
        .ai-panel::-webkit-scrollbar-track { background: transparent; }
        .ai-panel::-webkit-scrollbar-thumb { background: rgba(124,106,247,0.4); border-radius: 4px; }
        .ai-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999997;
        }
        .import-btn {
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-radius: 6px;
          background: #7c6af7;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .import-btn:hover:not(:disabled) {
          background: #6558e0;
        }
        .import-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ai-apply-btn {
          width: 100%;
          padding: 7px 12px;
          border: none;
          border-radius: 6px;
          background: #7c6af7;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          font-family: inherit;
        }
        .ai-apply-btn:hover:not(:disabled) { background: #6558e0; }
        .ai-apply-btn:disabled { background: #2ecc71; cursor: default; }
        .ai-result { animation: ai-fade-in 0.3s ease forwards; }
        .ai-tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(124,106,247,0.15);
          border: 1px solid rgba(124,106,247,0.3);
          font-size: 10px;
          color: #a89bf5;
        }
      `}</style>

      {open && <div className="ai-backdrop" onClick={() => setOpen(false)} />}

      <button
        className={`ai-fab${pulse && !open ? ' pulse' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Direct Link Importer"
        type="button"
      >
        {open ? '✕' : '✨'}
      </button>

      {open && (
        <div className="ai-panel">
          <div style={{
            padding: '14px',
            borderBottom: '1px solid var(--theme-border-color, #30363d)',
            background: 'var(--theme-elevation-150, #21262d)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--theme-text-color, #f5f0e8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔌</span> Link Importer
              </div>
              <div style={{ fontSize: 9, color: 'var(--theme-text-muted, #8b949e)', marginTop: 2 }}>Scrapes & Auto-Populates Article Fields</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--theme-text-muted, #8b949e)',
                cursor: 'pointer', fontSize: 16, padding: 4, display: 'flex', alignItems: 'center',
              }}
            >✕</button>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--theme-text-muted, #8b949e)', lineHeight: 1.4 }}>
              Enter an article URL below to fetch and fill the title, content, cover image, excerpt, and tags.
            </p>

            <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="url"
                required
                placeholder="Paste article or blog link..."
                value={scrapeUrlValue}
                onChange={(e) => setScrapeUrlValue(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--theme-border-color, #30363d)',
                  background: 'var(--theme-elevation-200, #1c2128)',
                  color: 'var(--theme-text-color, #f5f0e8)',
                  fontSize: 11,
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                className="import-btn"
                disabled={isLoading || !scrapeUrlValue}
              >
                {isLoading ? (
                  <>
                    <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'ai-spin 0.7s linear infinite' }} />
                    Importing...
                  </>
                ) : 'Import Link'}
              </button>
            </form>

            {status === 'error' && (
              <div className="ai-result" style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(231,76,60,0.08)',
                border: '1px solid rgba(231,76,60,0.3)',
                fontSize: 11,
                color: '#e74c3c',
                lineHeight: 1.4,
              }}>
                ✕ {error}
              </div>
            )}

            {status === 'success' && result && (
              <div className="ai-result" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#2ecc71',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 0',
                }}>✅ Scraped — click to apply</div>

                {result.title && (
                  <ResultCard label="Title" value={result.title} applied={!!applied['title']} onApply={() => applyField('title', result.title)} />
                )}
                {result.coverImage && (
                  <ResultCard 
                    label="Cover Image" 
                    value={`Image imported to media library. ID: ${result.coverImage}`} 
                    applied={!!applied['coverImage']} 
                    onApply={() => applyField('coverImage', result.coverImage)} 
                    imageUrl={result.scrapedImageUrl}
                  />
                )}
                {result.excerpt && (
                  <ResultCard label="Excerpt" value={result.excerpt} applied={!!applied['excerpt']} onApply={() => applyField('excerpt', result.excerpt)} />
                )}
                {result.content && (
                  <ResultCard label="Article Content" value={result.content.substring(0, 160) + '...'} applied={!!applied['content']} onApply={() => applyField('content', result.content)} />
                )}
                {result.tags && (
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--theme-elevation-150, #21262d)', border: '1px solid var(--theme-border-color, #30363d)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-text-muted, #8b949e)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Tags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {result.tags.map((tag, i) => <span key={i} className="ai-tag">{tag}</span>)}
                    </div>
                    <button className="ai-apply-btn" disabled={!!applied['tags']} onClick={() => applyField('tags', result.tags)}>
                      {applied['tags'] ? '✓ Applied' : 'Apply Tags'}
                    </button>
                  </div>
                )}
                {result.metaTitle && (
                  <ResultCard label="SEO Meta Title" value={result.metaTitle} applied={!!applied['metaTitle']} onApply={() => applyField('metaTitle', result.metaTitle)} />
                )}
                {result.metaDescription && (
                  <ResultCard label="SEO Meta Description" value={result.metaDescription} applied={!!applied['metaDescription']} onApply={() => applyField('metaDescription', result.metaDescription)} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  )
}

function ResultCard({ label, value, applied, onApply, imageUrl }: {
  label: string; value: string; applied: boolean; onApply: () => void; imageUrl?: string
}) {
  return (
    <div style={{ padding: 12, borderRadius: 8, background: 'var(--theme-elevation-150, #21262d)', border: '1px solid var(--theme-border-color, #30363d)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-text-muted, #8b949e)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img 
          src={imageUrl} 
          alt={label} 
          style={{ width: '100%', height: 'auto', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8, border: '1px solid var(--theme-border-color, #30363d)' }} 
        />
      )}
      <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--theme-text-color, #f5f0e8)', lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</p>
      <button className="ai-apply-btn" disabled={applied} onClick={onApply}>
        {applied ? '✓ Applied' : `Apply ${label}`}
      </button>
    </div>
  )
}
