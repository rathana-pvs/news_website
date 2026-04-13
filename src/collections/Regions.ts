import type { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const Regions: CollectionConfig = {
  slug: 'regions',
  admin: {
    useAsTitle: 'name',
    description: 'Geographic regions for news classification.',
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
  ],
}
