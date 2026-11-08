import vine from '@vinejs/vine'

export const imageUploadValidator = vine.create({
  file: vine.file({
    size: '5mb',
    extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
  }),
})
