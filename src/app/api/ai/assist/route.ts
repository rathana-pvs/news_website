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

  // 3. Extract main content text
  $('script, style, svg, nav, header, footer, aside, iframe, form, noscript, .ads, .comments, .sidebar, .menu').remove()

  let paragraphs: string[] = []
  
  const articleEl = $('article')
  if (articleEl.length > 0) {
    articleEl.find('p').each((_, el) => {
      const txt = $(el).text().trim()
      if (txt.length > 20) paragraphs.push(txt)
    })
  }
  
  if (paragraphs.length === 0) {
    const mainEl = $('main')
    if (mainEl.length > 0) {
      mainEl.find('p').each((_, el) => {
        const txt = $(el).text().trim()
        if (txt.length > 20) paragraphs.push(txt)
      })
    }
  }
  
  if (paragraphs.length === 0) {
    let bestContainer: any = null
    let maxParagraphs = 0
    
    $('div, section').each((_, el) => {
      const pCount = $(el).children('p').length
      if (pCount > maxParagraphs) {
        maxParagraphs = pCount
        bestContainer = el
      }
    })
    
    if (bestContainer) {
      $(bestContainer).children('p').each((_, el) => {
        const txt = $(el).text().trim()
        if (txt.length > 20) paragraphs.push(txt)
      })
    }
  }
  
  if (paragraphs.length === 0) {
    $('p').each((_, el) => {
      const txt = $(el).text().trim()
      if (txt.length > 20) paragraphs.push(txt)
    })
  }

  const cleanParagraphs = paragraphs
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 30 && !p.toLowerCase().includes('cookie') && !p.toLowerCase().includes('subscribe') && !p.toLowerCase().includes('sign up'))
    
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

  // 4. Extract main image URL
  let scrapedImageUrl = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') ||
                        $('link[rel="image_src"]').attr('href') ||
                        ''
  
  if (scrapedImageUrl) {
    scrapedImageUrl = resolveUrl(url, scrapedImageUrl)
  } else {
    // Fall back to first prominent content image
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
          return false // break
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
            return false // break
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
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, url } = await req.json()

    // Support both direct route action scrape_direct and fallback calls
    if (action !== 'scrape_direct' && action !== undefined) {
      return NextResponse.json({ error: 'Only link import is supported' }, { status: 400 })
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const result = await scrapeUrlDirectly(url) as any
    
    // If image URL is found, download it and create a media document in Payload
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
        }
      } catch (imgErr) {
        console.error('Failed to download scraped image:', imgErr)
      }
    }

    const enforced = enforceSeoLimits(result)
    return NextResponse.json({ success: true, data: enforced })
  } catch (error: any) {
    console.error('[Import Link Error]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to import link' },
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
