import type { GlobalConfig } from 'payload'

import { isAdminOrCommitteeEditor, publicRead } from '../access/roles'
import { parseTime } from '../lib/jumuah'

const validateTime = (value: string | null | undefined): true | string => {
  if (!value) return true // `required` handles empty values where it applies
  return parseTime(value) === null ? 'Use 24-hour time, e.g. 12:50' : true
}

export const JumuahTimes: GlobalConfig = {
  slug: 'jumuah-times',
  access: {
    read: publicRead,
    update: isAdminOrCommitteeEditor,
  },
  fields: [
    {
      name: 'note',
      type: 'textarea',
      admin: {
        description: 'Optional note shown above the Jumuah times (e.g. special arrangements, Ramadan changes).',
      },
    },
    {
      name: 'sessions',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Session', plural: 'Sessions' },
      admin: {
        description:
          'One row per Jumu\'ah prayer. Add a row for each time and venue — e.g. an early prayer at the mosque, the main prayer at the mosque, and the main prayer at the leisure centre. The website sorts them by time.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '34%', description: 'e.g. "Early Jumu\'ah", "Main Jumu\'ah"' },
            },
            {
              name: 'jamaatTime',
              type: 'text',
              required: true,
              label: 'Prayer time',
              validate: validateTime,
              admin: { width: '33%', description: '24-hour time, e.g. "12:50"' },
            },
            {
              name: 'khutbahTime',
              type: 'text',
              label: 'Khutbah time (optional)',
              validate: validateTime,
              admin: { width: '33%', description: 'Only if you want it shown separately, e.g. "12:30"' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'location',
              type: 'text',
              admin: {
                width: '66%',
                description: 'e.g. "Main hall" or "Community centre – sports hall". Blank means the main masjid.',
              },
            },
            {
              name: 'postcode',
              type: 'text',
              admin: { width: '34%', description: 'Used for the map link, e.g. "AB1 2CD"' },
            },
          ],
        },
      ],
    },
  ],
}
