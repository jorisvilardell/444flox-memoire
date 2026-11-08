import Image from '#models/image'
import { NotFoundError } from '#exceptions/domain_error'

export default class ImageService {
  async store(mime: string, data: Buffer) {
    return Image.create({ mime, size: data.length, data })
  }

  async find(id: string) {
    const image = await Image.find(id)
    if (!image) throw new NotFoundError('Image')
    return image
  }
}
