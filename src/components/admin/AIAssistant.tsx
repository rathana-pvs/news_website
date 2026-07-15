'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from '@payloadcms/ui'

export const AIAssistant: React.FC = () => {
  const { dispatchFields } = useForm()
  
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
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
      
      const data = json.data

      // Auto-apply fields to form
      if (data.title) {
        dispatchFields({ type: 'UPDATE', path: 'title', value: data.title })
        dispatchFields({ type: 'UPDATE', path: 'og.metaTitle', value: data.title })
        dispatchFields({ type: 'UPDATE', path: 'meta.title', value: data.title })
      }
      
      if (data.excerpt) {
        dispatchFields({ type: 'UPDATE', path: 'excerpt', value: data.excerpt })
        dispatchFields({ type: 'UPDATE', path: 'og.metaDescription', value: data.excerpt })
        dispatchFields({ type: 'UPDATE', path: 'meta.description', value: data.excerpt })
      }

      if (data.content) {
        const lexicalValue = convertTextToLexicalJson(data.content)
        dispatchFields({ type: 'UPDATE', path: 'content', value: lexicalValue, initialValue: lexicalValue })
      }

      if (data.coverImage) {
        dispatchFields({ type: 'UPDATE', path: 'coverImage', value: data.coverImage })
        dispatchFields({ type: 'UPDATE', path: 'og.ogImage', value: data.coverImage })
        dispatchFields({ type: 'UPDATE', path: 'meta.image', value: data.coverImage })
      }

      if (data.tags && Array.isArray(data.tags)) {
        dispatchFields({ type: 'UPDATE', path: 'tags', value: data.tags.map((tag: string) => ({ tag })) })
      }

      setStatus('success')
      setScrapeUrlValue('')
      
      // Close modal after brief success presentation
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
      }, 2000)
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

  const isLoading = status === 'loading'

  if (!mounted) return null

  return createPortal(
    <>
      <style>{`
        @keyframes ai-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46,204,113,0.6); }
          50% { box-shadow: 0 0 0 10px rgba(46,204,113,0); }
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
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(46,204,113,0.4);
        }
        .ai-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(46,204,113,0.6);
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
          border-radius: 16px;
          background: var(--theme-elevation-100, #1c2128);
          border: 1px solid rgba(46,204,113,0.3);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          animation: ai-slide-in 0.25s ease forwards;
        }
        .ai-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999997;
        }
      `}</style>

      {open && <div className="ai-backdrop" onClick={() => setOpen(false)} />}

      <button
        className={`ai-fab${pulse && !open ? ' pulse' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Direct Link Importer"
        type="button"
      >
        {open ? '✕' : '🔌'}
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
                disabled={isLoading || !scrapeUrlValue}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#2ecc71',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
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

            {status === 'success' && (
              <div className="ai-result" style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(46,204,113,0.08)',
                border: '1px solid rgba(46,204,113,0.3)',
                fontSize: 11,
                color: '#2ecc71',
                fontWeight: '500',
                textAlign: 'center',
              }}>
                ✓ Article fields populated!
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
