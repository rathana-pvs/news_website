import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import * as cheerio from 'cheerio'
import * as dotenv from 'dotenv'
import path from 'path'
import dns from 'dns'

// Force IPv4 first to avoid IPv6 connection timeouts with Cloudflare
dns.setDefaultResultOrder('ipv4first')

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const urlArg = process.argv.find((a) => a.startsWith('--url='))
const SITE_URL = urlArg ? urlArg.split('=')[1] : (process.env.TARGET_URL || 'https://asiandot.com')
const API_URL = SITE_URL.replace(/\/$/, '')

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
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            'the',
            'and',
            'for',
            'with',
            'from',
            'this',
            'that',
            'make',
            'makes',
            'about',
            'after',
            'before',
            'will',
            'have',
            'says',
            'amid',
            'over',
          ].includes(w.toLowerCase()),
      )
      .slice(0, 6)
      .join(' ')

    if (!cleanQuery || cleanQuery.length < 4) return []

    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-US&gl=US&ceid=US:en`
    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) return []

    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    const sources: RelatedNewsSource[] = []

    $('item')
      .slice(0, 3)
      .each((_, el) => {
        const itemTitle = $(el).find('title').text().trim()
        const itemSource = $(el).find('source').text().trim() || 'News Wire'
        const rawDesc = $(el)
          .find('description')
          .text()
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const itemUrl = $(el).find('link').text().trim()

        if (itemTitle && itemTitle.length > 10) {
          sources.push({
            title: itemTitle,
            source: itemSource,
            url: itemUrl,
            snippet: rawDesc,
          })
        }
      })

    return sources
  } catch (err) {
    return []
  }
}

function extractTextFromLexical(content: any): string {
  if (!content || !content.root || !Array.isArray(content.root.children)) return ''
  const texts: string[] = []
  for (const child of content.root.children) {
    if (child.type === 'paragraph' && Array.isArray(child.children)) {
      const pText = child.children.map((c: any) => c.text || '').join('')
      if (pText.trim()) texts.push(pText.trim())
    }
  }
  return texts.join('\n\n')
}

function convertParagraphsToLexical(paragraphs: string[], existingEmbeds: any[] = []): any {
  const children: any[] = paragraphs.map((text) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'text',
        text,
        format: 0,
        style: '',
        version: 1,
      },
    ],
    direction: 'ltr',
  }))

  if (existingEmbeds.length > 0) {
    children.push(...existingEmbeds)
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  }
}

async function login(): Promise<string> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rathana@asiandot.com',
      password: '12345678',
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to login: ${res.status} ${res.statusText} - ${errorText}`)
  }

  const data = await res.json()
  return data.token
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArg = args.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 30
  const offsetArg = args.find((a) => a.startsWith('--offset='))
  const offset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0

  console.log(`\n============================================================`)
  console.log(`🌐 Asian Dot HTTP Article Batch Updater`)
  console.log(`   Target: ${API_URL}`)
  console.log(`   Limit: ${limit} articles | Offset: ${offset} | DryRun: ${isDryRun}`)
  console.log(`============================================================\n`)

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is not set.')
    process.exit(1)
  }

  const googleAI = createGoogleGenerativeAI({ apiKey })
  const model = googleAI('gemini-2.5-flash')

  // 1. Authenticate over HTTP
  console.log('🔑 Authenticating via Payload REST API (rathana@asiandot.com)...')
  const token = await login()
  console.log('✅ Authentication successful! Received JWT token.\n')

  // 2. Fetch Categories
  console.log('📁 Fetching category list...')
  const catRes = await fetch(`${API_URL}/api/categories?limit=50`)
  const catData = await catRes.json()
  const categories: Array<{ id: number; name: string; slug: string }> = catData.docs || []
  const categoryNames = categories.map((c) => c.name).join(', ')
  console.log(`✅ Loaded ${categories.length} categories: [${categoryNames}]\n`)

  // 3. Fetch latest published articles
  console.log(`📥 Fetching latest ${limit} published articles (page offset ${offset})...`)
  const page = Math.floor(offset / limit) + 1
  const articlesRes = await fetch(
    `${API_URL}/api/articles?limit=${limit}&page=${page}&sort=-publishedAt&where[status][equals]=published`,
  )
  const articlesData = await articlesRes.json()
  const docs = articlesData.docs || []
  console.log(`Found ${docs.length} articles to process.\n`)

  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const index = i + 1

    const existingText = extractTextFromLexical(doc.content)
    const existingWordCount = existingText.split(/\s+/).filter(Boolean).length

    console.log(`------------------------------------------------------------`)
    console.log(`[${index}/${docs.length}] Article ID: ${doc.id}`)
    console.log(`Title: "${doc.title}"`)
    console.log(`Current Words: ${existingWordCount} | Category: ${doc.category?.name || 'None'} | Author: ${doc.author?.name || doc.author || 'None'}`)

    // Check if already in 300-450 word format with 6+ paragraphs
    const paragraphsCount = (doc.content?.root?.children || []).filter((c: any) => c.type === 'paragraph').length
    if (existingWordCount >= 300 && existingWordCount <= 460 && paragraphsCount >= 6 && !args.includes('--force')) {
      console.log(`   ⏭️  Already satisfies new format (${existingWordCount} words, ${paragraphsCount} paragraphs). Skipping. (Use --force to rewrite)`)
      skipCount++
      continue
    }

    // Step A: Fetch related sources from Google News RSS
    console.log(`   🔍 Discovering complementary news sources via Google News RSS...`)
    const relatedSources = await fetchRelatedNewsSources(doc.title)
    const relatedContext =
      relatedSources.length > 0
        ? relatedSources
            .map(
              (s, idx) =>
                `Source ${idx + 1} (${s.source}): "${s.title}" — Summary/Snippet: ${s.snippet || 'N/A'}`,
            )
            .join('\n')
        : 'No secondary news feeds discovered.'

    console.log(`   ↳ Found ${relatedSources.length} complementary source(s).`)

    // Step B: Synthesize with Gemini
    const prompt = `You are the lead editor at Asian Dot, an independent news publication. Synthesize the provided primary news report and complementary sources into an authoritative, in-depth news article.

PRIMARY ARTICLE HEADLINE: "${doc.title}"
PRIMARY ARTICLE CONTENT:
"${existingText.substring(0, 3500)}"

COMPLEMENTARY NEWS COVERAGE (FOR MULTI-PERSPECTIVE FACT CHECKING, BACKGROUND & CITATION):
${relatedContext}

RULES FOR ASIANDOT MULTI-SOURCE EDITORIAL FORMAT:
1. TOTAL WORD COUNT & DEPTH: The ENTIRE article content body MUST be between 320 and 420 words total. Do NOT write brief 1-sentence paragraphs. Each of the 6 to 8 paragraphs MUST contain 2 to 4 rich, detailed sentences (around 45 to 60 words per paragraph).
2. DO NOT duplicate the article title in the body.
3. DO NOT include any markdown headers (no ## or ###). Write only clean, cohesive paragraphs separated by blank lines (\\n\\n).
4. PARAGRAPH STRUCTURE: Write strictly 6 to 8 paragraphs:
   - Paragraphs 1-2 (The Breaking Lead): Report the core factual developments clearly with key figures, dates, locations, and actions.
   - Paragraphs 3-4 (Background Context & History): Provide essential historical context, prior related events, and timeline explaining how this situation developed.
   - Paragraphs 5-6 (Official Statements & Journalistic Attribution): Synthesize official reactions, government filings, or verified reporting (e.g. "According to reports first corroborated by...", "Agency officials stated...").
   - Paragraphs 7-8 (Broader Geopolitical & Regional Impact): Explain what this means for national or international policy, and what developments or proceedings are expected next.
5. 100% ORIGINAL SYNTHESIS: Synthesize all facts into an original, analytical journalistic narrative. NEVER copy verbatim sentences from any single source to ensure full copyright independence.
7. CATEGORY CLASSIFICATION: Choose the single best category for this story from this list: [${categoryNames}].`

    try {
      console.log(`   🤖 Generating editorial synthesis via Gemini...`)
      const { object: parsed } = await generateObject({
        model,
        schema: z.object({
          category: z.string().describe(`The best matching category from [${categoryNames}]`),
          excerpt: z.string().describe('A punchy, complete lead summary sentence strictly between 120 and 155 characters ending with a period.'),
          paragraphs: z.array(z.string()).describe('Strictly 6 to 8 rich paragraphs, each 45 to 60 words, totaling 320 to 420 words.'),
        }),
        prompt,
      })

      const newParagraphs = parsed.paragraphs.map((p: string) => p.trim()).filter(Boolean)
      const newWordCount = newParagraphs.join(' ').split(/\s+/).filter(Boolean).length

      // Match category ID
      let matchedCategoryId: number | undefined = doc.category?.id
      if (parsed.category) {
        const found = categories.find(
          (c) => c.name.toLowerCase() === parsed.category.toLowerCase() || c.slug.toLowerCase() === parsed.category.toLowerCase(),
        )
        if (found) {
          matchedCategoryId = found.id
        }
      }
      if (!matchedCategoryId && categories.length > 0) {
        matchedCategoryId = categories[0].id // Fallback
      }

      // Preserve existing embed blocks (e.g. Twitter/Video embeds)
      const existingBlocks = (doc.content?.root?.children || []).filter((c: any) => c.type === 'block')
      const newLexical = convertParagraphsToLexical(newParagraphs, existingBlocks)

      let cleanExcerpt = (parsed.excerpt || doc.excerpt || '').trim()
      if (cleanExcerpt.length > 155) {
        const truncated = cleanExcerpt.substring(0, 150)
        const lastSpace = truncated.lastIndexOf(' ')
        cleanExcerpt = (lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated).trim()
      }
      // Clean trailing punctuation or trailing conjunctions
      cleanExcerpt = cleanExcerpt.replace(/[\s,;:\-–—]+$/, '')
      cleanExcerpt = cleanExcerpt.replace(/\s+(and|or|but|amidst|amid|with|that|which|to|for|in|on|at|as|of)$/i, '')
      if (!cleanExcerpt.endsWith('.')) {
        cleanExcerpt += '.'
      }

      console.log(
        `   ✨ Synthesized: ${newWordCount} words across ${newParagraphs.length} paragraphs.`,
      )
      console.log(`   📝 Excerpt: "${cleanExcerpt}" (${cleanExcerpt.length} chars)`)
      console.log(`   🏷️  Category: ID ${matchedCategoryId} (${categories.find((c) => c.id === matchedCategoryId)?.name})`)

      if (!isDryRun) {
        let patchSuccess = false
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const patchRes = await fetch(`${API_URL}/api/articles/${doc.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'JWT ' + token,
                Connection: 'close',
              },
              body: JSON.stringify({
                content: newLexical,
                excerpt: cleanExcerpt,
                author: 3, // rathana
                isFeatured: true,
                category: matchedCategoryId,
              }),
              signal: AbortSignal.timeout(20000),
            })

            if (!patchRes.ok) {
              const errBody = await patchRes.text()
              throw new Error(`HTTP ${patchRes.status}: ${errBody}`)
            }

            console.log(`   ✅ Successfully updated article ${doc.id} via HTTP PATCH!`)
            successCount++
            patchSuccess = true
            break
          } catch (patchErr: any) {
            console.warn(`   ⚠️  PATCH attempt ${attempt}/3 failed: ${patchErr.message}. Retrying in 2s...`)
            if (attempt === 3) throw patchErr
            await new Promise((r) => setTimeout(r, 2000))
          }
        }
      } else {
        console.log(`   [DRY RUN] Would PATCH article ${doc.id} with new format.`)
        successCount++
      }

      // 1.5 second pacing to respect rate limits
      await new Promise((r) => setTimeout(r, 1500))
    } catch (err: any) {
      console.error(`   ❌ Failed to process article ${doc.id}:`, err?.message || err)
      failCount++
    }
  }

  console.log(`\n============================================================`)
  console.log(`🏁 Batch Update Summary`)
  console.log(`   Total inspected: ${docs.length}`)
  console.log(`   Successfully updated: ${successCount}`)
  console.log(`   Skipped (already new format): ${skipCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`============================================================\n`)
}

main().catch((err) => {
  console.error('Fatal execution error:', err)
  process.exit(1)
})
