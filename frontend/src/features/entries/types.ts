export const ENTRY_TYPES = ['TEXTE', 'RÉFÉRENCES', 'CITATION', 'INTERVIEW', 'RESSOURCE'] as const
export type EntryType = (typeof ENTRY_TYPES)[number]
export type TextFormat = 'paragraph' | 'bullet' | 'numbered'

export interface DialogueLine {
  spk: 'spk1' | 'spk2'
  text: string
}

export interface EntryMeta {
  apaRefArtist?: string
  apaRefYear?: string
  apaRefTitle?: string
  apaRefSource?: string
  apaCiteAuthor?: string
  apaCiteYear?: string
  apaCiteBook?: string
  apaCitePublisher?: string
  apaCitePage?: string
  apaResAuthor?: string
  apaResDate?: string
  apaResTitle?: string
  apaResJournal?: string
  apaResUrl?: string
  speaker1?: string
  speaker2?: string
  dialogue?: DialogueLine[]
}

export interface Entry {
  id: string
  title: string
  type: EntryType
  subtitle: string | null
  format: TextFormat
  content: string
  image: string | null
  tags: string[]
  meta: EntryMeta
  position: number
  date: string
  createdAt: string
  updatedAt: string
}

export type EntryInput = Partial<Omit<Entry, 'id' | 'position' | 'createdAt' | 'updatedAt'>> & {
  title: string
  type: EntryType
}
