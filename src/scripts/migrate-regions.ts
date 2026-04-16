import { getPayload } from 'payload'
import config from '../../payload.config'
import 'dotenv/config'

const regionsData = [
  {
    slug: 'asia',
    en: {
      name: 'Asia',
      description: 'Comprehensive political and economic coverage across the Asian continent, with a focus on ASEAN and Indo-Pacific dynamics.',
    },
    km: {
      name: 'អាស៊ី',
      description: 'ការរាយការណ៍គ្រប់ជ្រុងជ្រោយអំពីនយោបាយ និងសេដ្ឋកិច្ចនៅទូទាំងទ្វីបអាស៊ី ដោយផ្តោតលើអាស៊ាន និងឥណ្ឌូប៉ាស៊ីហ្វិក។',
    },
  },
  {
    slug: 'europe',
    en: {
      name: 'Europe',
      description: 'In-depth analysis of European Union policy, UK governance, and regional geopolitical shifts.',
    },
    km: {
      name: 'អឺរ៉ុប',
      description: 'ការវិភាគស៊ីជម្រៅអំពីគោលនយោបាយសហភាពអឺរ៉ុប អភិបាលកិច្ចនៅចក្រភពអង់គ្លេស និងបម្រែបម្រួលភូមិសាស្ត្រនយោបាយក្នុងតំបន់។',
    },
  },
  {
    slug: 'us-canada',
    en: {
      name: 'US & Canada',
      description: 'Reporting on North American political developments, trade relations, and legislative changes.',
    },
    km: {
      name: 'អាមេរិក និង កាណាដា',
      description: 'ការរាយការណ៍អំពីការវិវត្តនយោបាយនៅអាមេរិកខាងជើង ទំនាក់ទំនងពាណិជ្ជកម្ម និងការផ្លាស់ប្តូរច្បាប់។',
    },
  },
  {
    slug: 'middle-east',
    en: {
      name: 'Middle East',
      description: 'Current affairs and strategic analysis from the MENA region, focusing on stability and diplomacy.',
    },
    km: {
      name: 'មជ្ឈិមបូព៌ា',
      description: 'កិច្ចការបច្ចុប្បន្ន និងការវិភាគយុទ្ធសាស្ត្រពីតំបន់ MENA ដោយផ្តោតលើស្ថិរភាព និងការទូត។',
    },
  },
  {
    slug: 'africa',
    en: {
      name: 'Africa',
      description: 'Insights into emerging markets, democratic transitions, and regional cooperation across Africa.',
    },
    km: {
      name: 'អាហ្វ្រិក',
      description: 'ការយល់ដឹងអំពីទីផ្សារដែលកំពុងលេចធ្លោ ការផ្លាស់ប្តូរលទ្ធិប្រជាធិបតេយ្យ និងកិច្ចសហប្រតិបត្តិការតំបន់នៅទូទាំងអាហ្វ្រិក។',
    },
  },
]

async function migrate() {
  const payload = await getPayload({ config })

  console.log('Starting Regions migration...')

  for (const region of regionsData) {
    try {
      // 1. Create the English version
      const createdRegion = await payload.create({
        collection: 'regions',
        data: {
          slug: region.slug,
          name: region.en.name,
          description: region.en.description,
        },
        locale: 'en',
      })

      console.log(`Created region (EN): ${region.slug}`)

      // 2. Add the Khmer translation
      await payload.update({
        collection: 'regions',
        id: createdRegion.id,
        data: {
          name: region.km.name,
          description: region.km.description,
        },
        locale: 'km',
      })

      console.log(`Added Khmer translation for: ${region.slug}`)
    } catch (error: any) {
      if (error.message?.includes('slug') && error.message?.includes('already exists')) {
        console.log(`Region ${region.slug} already exists, skipping...`)
      } else {
        console.error(`Error migrating ${region.slug}:`, error.message)
      }
    }
  }

  console.log('Regions migration completed.')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
