import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Unit tests for the pure helpers in src/lib (dates, recurrence, Jumu'ah,
// image safety checks). They need no database and run in plain Node.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['tests/**/*.int.spec.ts'],
  },
})
