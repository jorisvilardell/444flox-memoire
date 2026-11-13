import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import MemoireService from '#services/memoire_service'
import type Memoire from '#models/memoire'
import { memoireValidator } from '#validators/memoire'

const toDto = (memoire: Memoire | null) => ({
  content: memoire?.content ?? null,
  updatedAt: (memoire?.updatedAt ?? memoire?.createdAt)?.toISO() ?? null,
})

@inject()
export default class MemoireController {
  constructor(private memoireService: MemoireService) {}

  async show() {
    return toDto(await this.memoireService.find())
  }

  async update({ request }: HttpContext) {
    const { content } = await request.validateUsing(memoireValidator)
    return toDto(await this.memoireService.save(content))
  }
}
