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

  const metaTitle = title.endsWith(' - Asian Dot') ? title : `${title.substring(0, 45)} - Asian Dot`
  const metaDescription = excerpt || (content.length > 140 ? content.substring(0, 140) + '...' : content)

  return {
    title,
    content,
    excerpt: excerpt || (content.length > 180 ? content.substring(0, 180) + '...' : content),
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
      return {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: block.children.map((child: any) => {
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

const primaryModel = googleAI('gemini-3.5-flash')
const fallbackModel = googleAI('gemini-2.5-flash')

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

      // 4. Build Lexical JSON tree and assign to content
      result.content = buildLexicalJson(blocks)
      
      delete result.blocks

      const enforced = enforceSeoLimits(result)
      return NextResponse.json({ success: true, data: enforced })
    }

    let prompt = ''

    switch (action) {
      case 'full':
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        prompt = `Write a complete, well-structured news article for the title: "${title}"

Return JSON in this exact format:
{
  "content": "Full article body in plain text paragraphs separated by double newlines. Write at least 4-5 paragraphs. Do not use markdown.",
  "excerpt": "A compelling summary of the article in under 255 characters.",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "SEO optimized title, strictly between 50 and 60 characters long (including ' - Asian Dot' suffix)",
  "metaDescription": "SEO meta description, strictly between 100 and 150 characters long"
}`
        break

      case 'content_only':
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        prompt = `Write a news article and excerpt for the title: "${title}"

Return JSON in this exact format:
{
  "content": "Full article body in plain text paragraphs separated by double newlines. Write at least 4-5 paragraphs. Do not use markdown.",
  "excerpt": "A compelling summary of the article in under 255 characters."
}`
        break

      case 'seo_only':
        if (!title && !content) return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
        prompt = `Generate excerpt and SEO metadata for this news article:
Title: "${title || ''}"
Content snippet: "${content ? content.substring(0, 500) : ''}"

Return JSON in this exact format:
{
  "excerpt": "A compelling summary of the article in under 255 characters.",
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
      console.warn('Primary model (gemini-3.5-flash) failed, falling back to gemini-2.5-flash:', e)
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
    if (excerpt.length > 255) {
      excerpt = excerpt.substring(0, 255);
      const lastPeriod = excerpt.lastIndexOf('.');
      if (lastPeriod > 180) {
        excerpt = excerpt.substring(0, lastPeriod + 1).trim();
      } else {
        const lastSpace = excerpt.lastIndexOf(' ');
        if (lastSpace > 180) {
          excerpt = excerpt.substring(0, lastSpace).trim() + '...';
        }
      }
      seoData.excerpt = excerpt;
    }
  }
  return seoData;
}
