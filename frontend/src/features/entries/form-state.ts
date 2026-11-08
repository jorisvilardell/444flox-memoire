import type { DialogueLine, Entry, EntryInput, EntryMeta, EntryType, TextFormat } from './types'

export interface DialogueDraft extends DialogueLine {
  key: number
}

export interface FormState {
  title: string
  type: EntryType
  subtitle: string
  format: TextFormat
  content: string
  imageUrl: string
  meta: Record<string, string>
  dialogue: DialogueDraft[]
}

let dialogueKey = 0
export function newDialogue(spk: DialogueLine['spk'] = 'spk1', text = ''): DialogueDraft {
  return { key: ++dialogueKey, spk, text }
}

export function emptyForm(): FormState {
  return {
    title: '',
    type: 'TEXTE',
    subtitle: '',
    format: 'paragraph',
    content: '',
    imageUrl: '',
    meta: {},
    dialogue: [newDialogue()],
  }
}

export function formFromEntry(entry: Entry): FormState {
  const { dialogue, ...rest } = entry.meta
  return {
    title: entry.title,
    type: entry.type,
    subtitle: entry.subtitle ?? '',
    format: entry.format,
    content: entry.content,
    imageUrl: '',
    meta: Object.fromEntries(Object.entries(rest).filter((kv): kv is [string, string] => typeof kv[1] === 'string')),
    dialogue: (dialogue ?? []).map((d) => newDialogue(d.spk, d.text)),
  }
}

const META_KEYS: Record<EntryType, (keyof EntryMeta)[]> = {
  TEXTE: [],
  RÉFÉRENCES: ['apaRefArtist', 'apaRefYear', 'apaRefTitle', 'apaRefSource'],
  CITATION: ['apaCiteAuthor', 'apaCiteYear', 'apaCiteBook', 'apaCitePublisher', 'apaCitePage'],
  INTERVIEW: ['speaker1', 'speaker2'],
  RESSOURCE: ['apaResAuthor', 'apaResDate', 'apaResTitle', 'apaResJournal', 'apaResUrl'],
}

/** `image` is resolved by the caller (upload result, typed URL or the entry's existing image). */
export function toInput(form: FormState, image: string | null, existing: Entry | null): EntryInput {
  const meta: EntryMeta = {}
  for (const key of META_KEYS[form.type]) {
    if (key === 'dialogue') continue
    meta[key] = form.meta[key] ?? ''
  }
  if (form.type === 'INTERVIEW') meta.dialogue = form.dialogue.map(({ spk, text }) => ({ spk, text }))

  return {
    title: form.title.trim(),
    type: form.type,
    subtitle: form.type === 'TEXTE' ? form.subtitle || null : null,
    format: form.type === 'TEXTE' ? form.format : 'paragraph',
    content: form.type === 'INTERVIEW' ? '' : form.content,
    image,
    tags: existing?.tags ?? [form.type, 'PROJET'],
    meta,
    ...(existing ? { date: existing.date } : {}),
  }
}
