import type Entry from '#models/entry'
import type { EntryFormat, EntryMeta, EntryType } from '#models/entry_types'

export interface EntryDto {
  id: string
  title: string
  type: EntryType
  subtitle: string | null
  format: EntryFormat
  content: string
  image: string | null
  tags: string[]
  meta: EntryMeta
  position: number
  date: string
  createdAt: string
  updatedAt: string
}

export function toEntryDto(entry: Entry): EntryDto {
  return {
    id: entry.id,
    title: entry.title,
    type: entry.type,
    subtitle: entry.subtitle,
    format: entry.format,
    content: entry.content,
    image: entry.imageUrl,
    tags: entry.tags,
    meta: entry.meta,
    position: entry.position,
    date: entry.entryDate.toFormat('dd/MM/yyyy'),
    createdAt: entry.createdAt.toUTC().toISO()!,
    updatedAt: (entry.updatedAt ?? entry.createdAt).toUTC().toISO()!,
  }
}
