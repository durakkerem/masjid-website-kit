import type { CollectionConfig } from 'payload'

import { isAdminOrCommitteeEditor, publicRead } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: publicRead,
    create: isAdminOrCommitteeEditor,
    update: isAdminOrCommitteeEditor,
    delete: isAdminOrCommitteeEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
