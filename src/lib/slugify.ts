/**
 * Turn arbitrary text into a URL-friendly slug: lowercase, ASCII, dashes.
 * "Halaqah: Stories of the Prophets!" -> "halaqah-stories-of-the-prophets"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics -> dash
    .replace(/^-+|-+$/g, '') // trim leading/trailing dashes
    .slice(0, 80)
}
