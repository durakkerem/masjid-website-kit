import type { GlobalConfig } from 'payload'

import { isAdmin, publicRead } from '../access/roles'

const validateLink = (value: string | null | undefined): true | string => {
  if (!value) return true
  return /^(https?:\/\/|mailto:|\/)/.test(value.trim()) ? true : 'Start with https:// (or / for a page on this website)'
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: publicRead,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'mosqueName',
              type: 'text',
              required: true,
              defaultValue: 'Example Masjid',
              admin: { description: 'Full name, shown in the header, footer, page titles and on the TV screen.' },
            },
            {
              name: 'shortName',
              type: 'text',
              admin: { description: 'Optional short name for browser tabs, e.g. "EMC". Leave blank to use the full name.' },
            },
            {
              name: 'tagline',
              type: 'text',
              admin: { description: 'One line under the welcome on the homepage, e.g. "Prayer times, events and news for our community".' },
            },
            { name: 'address', type: 'textarea' },
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'email' },
            {
              name: 'mawaqitMosqueSlug',
              type: 'text',
              label: 'Mawaqit page',
              admin: {
                description:
                  'The last part of your mosque\'s mawaqit.net address. For https://mawaqit.net/en/my-masjid-city enter "my-masjid-city". The prayer-times widget is hidden until this is set.',
              },
            },
            {
              name: 'social',
              type: 'group',
              fields: [
                { name: 'facebook', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'youtube', type: 'text' },
                { name: 'twitter', type: 'text' },
              ],
            },
            {
              name: 'youtubeChannelId',
              type: 'text',
              admin: {
                description:
                  'YouTube channel ID (starts with "UC…"). Powers the "Latest videos" strip on the homepage via the channel\'s public RSS feed. Find it on the channel page → Share → Copy channel ID. Leave blank to hide the strip.',
              },
            },
          ],
        },
        {
          label: 'Donate page',
          fields: [
            {
              name: 'donateIntro',
              type: 'textarea',
              admin: { description: 'Opening paragraph on the /donate page.' },
            },
            {
              name: 'charityNumber',
              type: 'text',
              admin: { description: 'Registered charity number, if you have one. Shown on the donate page.' },
            },
            {
              name: 'donationLinks',
              type: 'array',
              labels: { singular: 'Online donation link', plural: 'Online donation links' },
              admin: { description: 'One card per cause, e.g. "General fund", "Zakat", "Building project". Links to your payment page (JustGiving, Stripe, Square, LaunchGood…).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'description', type: 'text', admin: { width: '35%' } },
                    { name: 'url', type: 'text', required: true, validate: validateLink, admin: { width: '35%' } },
                  ],
                },
              ],
            },
            {
              name: 'bankAccounts',
              type: 'array',
              labels: { singular: 'Bank account', plural: 'Bank accounts' },
              admin: { description: 'Shown on the donate page for direct transfers. Only add details you are happy to publish.' },
              fields: [
                { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "Masjid general account"' } },
                {
                  name: 'details',
                  type: 'array',
                  labels: { singular: 'Line', plural: 'Lines' },
                  admin: { description: 'e.g. "Sort code" / "12-34-56", "Account number" / "12345678", "IBAN" / "…"' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
                        { name: 'value', type: 'text', required: true, admin: { width: '60%' } },
                      ],
                    },
                  ],
                },
                { name: 'note', type: 'text', admin: { description: 'e.g. "Eligible for Gift Aid"' } },
              ],
            },
          ],
        },
        {
          label: 'Entrance TV',
          fields: [
            {
              name: 'contacts',
              type: 'array',
              label: 'Contact details (entrance TV)',
              labels: { singular: 'Contact', plural: 'Contacts' },
              maxRows: 5,
              admin: {
                description: 'Shown in the strip along the bottom of the entrance TV screen (/tv). Keep it to four or five short items.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'e.g. "Madrasah"' } },
                    { name: 'value', type: 'text', required: true, admin: { width: '45%', description: 'e.g. "madrasah@example.org"' } },
                    {
                      name: 'kind',
                      type: 'select',
                      required: true,
                      defaultValue: 'email',
                      options: [
                        { label: 'Email', value: 'email' },
                        { label: 'Phone', value: 'phone' },
                        { label: 'Website', value: 'website' },
                      ],
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'services',
              type: 'array',
              label: 'Services (entrance TV)',
              labels: { singular: 'Service', plural: 'Services' },
              admin: {
                description: 'Shown one at a time in the rotating panel on the entrance TV screen (/tv). Keep descriptions to one short line.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '40%', description: 'e.g. "Nikkah ceremonies"' } },
                    {
                      name: 'icon',
                      type: 'select',
                      required: true,
                      defaultValue: 'mosque',
                      options: [
                        { label: 'Mosque', value: 'mosque' },
                        { label: 'People', value: 'people' },
                        { label: 'Book', value: 'book' },
                        { label: 'Microphone', value: 'microphone' },
                        { label: 'Heart', value: 'heart' },
                        { label: 'Support', value: 'support' },
                        { label: 'Care', value: 'care' },
                        { label: 'Lecture', value: 'lecture' },
                        { label: 'Education', value: 'education' },
                      ],
                      admin: { width: '20%' },
                    },
                    { name: 'description', type: 'text', maxLength: 90, admin: { width: '40%', description: 'One short line' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
