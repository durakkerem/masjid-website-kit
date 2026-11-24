import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrCommitteeEditor, publicRead } from '../access/roles'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
  },
  access: {
    read: publicRead,
    create: isAdmin,
    update: isAdminOrCommitteeEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path, e.g. "about" becomes /about',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
