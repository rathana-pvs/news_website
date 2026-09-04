import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import * as cheerio from 'cheerio'

function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString()
  } catch {
    return relativeUrl
  }
}

interface RelatedNewsSource {
  title: string
  source: string
  url?: string
  snippet?: string
}

async function fetchRelatedNewsSources(headline: string): Promise<RelatedNewsSource[]> {
  try {
    const cleanQuery = headline
      .replace(/^(BREAKING|EXCLUSIVE|WATCH|UPDATE|JUST IN)[:\s-]+/i, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'make', 'makes', 'about', 'after', 'before', 'will', 'have'].includes(w.toLowerCase()))
      .slice(0, 6)
      .join(' ')

    if (!cleanQuery || cleanQuery.length < 4) return []

    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-US&gl=US&ceid=US:en`
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    })

    if (!res.ok) return []

    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    const sources: RelatedNewsSource[] = []

    $('item').slice(0, 3).each((_, el) => {
      const itemTitle = $(el).find('title').text().trim()
      const itemSource = $(el).find('source').text().trim() || 'News Wire'
      const rawDesc = $(el).find('description').text().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const itemUrl = $(el).find('link').text().trim()

      if (itemTitle && itemTitle.length > 10) {
        sources.push({
          title: itemTitle,
          source: itemSource,
          url: itemUrl,
          snippet: rawDesc
        })
      }
    })

    return sources
  } catch (err) {
    console.warn('[Related News Fetcher] Failed to query Google News RSS:', err)
    return []
  }
}

async function scrapeUrlDirectly(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.statusText} (${res.status})`)
  }
  const html = await res.text()
  const $ = cheerio.load(html)
  
  // 1. Extract Title
  let title = $('meta[property="og:title"]').attr('content') ||
              $('meta[name="twitter:title"]').attr('content') ||
              $('h1').first().text() ||
              $('title').text()
  title = title?.trim() || ''

  // 2. Extract Excerpt / Description
  let excerpt = $('meta[property="og:description"]').attr('content') ||
                $('meta[name="twitter:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                ''
  excerpt = excerpt.trim()

  // 3. Extract main content tags in order
  let container = $('article')
  if (container.length === 0) container = $('main')
  if (container.length === 0) container = $('[itemprop="articleBody"]')
  if (container.length === 0) {
    let maxP = 0
    let bestEl: any = null
    $('div, section').each((_, el) => {
      const pCount = $(el).find('> p').length
      if (pCount > maxP) {
        maxP = pCount
        bestEl = el
      }
    })
    if (bestEl) {
      container = $(bestEl)
    }
  }
  if (container.length === 0) {
    container = $('body')
  }

  const rawBlocks: any[] = []
  
  function traverse(element: any) {
    const tag = element.tagName?.toLowerCase()
    if (!tag) return

    // 1. Heading
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const text = $(element).text().trim()
      if (text.length > 3) {
        rawBlocks.push({
          type: 'heading',
          tag: tag === 'h1' ? 'h2' : tag,
          text
        })
      }
      return
    }

    // 2. Blockquote
    if (tag === 'blockquote') {
      const hasTwitterLink = $(element).find('a[href*="twitter.com"], a[href*="x.com"]').length > 0
      const isTwitter = $(element).hasClass('twitter-tweet') || hasTwitterLink
      if (isTwitter) {
        const tweetLink = $(element).find('a[href*="twitter.com"], a[href*="x.com"]').attr('href') || ''
        const text = $(element).text().trim()
        if (tweetLink) {
          rawBlocks.push({
            type: 'twitter',
            url: resolveUrl(url, tweetLink),
            text
          })
          return
        }
      }

      const text = $(element).text().trim()
      if (text.length > 5) {
        rawBlocks.push({
          type: 'quote',
          text
        })
      }
      return
    }

    // 3. List
    if (['ul', 'ol'].includes(tag)) {
      const items: string[] = []
      $(element).find('li').each((_, li) => {
        const liText = $(li).text().trim()
        if (liText) items.push(liText)
      })
      if (items.length > 0) {
        rawBlocks.push({
          type: 'list',
          tag,
          items
        })
      }
      return
    }

    // 4. Image
    if (tag === 'img') {
      const src = $(element).attr('src')
      const alt = $(element).attr('alt')?.trim() || ''
      if (src) {
        const resolved = resolveUrl(url, src)
        const lowerSrc = resolved.toLowerCase()
        if (
          resolved.startsWith('http') && 
          !lowerSrc.includes('avatar') && 
          !lowerSrc.includes('gravatar') && 
          !lowerSrc.includes('logo') && 
          !lowerSrc.includes('icon') && 
          !lowerSrc.includes('spinner') &&
          !lowerSrc.includes('loader') &&
          !lowerSrc.includes('pixel') &&
          !lowerSrc.includes('addec')
        ) {
          rawBlocks.push({
            type: 'image',
            src: resolved,
            alt: alt || 'Inline Image'
          })
        }
      }
      return
    }

    // 5. Iframe (Video)
    if (tag === 'iframe') {
      const src = $(element).attr('src')
      if (src) {
        const resolvedSrc = resolveUrl(url, src)
        let videoSource: 'youtube' | 'facebook' | 'other' = 'other'
        if (resolvedSrc.includes('youtube.com') || resolvedSrc.includes('youtu.be')) {
          videoSource = 'youtube'
        } else if (resolvedSrc.includes('facebook.com')) {
          videoSource = 'facebook'
        }
        
        if (videoSource !== 'other' || resolvedSrc.includes('embed') || resolvedSrc.includes('player')) {
          rawBlocks.push({
            type: 'video',
            url: resolvedSrc,
            source: videoSource
          })
        }
      }
      return
    }

    // 6. Native Video
    if (tag === 'video') {
      const src = $(element).attr('src') || $(element).find('source').attr('src')
      if (src) {
        rawBlocks.push({
          type: 'video',
          url: resolveUrl(url, src),
          source: 'other'
        })
      }
      return
    }

    // 7. Paragraph
    if (tag === 'p') {
      const text = $(element).text().trim()
      const lower = text.toLowerCase()
      if (
        text.length > 15 && 
        !lower.includes('cookie') && 
        !lower.includes('subscribe') && 
        !lower.includes('sign up') && 
        !lower.includes('newsletter') &&
        !lower.includes('privacy policy') &&
        !lower.includes('terms of service') &&
        !lower.includes('all rights reserved')
      ) {
        const links = $(element).find('a')
        if (links.length === 1 && text.length < 150) {
          const href = links.attr('href') || ''
          if (href.includes('twitter.com') || href.includes('x.com')) {
            if (href.includes('/status/')) {
              rawBlocks.push({
                type: 'twitter',
                url: resolveUrl(url, href),
                text
              })
              return
            }
          } else if (href.includes('youtube.com/watch') || href.includes('youtu.be/')) {
            rawBlocks.push({
              type: 'video',
              url: resolveUrl(url, href),
              source: 'youtube'
            })
            return
          }
        }

        const inlineChildren: any[] = []
        $(element).contents().each((_, child) => {
          if (child.type === 'text') {
            const txt = child.data
            if (txt) {
              inlineChildren.push({ type: 'text', text: txt })
            }
          } else if (child.type === 'tag') {
            const childTag = child.tagName.toLowerCase()
            const childText = $(child).text()
            if (childText) {
              if (childTag === 'a') {
                const href = $(child).attr('href')
                inlineChildren.push({
                  type: 'link',
                  text: childText,
                  url: href ? resolveUrl(url, href) : ''
                })
              } else if (['strong', 'b'].includes(childTag)) {
                inlineChildren.push({
                  type: 'text',
                  text: childText,
                  bold: true
                })
              } else if (['em', 'i'].includes(childTag)) {
                inlineChildren.push({
                  type: 'text',
                  text: childText,
                  italic: true
                })
              } else {
                inlineChildren.push({ type: 'text', text: childText })
              }
            }
          }
        })

        rawBlocks.push({
          type: 'paragraph',
          text,
          children: inlineChildren.length > 0 ? inlineChildren : [{ type: 'text', text }]
        })
      }
      return
    }

    $(element).children().each((_, child) => {
      traverse(child)
    })
  }

  container.children().each((_, el) => {
    traverse(el)
  })

  if (rawBlocks.filter(b => b.type === 'paragraph').length === 0) {
    $('p').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 20) {
        rawBlocks.push({
          type: 'paragraph',
          text,
          children: [{ type: 'text', text }]
        })
      }
    })
  }

  const cleanParagraphs = rawBlocks
    .filter(b => b.type === 'paragraph')
    .map(b => b.text.replace(/\s+/g, ' ').trim())
  
  const content = cleanParagraphs.slice(0, 30).join('\n\n')

  let tags: string[] = []
  const keywords = $('meta[name="keywords"]').attr('content')
  if (keywords) {
    tags = keywords.split(',').map(k => k.trim()).filter(k => k.length > 2 && k.length < 20).slice(0, 5)
  } else {
    tags = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['about', 'after', 'before', 'their', 'there', 'these', 'would', 'asian', 'dot'].includes(w))
      .slice(0, 4)
  }

  let scrapedImageUrl = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') ||
                        $('link[rel="image_src"]').attr('href') ||
                        ''
  
  if (scrapedImageUrl) {
    scrapedImageUrl = resolveUrl(url, scrapedImageUrl)
  } else {
    const articleImages = $('article img, main img, .content img, .post img, #content img')
    let foundImg = ''
    articleImages.each((_, el) => {
      const src = $(el).attr('src')
      if (src) {
        const resolved = resolveUrl(url, src)
        if (
          resolved.startsWith('http') && 
          !resolved.includes('avatar') && 
          !resolved.includes('gravatar') && 
          !resolved.includes('logo') && 
          !resolved.includes('icon') && 
          !resolved.includes('spinner') &&
          !resolved.includes('loader')
        ) {
          foundImg = resolved
          return false
        }
      }
    })
    
    if (!foundImg) {
      $('img').each((_, el) => {
        const src = $(el).attr('src')
        if (src) {
          const resolved = resolveUrl(url, src)
          if (
            resolved.startsWith('http') && 
            !resolved.includes('avatar') && 
            !resolved.includes('gravatar') && 
            !resolved.includes('logo') && 
            !resolved.includes('icon') && 
            !resolved.includes('spinner') &&
            !resolved.includes('loader')
          ) {
            foundImg = resolved
            return false
          }
        }
      })
    }
    scrapedImageUrl = foundImg
  }

  // Clean excerpt if it duplicates title at start (prevent mid-sentence cuts)
  if (title && excerpt) {
    const cleanT = title.trim().toLowerCase()
    const cleanE = excerpt.trim().toLowerCase()
    if (cleanE === cleanT || cleanE.length < 20) {
      excerpt = ''
    } else if (cleanE.startsWith(cleanT)) {
      const remaining = excerpt.trim().substring(title.length).replace(/^[\s:\-–—\.\,\!]+/, '').trim()
      if (remaining.length > 30 && /^[A-Z]/.test(remaining)) {
        excerpt = remaining
      } else {
        excerpt = ''
      }
    }
  }

  // Clean rawBlocks: remove top blocks that duplicate title
  if (title && rawBlocks.length > 0) {
    const cleanT = title.trim().toLowerCase()
    const prefix = cleanT.substring(0, Math.min(25, cleanT.length))
    const filteredBlocks = rawBlocks.filter((block: any, idx: number) => {
      if (idx >= 3) return true
      const bText = (block.text || '').trim().toLowerCase()
      if (!bText) return true
      if (
        bText === cleanT || 
        (prefix.length > 5 && bText.startsWith(prefix)) || 
        (bText.length > 5 && cleanT.startsWith(bText.substring(0, 25)))
      ) {
        return false
      }
      return true
    })
    rawBlocks.length = 0
    rawBlocks.push(...filteredBlocks)
  }

  const metaTitle = title.endsWith(' - Asian Dot') ? title : `${title.substring(0, 45)} - Asian Dot`
  const finalExcerpt = excerpt || (content.length > 180 ? content.substring(0, 180) + '...' : content)
  const metaDescription = finalExcerpt || (content.length > 140 ? content.substring(0, 140) + '...' : content)

  return {
    title,
    content,
    excerpt: finalExcerpt,
    tags,
    metaTitle,
    metaDescription,
    scrapedImageUrl,
    blocks: rawBlocks,
  }
}

function buildLexicalJson(blocks: any[]): any {
  const children = blocks.map(block => {
    if (block.type === 'paragraph') {
      // Defensive: if block has no children array, build one from text field
      const blockChildren = Array.isArray(block.children) && block.children.length > 0
        ? block.children
        : [{ type: 'text', text: block.text || '' }]
      return {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: blockChildren.map((child: any) => {
          if (child.type === 'link') {
            return {
              type: 'link',
              version: 2,
              fields: {
                url: child.url,
                newTab: true,
                linkType: 'custom'
              },
              format: '',
              indent: 0,
              children: [
                {
                  type: 'text',
                  text: child.text,
                  format: 0,
                  style: '',
                  version: 1
                }
              ],
              direction: 'ltr'
            }
          } else {
            let format = 0
            if (child.bold) format |= 1
            if (child.italic) format |= 2
            return {
              type: 'text',
              text: child.text,
              format,
              style: '',
              version: 1
            }
          }
        }),
        direction: 'ltr'
      }
    }
    
    if (block.type === 'heading') {
      return {
        type: 'heading',
        tag: block.tag,
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: block.text,
            format: 0,
            style: '',
            version: 1
          }
        ],
        direction: 'ltr'
      }
    }
    
    if (block.type === 'quote') {
      return {
        type: 'quote',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text: block.text,
            format: 0,
            style: '',
            version: 1
          }
        ],
        direction: 'ltr'
      }
    }
    
    if (block.type === 'list') {
      return {
        type: 'list',
        tag: block.tag === 'ol' ? 'ol' : 'ul',
        format: '',
        indent: 0,
        version: 1,
        children: block.items.map((itemText: string) => ({
          type: 'listitem',
          version: 1,
          format: '',
          indent: 0,
          value: -1,
          children: [
            {
              type: 'text',
              text: itemText,
              format: 0,
              style: '',
              version: 1
            }
          ],
          direction: 'ltr'
        })),
        direction: 'ltr'
      }
    }
    
    if (block.type === 'image') {
      if (!block.mediaId) return null
      return {
        type: 'upload',
        version: 1,
        relationTo: 'media',
        value: block.mediaId,
        format: '',
        indent: 0,
        children: []
      }
    }
    
    if (block.type === 'video') {
      return {
        type: 'block',
        version: 2,
        format: '',
        indent: 0,
        fields: {
          id: `block-${Math.random().toString(36).substring(2, 11)}`,
          blockType: 'videoEmbed',
          source: block.source,
          url: block.url,
          caption: block.caption || ''
        }
      }
    }
    
    if (block.type === 'twitter') {
      return {
        type: 'block',
        version: 2,
        format: '',
        indent: 0,
        fields: {
          id: `block-${Math.random().toString(36).substring(2, 11)}`,
          blockType: 'twitterEmbed',
          url: block.url,
          tweetText: block.tweetText || block.text || '',
          author: block.author || '',
          authorHandle: block.authorHandle || '',
          date: block.date || ''
        }
      }
    }
    
    return null
  }).filter(Boolean)
  
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
          direction: 'ltr'
        }
      ],
      direction: 'ltr'
    }
  }
}

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const PRIMARY_MODEL_ID = 'gemini-3.5-flash-lite'
const FALLBACK_MODEL_ID = 'gemini-2.5-flash'

const primaryModel = googleAI(PRIMARY_MODEL_ID)
const fallbackModel = googleAI(FALLBACK_MODEL_ID)

// GET /api/ai/assist — health check both models
export async function GET(req: NextRequest) {
  const results: Record<string, { ok: boolean; response?: string; error?: string }> = {}

  for (const [name, model] of [
    [PRIMARY_MODEL_ID, primaryModel],
    [FALLBACK_MODEL_ID, fallbackModel],
  ] as [string, any][]) {
    try {
      const res = await generateText({
        model,
        prompt: 'Reply with exactly: OK',
        maxOutputTokens: 5,
      })
      results[name] = { ok: true, response: res.text.trim() }
    } catch (e: any) {
      results[name] = { ok: false, error: e?.message || 'Unknown error' }
    }
  }

  const allOk = Object.values(results).every(r => r.ok)
  return NextResponse.json({ allOk, models: results }, { status: allOk ? 200 : 500 })
}

const SYSTEM_PROMPT = `You are an expert news editor and content writer for Asian Dot, a reputable English-language news website covering Asia-Pacific regional news, politics, business, culture, and technology.

Your writing style is:
- Professional, clear, and authoritative
- Neutral and objective (journalistic tone)
- Engaging and reader-friendly
- Concise yet informative

Always respond with valid JSON only. No markdown, no explanations outside the JSON.`

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, title, content, url } = await req.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    if (action === 'scrape_direct') {
      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
      }

      const result = await scrapeUrlDirectly(url) as any
      const blocks = result.blocks || []

      // 1. Download cover image
      if (result.scrapedImageUrl) {
        try {
          const imageRes = await fetch(result.scrapedImageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          })
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
            let ext = contentType.split('/')[1] || 'jpg'
            ext = ext.split(';')[0].trim()
            const filename = `scraped-${Date.now()}.${ext}`
            
            const mediaDoc = await payload.create({
              collection: 'media',
              data: {
                alt: result.title || 'Scraped Image',
              },
              file: {
                data: buffer,
                name: filename,
                mimetype: contentType,
                size: buffer.length,
              }
            })
            result.coverImage = mediaDoc.id
          } else {
            throw new Error(`Failed to fetch cover image: Status ${imageRes.status}`)
          }
        } catch (imgErr) {
          console.error('Failed to download scraped cover image, trying external fallback:', imgErr)
          try {
            const mediaDoc = await payload.create({
              collection: 'media',
              data: {
                alt: result.title || 'Scraped Image',
                source: 'external',
                externalUrl: result.scrapedImageUrl
              }
            })
            result.coverImage = mediaDoc.id
          } catch (extErr) {
            console.error('Failed to create external cover image fallback:', extErr)
          }
        }
      }

      // 2. Download inline images
      for (const block of blocks) {
        if (block.type === 'image' && block.src) {
          try {
            const imageRes = await fetch(block.src, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            })
            if (imageRes.ok) {
              const arrayBuffer = await imageRes.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
              let ext = contentType.split('/')[1] || 'jpg'
              ext = ext.split(';')[0].trim()
              const filename = `scraped-inline-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`
              
              const mediaDoc = await payload.create({
                collection: 'media',
                data: {
                  alt: block.alt || result.title || 'Scraped Inline Image',
                },
                file: {
                  data: buffer,
                  name: filename,
                  mimetype: contentType,
                  size: buffer.length,
                }
              })
              block.mediaId = mediaDoc.id
            } else {
              throw new Error(`Failed to fetch inline image: Status ${imageRes.status}`)
            }
          } catch (imgErr) {
            console.error('Failed to download inline image, trying external fallback:', block.src, imgErr)
            try {
              const mediaDoc = await payload.create({
                collection: 'media',
                data: {
                  alt: block.alt || result.title || 'Scraped Inline Image',
                  source: 'external',
                  externalUrl: block.src
                }
              })
              block.mediaId = mediaDoc.id
            } catch (extErr) {
              console.error('Failed to create external inline image fallback:', extErr)
            }
          }
        }

        // 3. Resolve Twitter/X embeds using the public oEmbed API
        if (block.type === 'twitter' && block.url) {
          try {
            const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(block.url)}&omit_script=true`
            const embedRes = await fetch(oEmbedUrl)
            if (embedRes.ok) {
              const embedData = await embedRes.json()
              block.author = embedData.author_name || ''
              block.authorHandle = embedData.author_url ? '@' + embedData.author_url.split('/').pop() : '@x'
              
              if (embedData.html) {
                const tweet$ = cheerio.load(embedData.html)
                block.tweetText = tweet$('p').text().trim() || block.text
                block.date = tweet$('a').last().text().trim()
              }
            }
          } catch (tweetErr) {
            console.error('Failed to fetch Twitter oEmbed info:', tweetErr)
          }
          if (!block.tweetText) {
            block.tweetText = block.text || 'Twitter content'
          }
        }
      }

      // 4. Deduplicate: remove inline images that are the same as the cover image.
      //    Check by mediaId (same Payload media record) AND by original src URL (catches
      //    cases where the same image was downloaded into two separate media records).
      const coverMediaId = result.coverImage
      const coverSrc = result.scrapedImageUrl

      const dedupedBlocks = blocks.filter((block: any) => {
        if (block.type !== 'image') return true

        // Remove if same Payload media ID as cover
        if (coverMediaId && block.mediaId && String(block.mediaId) === String(coverMediaId)) {
          return false
        }

        // Remove if same original URL as cover (even if downloaded as a different media record)
        if (coverSrc && block.src && block.src === coverSrc) {
          return false
        }

        return true
      })

      // Helper to extract text from block whether it uses b.text or b.children
      const extractBlockText = (b: any): string => {
        if (!b) return ''
        if (typeof b.text === 'string') return b.text
        if (b.children && Array.isArray(b.children)) {
          return b.children.map((c: any) => c.text || extractBlockText(c)).join(' ')
        }
        return ''
      }

      // 5. Transform raw blocks into AsianDot Custom Mobile Editorial Format using Gemini 3.6 Flash
      let rawText = dedupedBlocks
        .filter((b: any) => b.type === 'paragraph' || b.type === 'heading')
        .map((b: any) => extractBlockText(b))
        .filter(Boolean)
        .join('\n\n')

      // Universal Fallback: If block extraction yields short text, use raw scraped content string
      if ((!rawText || rawText.length < 50) && typeof result.content === 'string') {
        rawText = result.content
      }

      if (rawText && rawText.length > 50) {
        try {
          // 4.5. Multi-Source Discovery: Fetch complementary news coverage from Google News RSS
          const relatedSources = await fetchRelatedNewsSources(result.title)
          const relatedContext = relatedSources && relatedSources.length > 0
            ? relatedSources.map((s, i) => `Source ${i + 1} (${s.source}): "${s.title}" — Summary/Snippet: ${s.snippet}`).join('\n')
            : 'No secondary news feeds discovered.'

          // 4.6. Fetch available categories for intelligent auto-classification
          const categoriesRes = await payload.find({ collection: 'categories', limit: 50 })
          const categoryList = categoriesRes.docs.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
          const categoryOptions = categoryList.map((c: any) => c.name).join(', ')

          const aiResponse = await generateText({
            model: primaryModel,
            system: SYSTEM_PROMPT,
            prompt: `You are the lead editor at Asian Dot, an independent news publication. Synthesize the provided primary news report and complementary sources into an authoritative, in-depth news article.

PRIMARY ARTICLE HEADLINE: "${result.title}"
PRIMARY ARTICLE CONTENT:
"${rawText.substring(0, 3500)}"

COMPLEMENTARY NEWS COVERAGE (FOR MULTI-PERSPECTIVE FACT CHECKING, BACKGROUND & CITATION):
${relatedContext}

RULES FOR ASIANDOT MULTI-SOURCE EDITORIAL FORMAT:
1. TOTAL WORD COUNT: The ENTIRE article content body MUST be between 300 and 450 words total.
2. DO NOT duplicate the article title in the body.
3. DO NOT include any markdown headers (no ## or ###). Write only clean, cohesive paragraphs separated by blank lines.
4. PARAGRAPH STRUCTURE: Write 6 to 8 paragraphs:
   - Paragraphs 1-2 (The Breaking Lead): Report the core factual developments clearly with key figures, dates, locations, and actions.
   - Paragraphs 3-4 (Background Context & History): Provide essential historical context, prior related events, and timeline explaining how this situation developed.
   - Paragraphs 5-6 (Official Statements & Journalistic Attribution): Synthesize official reactions, government filings, or verified reporting (e.g. "According to reports first corroborated by...", "Agency officials stated...").
   - Paragraphs 7-8 (Broader Geopolitical & Regional Impact): Explain what this means for national or international policy, and what developments or proceedings are expected next.
5. 100% ORIGINAL SYNTHESIS: Synthesize all facts into an original, analytical journalistic narrative. NEVER copy verbatim sentences from any single source to ensure full copyright independence.
6. LEAD EXCERPT: Write a COMPLETE, punchy summary sentence strictly between 120 and 160 characters long. It MUST be a complete, grammatically sound sentence ending with a period.
7. CATEGORY CLASSIFICATION: Choose the single best category for this story from this list: [${categoryOptions}].

Return valid JSON in this exact format:
{
  "title": "Clean, punchy news title",
  "category": "One of [${categoryOptions}]",
  "excerpt": "A punchy, complete lead summary sentence strictly under 160 characters.",
  "content": "Paragraph 1 text\\n\\nParagraph 2 text\\n\\nParagraph 3 text\\n\\nParagraph 4 text\\n\\nParagraph 5 text\\n\\nParagraph 6 text",
  "metaTitle": "SEO title under 60 chars - Asian Dot",
  "metaDescription": "SEO description between 100 and 150 chars"
}`,
          })

          const cleanJsonText = aiResponse.text.replace(/```json\n?|\n?```/g, '').trim()
          const aiData = JSON.parse(cleanJsonText)

          if (aiData.title) result.title = aiData.title
          if (aiData.excerpt) result.excerpt = aiData.excerpt
          if (aiData.metaTitle) result.metaTitle = aiData.metaTitle
          if (aiData.metaDescription) result.metaDescription = aiData.metaDescription

          // Auto-assign matched category
          if (aiData.category && categoryList.length > 0) {
            const chosen = (aiData.category || '').toLowerCase().trim()
            const matched = categoryList.find((c: any) =>
              c.name.toLowerCase() === chosen ||
              c.slug.toLowerCase() === chosen ||
              chosen.includes(c.name.toLowerCase()) ||
              chosen.includes(c.slug.toLowerCase())
            ) || categoryList[0]

            if (matched) {
              result.category = matched.id
              result.categoryName = matched.name
            }
          }
          result.isFeatured = true

          if (aiData.content) {
            const formattedParagraphs = aiData.content.split('\n\n')
            const formattedBlocks: any[] = []

            for (const p of formattedParagraphs) {
              const trimmed = p.trim()
              if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
                formattedBlocks.push({
                  type: 'heading',
                  tag: 'h2',
                  text: trimmed.replace(/^#+\s*/, '')
                })
              } else if (trimmed.length > 0) {
                formattedBlocks.push({
                  type: 'paragraph',
                  text: trimmed
                })
              }
            }

            // Re-attach non-text media blocks (inline images/embeds)
            const mediaBlocks = dedupedBlocks.filter((b: any) => b.type !== 'paragraph' && b.type !== 'heading')
            formattedBlocks.push(...mediaBlocks)

            result.content = buildLexicalJson(formattedBlocks)
          } else {
            result.content = buildLexicalJson(dedupedBlocks)
          }
        } catch (aiErr) {
          console.warn('AsianDot AI formatting fallback to raw scraped blocks:', aiErr)
          result.content = buildLexicalJson(dedupedBlocks)
        }
      } else {
        result.content = buildLexicalJson(dedupedBlocks)
      }

      delete result.blocks

      const enforced = enforceSeoLimits(result)
      return NextResponse.json({ success: true, data: enforced })
    }

    let prompt = ''

    switch (action) {
      case 'full':
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        prompt = `Write an authoritative, in-depth news article for Asian Dot. Title: "${title}"

RULES:
1. Do NOT repeat the title in the body.
2. DO NOT include any H2 or H3 subheadings. Write clean, cohesive paragraphs separated by double line breaks.
3. TOTAL WORD COUNT: The ENTIRE article content body MUST be between 300 and 450 words total.
4. Structure: Write 6 to 8 paragraphs covering The Breaking Lead, Background History & Context, Key Statements & Quotations, and Geopolitical Significance/Next Steps.
5. Write a punchy lead excerpt (a complete, grammatically sound sentence strictly under 160 characters ending with a period).

Return JSON in this exact format:
{
  "content": "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.\n\nParagraph 4.\n\nParagraph 5.\n\nParagraph 6.",
  "excerpt": "A complete, punchy lead summary strictly under 160 characters.",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "SEO optimized title, strictly between 50 and 60 characters long (including ' - Asian Dot' suffix)",
  "metaDescription": "SEO meta description, strictly between 100 and 150 characters long"
}`
        break

      case 'content_only':
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        prompt = `Write an authoritative, in-depth news article for Asian Dot. Title: "${title}"

RULES:
1. Do NOT repeat the title in the body.
2. DO NOT include any H2 or H3 subheadings. Write clean, cohesive paragraphs separated by double line breaks.
3. TOTAL WORD COUNT: The ENTIRE article content body MUST be between 300 and 450 words total across 6 to 8 paragraphs.

Return JSON in this exact format:
{
  "content": "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.\n\nParagraph 4.\n\nParagraph 5.\n\nParagraph 6.",
  "excerpt": "A complete, punchy lead summary strictly under 160 characters."
}`
        break

      case 'seo_only':
        if (!title && !content) return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
        prompt = `Generate excerpt and SEO metadata for this news article:
Title: "${title || ''}"
Content snippet: "${content ? content.substring(0, 500) : ''}"

Return JSON in this exact format:
{
  "excerpt": "A punchy summary of the article strictly under 160 characters.",
  "metaTitle": "SEO optimized title, strictly between 50 and 60 characters long (including ' - Asian Dot' suffix)",
  "metaDescription": "SEO meta description, strictly between 100 and 150 characters long"
}`
        break

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    let text = ''
    try {
      const response = await generateText({
        model: primaryModel,
        system: SYSTEM_PROMPT,
        prompt,
      })
      text = response.text
    } catch (e: any) {
      console.warn(`Primary model (${PRIMARY_MODEL_ID}) failed, falling back to ${FALLBACK_MODEL_ID}:`, e)
      const response = await generateText({
        model: fallbackModel,
        system: SYSTEM_PROMPT,
        prompt,
      })
      text = response.text
    }

    // Parse JSON response from AI
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
    let result = JSON.parse(cleanText)
    result = enforceSeoLimits(result)

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('[AI Assist Error]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function enforceSeoLimits(seoData: any) {
  if (!seoData) return seoData;

  if (seoData.metaTitle && typeof seoData.metaTitle === 'string') {
    let title = seoData.metaTitle.trim();
    if (title.length > 60) {
      const suffix = title.endsWith(' - Asian Dot') ? ' - Asian Dot' : (title.endsWith(' | Asian Dot') ? ' | Asian Dot' : '');
      const maxPrefixLength = 60 - suffix.length;
      if (suffix) {
        let prefix = title.substring(0, title.length - suffix.length).trim();
        if (prefix.length > maxPrefixLength) {
          prefix = prefix.substring(0, maxPrefixLength);
          const lastSpace = prefix.lastIndexOf(' ');
          if (lastSpace > 20) {
            prefix = prefix.substring(0, lastSpace).trim();
          }
        }
        title = prefix + suffix;
      } else {
        title = title.substring(0, 60);
        const lastSpace = title.lastIndexOf(' ');
        if (lastSpace > 30) {
          title = title.substring(0, lastSpace).trim();
        }
      }
      seoData.metaTitle = title;
    }
  }

  if (seoData.metaDescription && typeof seoData.metaDescription === 'string') {
    let desc = seoData.metaDescription.trim();
    if (desc.length > 150) {
      desc = desc.substring(0, 150);
      const lastPeriod = desc.lastIndexOf('.');
      if (lastPeriod > 100) {
        desc = desc.substring(0, lastPeriod + 1).trim();
      } else {
        const lastSpace = desc.lastIndexOf(' ');
        if (lastSpace > 100) {
          desc = desc.substring(0, lastSpace).trim() + '...';
        }
      }
      seoData.metaDescription = desc;
    }
  }

  if (seoData.excerpt && typeof seoData.excerpt === 'string') {
    let excerpt = seoData.excerpt.trim();
    if (excerpt.length > 160) {
      excerpt = excerpt.substring(0, 160);
      const lastPeriod = excerpt.lastIndexOf('.');
      if (lastPeriod > 100) {
        excerpt = excerpt.substring(0, lastPeriod + 1).trim();
      } else {
        const lastSpace = excerpt.lastIndexOf(' ');
        if (lastSpace > 100) {
          excerpt = excerpt.substring(0, lastSpace).trim() + '...';
        }
      }
      seoData.excerpt = excerpt;
    }
  }
  return seoData;
}
