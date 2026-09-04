import { getPayload } from 'payload'
import config from '../../payload.config'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

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

  // Re-attach any Twitter/embed blocks at the end
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

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArg = args.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10

  console.log(`\n🚀 Starting Article Expansion Tool (Limit: ${limit}, DryRun: ${isDryRun})\n`)

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set.')
    process.exit(1)
  }

  const googleAI = createGoogleGenerativeAI({ apiKey })
  const model = googleAI('gemini-2.5-flash')

  const payload = await getPayload({ config })

  // Find recent published articles
  const articles = await payload.find({
    collection: 'articles',
    limit: 50,
    sort: '-publishedAt',
    where: {
      status: { equals: 'published' },
    },
    depth: 1,
  })

  console.log(`Found ${articles.docs.length} recent articles to inspect.`)

  let count = 0

  for (const doc of articles.docs) {
    if (count >= limit) break

    const existingText = extractTextFromLexical(doc.content)
    const wordCount = existingText.split(/\s+/).filter(Boolean).length

    // Target articles with fewer than 180 words
    if (wordCount < 180 && wordCount > 20) {
      count++
      console.log(`\n[${count}/${limit}] Expanding: "${doc.title}" (Current: ${wordCount} words)`)

      const prompt = `You are a senior investigative editor at Asian Dot. Expand the following short news wire brief into a comprehensive, authoritative news article for publication.

ARTICLE HEADLINE: "${doc.title}"
EXISTING SHORT TEXT:
"${existingText}"

RULES:
1. TOTAL WORD COUNT: The new article body MUST be between 320 and 420 words total.
2. Structure: Write 6 to 8 paragraphs:
   - Paragraph 1-2: The Breaking News Event (key figures, locations, primary development).
   - Paragraph 3-4: Background & Context (historical timeline, previous events leading to this).
   - Paragraph 5-6: Official Statements & Quotations (synthesizing statements and attributing reporting).
   - Paragraph 7-8: Geopolitical / Policy Implications (what this means going forward).
3. DO NOT repeat the title in the body.
4. DO NOT use any markdown headings (no ## or ###).
5. Provide an updated, complete lead excerpt strictly under 160 characters ending with a period.

Return valid JSON in this exact format:
{
  "content": "Paragraph 1 text\\n\\nParagraph 2 text\\n\\nParagraph 3 text\\n\\nParagraph 4 text\\n\\nParagraph 5 text\\n\\nParagraph 6 text",
  "excerpt": "Complete punchy excerpt under 160 chars."
}`

      try {
        const aiRes = await generateText({
          model,
          prompt,
        })

        const cleanJson = aiRes.text.replace(/```json\n?|\n?```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        const newParagraphs = parsed.content.split('\n\n').map((p: string) => p.trim()).filter(Boolean)
        const newWordCount = newParagraphs.join(' ').split(/\s+/).length

        // Extract existing embed blocks (e.g. twitterEmbed) to preserve them
        const existingBlocks = (doc.content?.root?.children || []).filter((c: any) => c.type === 'block')
        const newLexical = convertParagraphsToLexical(newParagraphs, existingBlocks)

        console.log(`   ↳ Expanded to: ${newWordCount} words across ${newParagraphs.length} paragraphs.`)

        if (!isDryRun) {
          await payload.update({
            collection: 'articles',
            id: doc.id,
            data: {
              content: newLexical,
              excerpt: parsed.excerpt || doc.excerpt,
            },
          })
          console.log(`   ✅ Successfully updated in database!`)
        } else {
          console.log(`   [DRY RUN] Would update article ID ${doc.id}`)
        }

        // Brief delay between calls
        await new Promise((r) => setTimeout(r, 1200))
      } catch (err: any) {
        console.error(`   ❌ Failed to expand "${doc.title}":`, err?.message || err)
      }
    }
  }

  console.log(`\n🎉 Done! Processed ${count} short articles.\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
