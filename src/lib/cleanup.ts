import { getPayload } from 'payload'
import config from '../../payload.config'

const cleanup = async () => {
  const payload = await getPayload({ config })
  
  console.log('Deleting articles...')
  await payload.delete({
    collection: 'articles',
    where: { id: { exists: true } },
  })

  console.log('Deleting media...')
  await payload.delete({
    collection: 'media',
    where: { id: { exists: true } },
  })

  console.log('Cleanup complete.')
  process.exit(0)
}

cleanup()
