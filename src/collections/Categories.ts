import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { revalidateTag } from 'next/cache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    description: 'Article categories for Asian Dot.',
  },
  access: {
    read: () => true,
    create: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    update: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.slug && data.name) {
          data.slug = slugify(data.name, { lower: true, strict: true })
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        try {
          // Clear category cache (header nav, footer, category rows)
          revalidateTag('categories')
          // Clear article cache (article cards show category name/color)
          revalidateTag('articles')
        } catch (e) {
          // Ignore errors during seeding/CLI
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'color',
      type: 'text',
      defaultValue: '#c9a84c',
      admin: {
        description: 'Hex color for this category',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
      ],
    },
  ],
}
