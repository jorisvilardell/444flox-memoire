import { readFile } from 'node:fs/promises'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ImageService from '#services/image_service'
import { InvalidInputError } from '#exceptions/domain_error'
import { imageUploadValidator } from '#validators/image'

@inject()
export default class ImagesController {
  constructor(private imageService: ImageService) {}

  async store({ request, response }: HttpContext) {
    const { file } = await request.validateUsing(imageUploadValidator)
    if (file.type !== 'image' || !file.tmpPath) {
      throw new InvalidInputError('file must be an image', 'file')
    }

    const image = await this.imageService.store(
      `${file.type}/${file.subtype}`,
      await readFile(file.tmpPath)
    )
    return response.created({ id: image.id, url: `/api/images/${image.id}` })
  }

  async show({ params, response }: HttpContext) {
    const image = await this.imageService.find(params.id)
    return response
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('X-Content-Type-Options', 'nosniff')
      .type(image.mime)
      .send(image.data)
  }
}
