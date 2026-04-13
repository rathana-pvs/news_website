import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    staticURL: '/media',
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 267,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Images and media assets.',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'editor',
    delete: ({ req }) => (req.user as any)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // If it's an external source, use the externalUrl
        if (data.source === 'external' && data.externalUrl) {
          data.url = data.externalUrl
        } 
        // If it's local but we only have a filename/relative path
        else if (data.filename) {
          data.url = `/media/${data.filename}`
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (doc.source === 'external' && doc.externalUrl) {
          doc.url = doc.externalUrl
        } else if (doc.filename && (!doc.url || doc.url.includes('/api/media/file/'))) {
          doc.url = `/media/${doc.filename}`
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alt text for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption displayed below image',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'local',
      options: [
        { label: 'Local Upload', value: 'local' },
        { label: 'External URL', value: 'external' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.source === 'external',
        description: 'Direct link to an external image (e.g., Unsplash, Cloudinary)',
      },
    },
  ],
}
