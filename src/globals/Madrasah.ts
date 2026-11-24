import type { GlobalConfig } from 'payload'

import { isAdminOrCommitteeEditor, publicRead } from '../access/roles'

// Links may be full web addresses or paths on this site, e.g. "/madrasah/newsletter.pdf".
const validateLink = (value: string | null | undefined): true | string => {
  if (!value) return true // `required` handles empty values where it applies
  return /^(https?:\/\/|mailto:|\/)/.test(value.trim())
    ? true
    : 'Start with https:// (or / for a file on this website)'
}

export const Madrasah: GlobalConfig = {
  slug: 'madrasah',
  label: 'Madrasah Page',
  access: {
    read: publicRead,
    update: isAdminOrCommitteeEditor,
  },
  admin: {
    description: 'Everything shown on the /madrasah page.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Madrasah',
                  admin: { width: '50%', description: 'Page heading and menu label, e.g. "Weekend Madrasah".' },
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'Optional logo shown above the heading.' },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              required: true,
              admin: { description: 'Opening paragraph at the top of the page. The page and its menu link appear once this is filled in.' },
            },
            {
              name: 'sessions',
              type: 'array',
              labels: { singular: 'Session', plural: 'Sessions' },
              admin: { description: 'When classes run, e.g. "Weekend Madrasah · Saturday & Sunday · 9:00 – 12:30".' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '34%', description: 'e.g. "Weekend Madrasah"' } },
                    { name: 'days', type: 'text', admin: { width: '33%', description: 'e.g. "Saturday & Sunday"' } },
                    { name: 'times', type: 'text', required: true, admin: { width: '33%', description: 'e.g. "9:00 – 12:30"' } },
                  ],
                },
              ],
            },
            {
              name: 'applyUrl',
              type: 'text',
              label: 'Application link',
              validate: validateLink,
              admin: { description: 'Where parents apply or join the waiting list. Leave blank to hide the Apply buttons.' },
            },
            {
              name: 'contactEmail',
              type: 'email',
              admin: { description: 'Shown for questions about the Madrasah. Leave blank to hide.' },
            },
          ],
        },
        {
          label: 'What we teach',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'curriculumText',
                  type: 'text',
                  admin: { width: '60%', description: 'e.g. "We follow the Safar Publications syllabus."' },
                },
                {
                  name: 'curriculumUrl',
                  type: 'text',
                  label: 'Curriculum link',
                  validate: validateLink,
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'subjects',
              type: 'array',
              labels: { singular: 'Subject', plural: 'Subjects' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            {
              name: 'vision',
              type: 'textarea',
              label: 'Our vision',
            },
            {
              name: 'futureProgrammes',
              type: 'array',
              labels: { singular: 'Programme', plural: 'Future programmes' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            {
              name: 'futureProgrammesNote',
              type: 'textarea',
              admin: { description: 'Optional sentence shown under the future programmes.' },
            },
          ],
        },
        {
          label: 'Teachers',
          fields: [
            {
              name: 'teachersIntro',
              type: 'textarea',
              label: 'About our teachers',
            },
            {
              name: 'headteacher',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', admin: { width: '50%', description: 'e.g. "Ustādh Yusuf Ahmed"' } },
                    { name: 'role', type: 'text', admin: { width: '50%', description: 'e.g. "Headteacher"' } },
                  ],
                },
                { name: 'bio', type: 'textarea' },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Square photos look best.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Portal & newsletters',
          fields: [
            {
              name: 'portalLinks',
              type: 'array',
              labels: { singular: 'Portal login', plural: 'Portal logins' },
              admin: { description: 'Log-in links for the Madrasah portal (parents, students, teachers).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '30%', description: 'e.g. "Parent"' } },
                    { name: 'arabicLabel', type: 'text', admin: { width: '25%', description: 'Optional, e.g. "ولي التلميذ"' } },
                    { name: 'url', type: 'text', required: true, validate: validateLink, admin: { width: '45%' } },
                  ],
                },
              ],
            },
            {
              name: 'newsletterIntro',
              type: 'text',
              admin: { description: 'One line above the newsletters, e.g. "Our monthly newsletter for parents and guardians."' },
            },
            {
              name: 'newsletters',
              type: 'array',
              labels: { singular: 'Newsletter', plural: 'Newsletters' },
              admin: {
                description: 'Newest first. Upload the PDF, or paste a link to it.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '60%', description: 'e.g. "Parents’ newsletter — Issue 4"' } },
                    { name: 'issueDate', type: 'text', label: 'Month', admin: { width: '40%', description: 'e.g. "February 2026"' } },
                  ],
                },
                { name: 'file', type: 'upload', relationTo: 'media' },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Or link',
                  validate: (value: string | null | undefined, { siblingData }: { siblingData: { file?: unknown } }) => {
                    if (!value && !siblingData?.file) return 'Upload a file or enter a link'
                    return validateLink(value)
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
