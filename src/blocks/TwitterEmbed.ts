import { Block } from 'payload'

export const TwitterEmbed: Block = {
  slug: 'twitterEmbed',
  labels: {
    singular: 'Twitter Embed',
    plural: 'Twitter Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Tweet URL',
      required: true,
      admin: {
        description: 'Paste the full Twitter/X link (e.g. https://x.com/username/status/...)',
      },
    },
    {
      name: 'tweetText',
      type: 'textarea',
      label: 'Tweet Content',
      admin: {
        description: 'The body text of the tweet',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Author Name',
      admin: {
        description: 'Display name of the tweet author',
      },
    },
    {
      name: 'authorHandle',
      type: 'text',
      label: 'Author Handle',
      admin: {
        description: 'Twitter handle of the author (e.g. @username)',
      },
    },
    {
      name: 'date',
      type: 'text',
      label: 'Date',
      admin: {
        description: 'Date the tweet was posted',
      },
    },
  ],
}
