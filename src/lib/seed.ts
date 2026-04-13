import { getPayload } from 'payload'
import config from '../../payload.config'
import { mockArticles, mockAuthors, mockCategories, mockRegions } from './mockData'

const seed = async () => {
  const payload = await getPayload({ config })

  // Clear existing data for a clean slate
  console.log('--- Clearing Existing Data ---')
  await payload.delete({
    collection: 'articles',
    where: { id: { exists: true } },
  })
  await payload.delete({
    collection: 'media',
    where: { id: { exists: true } },
  })
  
  console.log('--- Seeding Categories ---')
  const categoryMap: Record<string, string> = {}
  for (const cat of mockCategories) {
    const existing = await payload.find({
      collection: 'categories',
      locale: 'en',
      where: { slug: { equals: cat.slug } },
    })

    const data = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
    }

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'categories',
        data,
      })
      categoryMap[cat.slug!] = created.id
      console.log(`Created category: ${cat.name}`)
    } else {
      const updated = await payload.update({
        collection: 'categories',
        id: existing.docs[0].id,
        data,
      })
      categoryMap[cat.slug!] = updated.id
      console.log(`Updated category: ${cat.name}`)
    }
  }

  console.log('--- Seeding Regions ---')
  const regionMap: Record<string, string> = {}
  for (const reg of mockRegions) {
    const existing = await payload.find({
      collection: 'regions',
      locale: 'en',
      where: { slug: { equals: reg.slug } },
    })

    const data = {
      name: reg.name,
      slug: reg.slug,
      description: reg.description,
    }

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'regions',
        data,
      })
      regionMap[reg.slug!] = created.id
      console.log(`Created region: ${reg.name}`)
    } else {
      const updated = await payload.update({
        collection: 'regions',
        id: existing.docs[0].id,
        data,
      })
      regionMap[reg.slug!] = updated.id
      console.log(`Updated region: ${reg.name}`)
    }
  }

  console.log('--- Seeding Authors ---')
  const authorMap: Record<string, string> = {}
  for (const author of mockAuthors) {
    const existing = await payload.find({
      collection: 'authors',
      locale: 'en',
      where: { slug: { equals: author.slug } },
    })

    const data = {
      name: author.name,
      slug: author.slug,
      bio: author.bio,
      role: author.role,
      twitter: author.twitter,
    }

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'authors',
        data,
      })
      authorMap[author.slug!] = created.id
      console.log(`Created author: ${author.name}`)
    } else {
      const updated = await payload.update({
        collection: 'authors',
        id: existing.docs[0].id,
        data,
      })
      authorMap[author.slug!] = updated.id
      console.log(`Updated author: ${author.name}`)
    }
  }

  console.log('--- Seeding Articles ---')
  for (const article of mockArticles) {
    const existing = await payload.find({
      collection: 'articles',
      locale: 'en',
      where: { slug: { equals: article.slug } },
    })

    const articleData: any = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [{ type: 'text', text: article.excerpt, version: 1 }],
            },
          ],
        },
      },
      status: 'published',
      publishedAt: article.publishedAt as string,
      isBreaking: article.isBreaking,
      isFeatured: article.isFeatured,
      category: categoryMap[article.category?.slug as string],
      region: regionMap[article.region?.slug as string],
      author: authorMap[article.author?.slug as string],
    }

    if (existing.docs.length === 0) {
      // Create media item
      const mockImageUrl = (article.coverImage as any)?.url
      const isExternal = mockImageUrl?.startsWith('http')

      const mediaData: any = {
        alt: article.title,
        source: isExternal ? 'external' : 'local',
      }

      if (isExternal) {
        mediaData.externalUrl = mockImageUrl
      }

      const media = await payload.create({
        collection: 'media',
        data: mediaData,
        file: {
          data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA6ie6hQAAAABJRU5ErkJggg==', 'base64'),
          name: isExternal ? `external-${Date.now()}.png` : 'placeholder.png',
          mimetype: 'image/png',
          size: 70,
        },
      })
      articleData.coverImage = media.id

      await payload.create({
        collection: 'articles',
        data: articleData,
      })
      console.log(`Created article: ${article.title}`)
    } else {
      // Update article AND its media
      const doc = existing.docs[0]
      const mockImageUrl = (article.coverImage as any)?.url
      const isExternal = mockImageUrl?.startsWith('http')
      
      const mediaId = typeof doc.coverImage === 'object' ? (doc.coverImage as any).id : doc.coverImage

      if (mediaId) {
        await payload.update({
          collection: 'media',
          id: mediaId,
          data: {
            externalUrl: isExternal ? mockImageUrl : undefined,
            source: isExternal ? 'external' : 'local',
          },
        })
        console.log(`Updated media record for: ${article.title}`)
      }

      await payload.update({
        collection: 'articles',
        id: doc.id,
        data: articleData,
      })
      console.log(`Updated article record: ${article.title}`)
    }
  }

  console.log('--- Creating Admin User ---')
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@thetribune.com' } },
  })

  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@thetribune.com',
        password: 'adminpassword123',
        name: 'Tribune Admin',
        role: 'admin',
      },
    })
    console.log('Created admin user: admin@thetribune.com / adminpassword123')
  }

  console.log('Seed completed successfully!')
  process.exit(0)
}

seed()
