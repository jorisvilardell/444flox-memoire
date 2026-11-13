import vine from '@vinejs/vine'

// The editor's schema decides which nodes render; the API only checks the document envelope.
export const memoireValidator = vine.create({
  content: vine
    .object({
      type: vine.literal('doc'),
      content: vine.array(vine.any()).maxLength(20000).optional(),
    })
    .allowUnknownProperties(),
})
