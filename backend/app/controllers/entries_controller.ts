import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import EntryService from '#services/entry_service'
import { toEntryDto } from '#dtos/entry_dto'
import { entryValidator, moveValidator } from '#validators/entry'

@inject()
export default class EntriesController {
  constructor(private entryService: EntryService) {}

  async index() {
    const entries = await this.entryService.list()
    return entries.map(toEntryDto)
  }

  async show({ params }: HttpContext) {
    return toEntryDto(await this.entryService.find(params.id))
  }

  async store({ request, response }: HttpContext) {
    const input = await request.validateUsing(entryValidator)
    const entry = await this.entryService.create(input)
    return response.created(toEntryDto(entry))
  }

  async update({ params, request }: HttpContext) {
    const input = await request.validateUsing(entryValidator)
    return toEntryDto(await this.entryService.update(params.id, input))
  }

  async destroy({ params, response }: HttpContext) {
    await this.entryService.delete(params.id)
    return response.noContent()
  }

  async move({ params, request }: HttpContext) {
    const { direction } = await request.validateUsing(moveValidator)
    const entries = await this.entryService.move(params.id, direction)
    return entries.map(toEntryDto)
  }
}
