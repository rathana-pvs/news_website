import { getPayload } from 'payload'
import config from '@payload-config'

let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = { client: null, promise: null }
}

/**
 * Returns the Payload instance for server-side use as a singleton.
 * This prevents opening too many database connections during development and pre-rendering.
 */
export async function getPayloadClient() {
  const isPlaceholderDb = process.env.DATABASE_URI?.includes('placeholder')

  if (isPlaceholderDb) {
    console.log('⚠️ Using mock Payload client for build phase (placeholder database detected)')
    return {
      find: async () => ({ docs: [], totalDocs: 0, hasPrevPage: false, hasNextPage: false }),
    } as any
  }

  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = getPayload({ config })
  }

  try {
    cached.client = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.client
}
