import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  hooks: {
    beforeChange: [
      // The very first account (created on the "Create first user" screen at
      // /admin) becomes an administrator, so a fresh install can be set up.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
        return totalDocs === 0 ? { ...data, role: 'admin' } : data
      },
    ],
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    // Only real user accounts count here. IDs are per collection, so without the
    // collection check an MCP API-key document with id 1 would "be" user 1.
    update: ({ req: { user }, id }) => {
      if (user?.collection !== 'users') return false
      if (user.role === 'admin') return true
      return user.id === id
    },
    read: ({ req: { user } }) => user?.collection === 'users',
    // Lifting a lockout (too many wrong passwords or 2FA codes) is admin-only.
    unlock: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'committee_editor',
      access: {
        update: isAdminField,
      },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Committee Editor', value: 'committee_editor' },
      ],
      admin: {
        description: 'Administrators can manage users and settings. Committee Editors can edit events, announcements, and prayer times.',
      },
    },
  ],
}
