import type { CollectionConfig } from 'payload'

import { isAdminOrCommitteeEditor, publicRead } from '../access/roles'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  versions: {
    drafts: { autosave: true },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayInCarousel', 'publishedAt', 'expiresAt'],
  },
  access: {
    read: publicRead,
    create: isAdminOrCommitteeEditor,
    update: isAdminOrCommitteeEditor,
    delete: isAdminOrCommitteeEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'displayInCarousel',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this announcement in the homepage carousel',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Optional. After this date the announcement will be hidden from the public site.',
          },
        },
      ],
    },
  ],
}
