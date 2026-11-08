import vine from '@vinejs/vine'

export const loginValidator = vine.create({
  password: vine.string().minLength(1).maxLength(1024),
})
