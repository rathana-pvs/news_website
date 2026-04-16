import 'dotenv/config'
import { getPayloadClient } from '../lib/payload'
import { Category } from '../../payload-types'

const categoriesData = [
  {
    name: 'Cambodia',
    khmerName: 'កម្ពុជា',
    slug: 'cambodia',
    description: 'Local politics, governance, domestic affairs, and national developments inside Cambodia.',
    color: '#3498db'
  },
  {
    name: 'Politics',
    khmerName: 'នយោបាយ',
    slug: 'politics',
    description: 'Regional and global political developments, elections, leadership changes, and power shifts.',
    color: '#c9a84c'
  },
  {
    name: 'War & Conflict',
    khmerName: 'សង្គ្រាម និងជម្លោះ',
    slug: 'war-conflict',
    description: 'Active conflicts, military operations, armed tensions, frontline updates, and ceasefire news.',
    color: '#e74c3c'
  },
  {
    name: 'Geopolitics',
    khmerName: 'ភូមិសាស្ត្រនយោបាយ',
    slug: 'geopolitics',
    description: 'Global power dynamics, alliances, territorial disputes, sanctions, and strategic rivalries.',
    color: '#9b59b6'
  },
  {
    name: 'Economy & Trade',
    khmerName: 'សេដ្ឋកិច្ច និងពាណិជ្ជកម្ម',
    slug: 'economy-trade',
    description: 'Trade wars, economic sanctions, markets, investment flows, and financial warfare between nations.',
    color: '#2ecc71'
  },
  {
    name: 'Asia Pacific',
    khmerName: 'អាស៊ី-ប៉ាស៊ីហ្វិក',
    slug: 'asia-pacific',
    description: 'Key developments across Southeast Asia, China, Japan, South Korea, and India.',
    color: '#f1c40f'
  },
  {
    name: 'World',
    khmerName: 'ពិភពលោក',
    slug: 'world',
    description: 'Major international headlines beyond Asia — Europe, Middle East, Americas, and global affairs.',
    color: '#95a5a6'
  }
]

async function seed() {
  const payload = await getPayloadClient()
  
  console.log('🌱 Starting category migration...')

  for (const data of categoriesData) {
    try {
      // Check if category already exists
      const existing = await payload.find({
        collection: 'categories',
        where: {
          slug: { equals: data.slug }
        }
      })

      if (existing.docs.length > 0) {
        console.log(`- Category "${data.name}" already exists. Skipping.`)
        continue
      }

      await payload.create({
        collection: 'categories',
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          color: data.color,
        },
        // We handle the Khmer translation by passing the 'locale' inside the seed loops if needed, 
        // but for initial create we update localized fields specifically.
      })

      // Update localized Khmer name
      const created = await payload.find({
        collection: 'categories',
        where: { slug: { equals: data.slug } }
      })

      if (created.docs.length > 0) {
        await payload.update({
          collection: 'categories',
          id: created.docs[0].id,
          locale: 'km',
          data: {
            name: data.khmerName,
            description: data.description // You can provide a Khmer description later if you have one
          }
        })
      }

      console.log(`✅ Created: ${data.name}`)
    } catch (error) {
      console.error(`❌ Error creating ${data.name}:`, error)
    }
  }

  console.log('🏁 Migration complete.')
  process.exit(0)
}

seed()
