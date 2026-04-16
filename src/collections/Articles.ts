import type { CollectionConfig } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { VideoEmbed } from '../blocks/VideoEmbed'
import slugify from 'slugify'
import { revalidatePath } from 'next/cache'
import { i18n } from '../i18n-config'

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
      ({ doc, req }) => {
        // Only revalidate if we are in a request context (prevents error during seeding)
        try {
          // Revalidate the home page (for all locales)
          revalidatePath('/', 'layout')
          
          // Revalidate the specific article if it's published for all supported locales
          if (doc.status === 'published') {
            i18n.locales.forEach(locale => {
              revalidatePath(`/${locale}/article/${doc.slug}`)
            })
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
    { name: 'excerpt', type: 'textarea', required: true, maxLength: 160, localized: true },
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
    { name: 'category', type: 'relationship', relationTo: 'categories', admin: { position: 'sidebar' } },
    { name: 'region', type: 'relationship', relationTo: 'regions', admin: { position: 'sidebar' } },
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
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
    { name: 'isBreaking', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'language',
      type: 'select',
      options: [
        { label: 'All Languages', value: 'all' },
        { label: 'English', value: 'en' },
        { label: 'Khmer', value: 'km' },
      ],
      defaultValue: 'all',
      admin: { position: 'sidebar', description: 'Target specific user language.' },
    },
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
