'use client'

import React, { useState, useEffect } from 'react'
import { useDocumentInfo, useFormFields, useForm, useFormModified } from '@payloadcms/ui'

export const ShareLink: React.FC = () => {
  const { id } = useDocumentInfo()
  const { submit } = useForm()
  const modified = useFormModified()
  const slugValue = useFormFields(([fields]) => fields.slug?.value)
  
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && slugValue) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      setShareUrl(`${siteUrl}/article/${slugValue}`)
    } else {
      setShareUrl('')
    }
  }, [slugValue])

  // Intercept Next.js navigation clicks
  useEffect(() => {
    // Only intercept if we are on a new unsaved document (no id) and form is modified
    if (!id && modified) {
      const handleGlobalClick = (event: MouseEvent) => {
        let element = event.target as HTMLElement | null
        while (element && element.tagName !== 'A') {
          element = element.parentElement
        }

        if (element) {
          const anchor = element as HTMLAnchorElement
          const currentUrl = window.location.href
          const newUrl = anchor.href

          const isDownload = anchor.download !== ''
          const isNewTab = anchor.target === '_blank' || event.metaKey || event.ctrlKey
          
          let isInternalAnchor = false
          try {
            const currentUrlObj = new URL(currentUrl)
            const newUrlObj = new URL(newUrl)
            isInternalAnchor = currentUrlObj.pathname === newUrlObj.pathname && 
                               currentUrlObj.search === newUrlObj.search && 
                               newUrlObj.hash !== ''
          } catch (e) {}

          const isPageLeaving = !(newUrl === currentUrl || isInternalAnchor || isDownload || isNewTab)

          if (isPageLeaving) {
            event.preventDefault()
            event.stopPropagation()
            setPendingUrl(newUrl)
            setShowConfirmModal(true)
          }
        }
      }

      document.addEventListener('click', handleGlobalClick, true)
      return () => {
        document.removeEventListener('click', handleGlobalClick, true)
      }
    }
  }, [id, modified])

  // Prevent page reloads / tab closes
  useEffect(() => {
    if (!id && modified) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault()
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return 'You have unsaved changes. Are you sure you want to leave?'
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [id, modified])

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleSaveDraftAndLeave = async () => {
    if (!submit) return
    try {
      setIsSaving(true)
      const result = await submit({ overrides: { status: 'draft' } })
      setIsSaving(false)
      if (result) {
        setShowConfirmModal(false)
        if (pendingUrl) {
          window.location.href = pendingUrl
        }
      } else {
        alert('Validation failed. Please check for required fields.')
      }
    } catch (err) {
      console.error(err)
      setIsSaving(false)
      alert('An error occurred while saving the draft.')
    }
  }

  const handleDiscardAndLeave = () => {
    setShowConfirmModal(false)
    if (pendingUrl) {
      window.location.href = pendingUrl
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setPendingUrl(null)
  }

  const modalElement = showConfirmModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--theme-elevation-100, #1c2128)',
        border: '1px solid var(--theme-border-color, #30363d)',
        borderRadius: '8px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)',
        fontFamily: 'var(--font-sans, sans-serif)',
        color: 'var(--theme-text-color, #f5f0e8)'
      }}>
        {isSaving ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#2085ec',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>Saving Draft...</h3>
            <p style={{ margin: 0, color: 'var(--theme-text-muted, #8b949e)', fontSize: '14px' }}>
              Please wait while we save your changes.
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display, Playfair Display, serif)'
            }}>
              Unsaved Changes
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: 'var(--theme-text-muted, #8b949e)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              You are leaving this page with unsaved content. Would you like to save it to drafts or discard it?
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: '1px solid var(--theme-border-color, #30363d)',
                  backgroundColor: 'var(--theme-elevation-150, #21262d)',
                  color: 'var(--theme-text-color, #f5f0e8)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDiscardAndLeave}
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: '1px solid #e74c3c',
                  backgroundColor: 'transparent',
                  color: '#e74c3c',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveDraftAndLeave}
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#2ecc71',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Save to Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (!id) {
    return (
      <>
        <div style={{
          padding: '16px',
          border: '1px solid var(--theme-border-color, #30363d)',
          borderRadius: '4px',
          backgroundColor: 'var(--theme-elevation-50, #161b22)',
          marginBottom: '20px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          color: 'var(--theme-text-muted, #8b949e)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--theme-text-color, #f5f0e8)' }}>
            Shareable Link
          </div>
          <p style={{ margin: 0 }}>Save the article to generate a shareable link.</p>
        </div>
        {modalElement}
      </>
    )
  }

  return (
    <>
      <div style={{
        padding: '16px',
        border: '1px solid var(--theme-border-color, #30363d)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-elevation-50, #161b22)',
        marginBottom: '20px',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--theme-text-color, #f5f0e8)' }}>
          Shareable Link
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            readOnly
            value={shareUrl || 'Generating...'}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid var(--theme-border-color, #30363d)',
              borderRadius: '4px',
              backgroundColor: 'var(--theme-input-bg, #0d1117)',
              color: 'var(--theme-text-color, #f5f0e8)',
              fontSize: '11px',
              textOverflow: 'ellipsis'
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--theme-border-color, #30363d)',
              borderRadius: '4px',
              backgroundColor: copied ? '#2ecc71' : 'var(--theme-elevation-150, #21262d)',
              color: copied ? '#ffffff' : 'var(--theme-text-color, #f5f0e8)',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'background-color 0.2s ease',
              fontSize: '11px',
              borderStyle: 'solid'
            }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--theme-border-color, #30363d)',
                borderRadius: '4px',
                backgroundColor: 'var(--theme-elevation-150, #21262d)',
                color: 'var(--theme-text-color, #f5f0e8)',
                fontWeight: 'bold',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'inline-block',
                fontSize: '11px'
              }}
            >
              View Article
            </a>
          )}
        </div>
      </div>
      {modalElement}
    </>
  )
}
