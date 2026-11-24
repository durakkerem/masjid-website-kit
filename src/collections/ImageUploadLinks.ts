import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles'

/**
 * One-time links for uploading a photo from a phone, created by the
 * `createImageUploadLink` MCP tool. Only a SHA-256 hash of the token is
 * stored; the token itself exists only in the link given to the user.
 * Read-only in the admin panel, for auditing.
 */
export const ImageUploadLinks: CollectionConfig = {
  slug: 'image-upload-links',
  labels: { singular: 'Image upload link', plural: 'Image upload links' },
  admin: {
    group: 'MCP',
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'event', 'expiresAt', 'usedAt', 'createdBy'],
    description: 'One-time photo upload links created from the Claude app. Each works once and expires after 30 minutes.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  timestamps: true,
  fields: [
    { name: 'tokenHash', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
    { name: 'expiresAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'alt', type: 'text', admin: { description: 'Suggested description for the image' } },
    { name: 'event', type: 'relationship', relationTo: 'events', admin: { description: 'Event the photo is attached to' } },
    { name: 'createdBy', type: 'relationship', relationTo: 'users' },
    { name: 'usedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'media', type: 'upload', relationTo: 'media' },
  ],
}
