import type { CollectionConfig } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { VideoEmbed } from '../blocks/VideoEmbed'
import slugify from 'slugify'
import { revalidateTag } from 'next/cache'


export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'status', 'publishedAt'],
    description: 'News articles published on Asian Dot.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      if ((req.user as any).role === 'admin' || (req.user as any).role === 'editor') return true
      return { author: { equals: req.user.id } }
    },
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.slug && data.title) {
          // Note: slugify with strict:true returns "" for Khmer text.
          let generatedSlug = slugify(data.title, { lower: true, strict: true })
          
          if (!generatedSlug) {
            // Try less strict slugify
            generatedSlug = slugify(data.title, { lower: true, strict: false })
          }

          // Ensure slug is never empty
          data.slug = generatedSlug || `article-${Date.now()}`
        }
        
        if (data.content) {
          const contentStr = JSON.stringify(data.content)
          const wordCount = contentStr.split(/\s+/).length
          data.readTime = Math.max(1, Math.ceil(wordCount / 200))
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        try {
          // Clear all cached article lists (home, category rows, breaking ticker, featured)
          revalidateTag('articles')

          // Clear the category page the article belongs to
          if (doc.category && typeof doc.category === 'object' && doc.category.slug) {
            revalidateTag(`category-${doc.category.slug}`)
          }

          // 🔥 Warm the cache immediately — fire-and-forget background fetches
          // so pages are pre-built before the first real visitor arrives
          if (doc.status === 'published' && doc.slug) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

            // Warm article page
            fetch(`${siteUrl}/article/${doc.slug}`, { cache: 'no-store' })
              .catch(() => {})

            // Warm home page
            fetch(`${siteUrl}/`, { cache: 'no-store' })
              .catch(() => {})

            // Warm category page
            if (doc.category && typeof doc.category === 'object' && doc.category.slug) {
              fetch(`${siteUrl}/category/${doc.category.slug}`, { cache: 'no-store' })
                .catch(() => {})
            }
          }
        } catch (e) {
          // Ignore revalidation errors during seeding/CLI
        }

        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', description: 'Auto-generated from title.' },
    },
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 255, localized: true },
    { 
      name: 'content', 
      type: 'richText', 
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [VideoEmbed],
          }),
        ],
      }), 
      localized: true 
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'credit', type: 'text', localized: false, admin: { description: 'News source or attribution (e.g. CNN, AP, Reuters).' } },
    { name: 'category', type: 'relationship', relationTo: 'categories', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'authors', admin: { position: 'sidebar' } },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text', localized: true }] },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'published',
      admin: { position: 'sidebar' },
    },
    {
      name: 'aiAssistant',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/admin/AIAssistant#AIAssistant',
        },
      },
    },
    {
      name: 'shareLink',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/components/admin/ShareLink#ShareLink',
        },
      },
    },
    { name: 'isBreaking', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'readTime', type: 'number', admin: { position: 'sidebar', description: 'Auto-calculated' } },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
