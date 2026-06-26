import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

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
    const { action, title, content } = await req.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    let prompt = ''

    switch (action) {
      case 'generate_article':
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

      case 'write_excerpt':
        if (!title && !content) return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
        prompt = `Write a compelling news article excerpt (under 255 characters) for:
Title: "${title || ''}"
Content snippet: "${content ? content.substring(0, 500) : ''}"

Return JSON in this exact format:
{
  "excerpt": "The excerpt text here, max 255 characters."
}`
        break

      case 'seo_suggestions':
        if (!title && !content) return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
        prompt = `Generate SEO metadata for this news article:
Title: "${title || ''}"
Content snippet: "${content ? content.substring(0, 500) : ''}"

Return JSON in this exact format:
{
  "metaTitle": "SEO optimized title, strictly between 50 and 60 characters long (including ' - Asian Dot' suffix)",
  "metaDescription": "SEO meta description, strictly between 100 and 150 characters long"
}`
        break

      case 'suggest_tags':
        if (!title && !content) return NextResponse.json({ error: 'Title or content is required' }, { status: 400 })
        prompt = `Suggest 5-8 relevant news tags for this article:
Title: "${title || ''}"
Content snippet: "${content ? content.substring(0, 500) : ''}"

Return JSON in this exact format:
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
        break

      case 'improve_writing':
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        prompt = `Improve the following news article excerpt for clarity, professionalism, and engagement. Keep the same meaning and facts:

"${content}"

Return JSON in this exact format:
{
  "improved": "The improved text here."
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
