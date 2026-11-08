import vine from '@vinejs/vine'
import { ENTRY_FORMATS, ENTRY_TYPES } from '#models/entry_types'

const text = (max = 2000) => vine.string().trim().maxLength(max).optional()

const meta = vine.object({
  apaRefArtist: text(),
  apaRefYear: text(),
  apaRefTitle: text(),
  apaRefSource: text(),
  apaCiteAuthor: text(),
  apaCiteYear: text(),
  apaCiteBook: text(),
  apaCitePublisher: text(),
  apaCitePage: text(),
  apaResAuthor: text(),
  apaResDate: text(),
  apaResTitle: text(),
  apaResJournal: text(),
  apaResUrl: text(),
  speaker1: text(),
  speaker2: text(),
  dialogue: vine
    .array(
      vine.object({
        spk: vine.enum(['spk1', 'spk2'] as const),
        text: vine.string().trim().maxLength(10000),
      })
    )
    .maxLength(500)
    .optional(),
})

export const entryValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(255),
  type: vine.enum(ENTRY_TYPES),
  subtitle: vine.string().trim().maxLength(255).nullable().optional(),
  format: vine.enum(ENTRY_FORMATS).optional(),
  content: vine.string().maxLength(100000).optional(),
  image: vine.string().trim().maxLength(2048).nullable().optional(),
  tags: vine.array(vine.string().trim().minLength(1).maxLength(100)).maxLength(50).optional(),
  meta: meta.optional(),
  date: vine
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/)
    .optional(),
})

export const moveValidator = vine.create({
  direction: vine.enum(['up', 'down'] as const),
})
