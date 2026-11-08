export const ENTRY_TYPES = ['TEXTE', 'RÉFÉRENCES', 'CITATION', 'INTERVIEW', 'RESSOURCE'] as const
export type EntryType = (typeof ENTRY_TYPES)[number]

export const ENTRY_FORMATS = ['paragraph', 'bullet', 'numbered'] as const
export type EntryFormat = (typeof ENTRY_FORMATS)[number]

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
