import type { Entry } from './types'

export interface SearchFilters {
  text: string
  type: string
  date: string
}

export const EMPTY_FILTERS: SearchFilters = { text: '', type: '', date: '' }

export function hasFilters(f: SearchFilters): boolean {
  return Boolean(f.text || f.type || f.date)
}

export function filterEntries(entries: Entry[], filters: SearchFilters): Entry[] {
  const text = filters.text.trim().toLowerCase()
  const date = filters.date.trim().toLowerCase()

  return entries.filter((entry) => {
    const matchText =
      !text ||
      [
        entry.title,
        entry.subtitle ?? '',
        entry.content,
        entry.meta.apaCiteAuthor ?? '',
        entry.meta.apaRefArtist ?? '',
        entry.meta.apaResAuthor ?? '',
        entry.tags.join(' '),
      ].some((v) => v.toLowerCase().includes(text))
    const matchType = !filters.type || entry.type === filters.type
    const matchDate = !date || entry.date.toLowerCase().includes(date)
    return matchText && matchType && matchDate
  })
}
