import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { 
  lexicalEditor, 
  FixedToolbarFeature, 
  HeadingFeature, 
  HorizontalRuleFeature,
  InlineCodeFeature,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
  UploadFeature,
  BlocksFeature
} from '@payloadcms/richtext-lexical'
import { VideoEmbed } from './src/blocks/VideoEmbed'
import { seoPlugin } from '@payloadcms/plugin-seo'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Articles } from './src/collections/Articles'
import { Categories } from './src/collections/Categories'
import { Authors } from './src/collections/Authors'
import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'
import { ShareLinks } from './src/collections/ShareLinks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default buildConfig({
  sharp,
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Asian Dot CMS',
    },
  },
  collections: [Articles, Categories, Authors, Media, Users, ShareLinks],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
      HorizontalRuleFeature(),
      BlocksFeature({
        blocks: [VideoEmbed],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgresql://tribune:tribune123@localhost:5433/tribune',
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['articles'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }: { doc: any }) => `${doc?.title?.value} — Asian Dot`,
      generateDescription: ({ doc }: { doc: any }) => doc?.excerpt?.value,
    }),
    (config) => {
      const articlesCollection = config.collections?.find((c) => c.slug === 'articles')
      if (articlesCollection && articlesCollection.fields) {
        const ogIndex = articlesCollection.fields.findIndex((f) => 'name' in f && f.name === 'og')
        const metaIndex = articlesCollection.fields.findIndex((f) => 'name' in f && f.name === 'meta')
        
        if (ogIndex !== -1 && metaIndex !== -1) {
          const ogField = articlesCollection.fields[ogIndex]
          const metaField = articlesCollection.fields[metaIndex]
          
          articlesCollection.fields = articlesCollection.fields.filter(
            (f) => !('name' in f && (f.name === 'og' || f.name === 'meta'))
          )
          
          articlesCollection.fields.push({
            type: 'collapsible',
            label: 'Advanced (OG & SEO)',
            admin: {
              initCollapsed: true,
            },
            fields: [
              ogField,
              metaField,
            ],
          } as any)
        }
      }
      return config
    },
  ],
  serverURL: siteUrl,
  cors: [
    siteUrl,
    'https://asiandot.com',
    'https://www.asiandot.com',
  ],
  csrf: [
    siteUrl,
    'https://asiandot.com',
    'https://www.asiandot.com',
  ],
})
