import type { CollectionConfig, FieldHook } from 'payload'

import { isAdminOrCommitteeEditor, publicRead } from '../access/roles'
import { slugify } from '../lib/slugify'

/**
 * Auto-fill the slug from the title when left blank, and guarantee uniqueness
 * by appending -2, -3, … if another doc already owns the candidate slug.
 * Existing slugs are never rewritten (only runs when value is empty).
 */
const ensureUniqueSlug: FieldHook = async ({ value, data, originalDoc, req }) => {
  let candidate = (typeof value === 'string' && value.trim()) || ''
  if (!candidate) candidate = slugify(data?.title ?? originalDoc?.title ?? '')
  else candidate = slugify(candidate)
  if (!candidate) return value

  const currentId = originalDoc?.id ?? data?.id
  let unique = candidate
  let n = 2
  // Query for collisions, skipping the current document.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await req.payload.find({
      collection: 'events',
      where: {
        and: [
          { slug: { equals: unique } },
          ...(currentId ? [{ id: { not_equals: currentId } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.docs.length === 0) break
    unique = `${candidate}-${n++}`
  }
  return unique
}

export const Events: CollectionConfig = {
  slug: 'events',
  versions: {
    drafts: { autosave: true },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'location', 'status'],
    listSearchableFields: ['title', 'description'],
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
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-filled from the title if left blank. Lowercase letters, numbers and dashes only.',
      },
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Class / Lecture', value: 'class' },
        { label: 'Community', value: 'community' },
        { label: 'Youth', value: 'youth' },
        { label: 'Fundraising', value: 'fundraising' },
        { label: 'Eid', value: 'eid' },
        { label: 'Ramadan', value: 'ramadan' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
          },
        },
      ],
    },
    {
      name: 'allDay',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'venueName',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'mapUrl',
          type: 'text',
          admin: { description: 'Optional Google Maps / OpenStreetMap link' },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // Legacy field, superseded by `recurring` below. Kept (hidden) so its
      // column is not dropped, keeping migrations as clean additions.
      name: 'recurrence',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Does not repeat', value: 'none' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      admin: { hidden: true, disableListColumn: true },
    },
    {
      name: 'recurring',
      type: 'group',
      admin: {
        description: 'Repeat this event on a schedule (shown on the calendar).',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'This event repeats',
        },
        {
          type: 'row',
          admin: { condition: (_, sibling) => Boolean(sibling?.enabled) },
          fields: [
            {
              name: 'frequency',
              type: 'select',
              defaultValue: 'weekly',
              options: [
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'interval',
              type: 'number',
              defaultValue: 1,
              min: 1,
              admin: {
                width: '50%',
                description: 'Repeat every N weeks/months (1 = every week/month).',
              },
            },
          ],
        },
        {
          name: 'daysOfWeek',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Sunday', value: '0' },
            { label: 'Monday', value: '1' },
            { label: 'Tuesday', value: '2' },
            { label: 'Wednesday', value: '3' },
            { label: 'Thursday', value: '4' },
            { label: 'Friday', value: '5' },
            { label: 'Saturday', value: '6' },
          ],
          admin: {
            description: 'Weekly only: which day(s) it runs. Defaults to the start date’s weekday.',
            condition: (_, sibling) => Boolean(sibling?.enabled) && sibling?.frequency !== 'monthly',
          },
        },
        {
          name: 'until',
          type: 'date',
          admin: {
            description: 'Optional: stop repeating after this date.',
            date: { pickerAppearance: 'dayOnly' },
            condition: (_, sibling) => Boolean(sibling?.enabled),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'registrationUrl',
          type: 'text',
          admin: { width: '50%', description: 'Optional link for people to register/RSVP.' },
        },
        {
          name: 'paymentUrl',
          type: 'text',
          admin: { width: '50%', description: 'Optional link to pay/book tickets.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ageGroups',
          type: 'text',
          admin: { width: '50%', description: 'e.g. "Ages 7–14", "Adults", "All ages".' },
        },
        {
          name: 'restrictions',
          type: 'text',
          admin: { width: '50%', description: 'Any restrictions (e.g. "Sisters only").' },
        },
      ],
    },
    {
      name: 'rooms',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Main Hall', value: 'main_hall' },
        { label: 'Social Hall', value: 'social_hall' },
        { label: 'Gym', value: 'gym' },
      ],
      admin: {
        description: 'Internal room booking — not shown on the public site.',
      },
    },
    {
      name: 'logistics',
      type: 'group',
      admin: {
        description: 'Internal arrangements checklist — not shown on the public site.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'foodRequired', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
            { name: 'stageRequired', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
            { name: 'soundSystemRequired', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
            { name: 'externalVenue', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
          ],
        },
      ],
    },
  ],
}
