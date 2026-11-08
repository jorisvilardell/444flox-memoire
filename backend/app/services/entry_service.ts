import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Entry from '#models/entry'
import type { EntryFormat, EntryMeta, EntryType } from '#models/entry_types'
import { InvalidInputError, NotFoundError } from '#exceptions/domain_error'

export interface EntryInput {
  title: string
  type: EntryType
  subtitle?: string | null
  format?: EntryFormat
  content?: string
  image?: string | null
  tags?: string[]
  meta?: EntryMeta
  date?: string
}

// Serializes position-changing operations so concurrent writers cannot create duplicates.
const POSITION_LOCK_KEY = 4440001

export default class EntryService {
  list() {
    return Entry.query().orderBy('position', 'asc')
  }

  async find(id: string) {
    const entry = await Entry.find(id)
    if (!entry) throw new NotFoundError('Entry')
    return entry
  }

  async create(input: EntryInput) {
    const entryDate = this.parseDate(input.date) ?? DateTime.utc().startOf('day')

    return db.transaction(async (trx) => {
      await trx.rawQuery('select pg_advisory_xact_lock(?)', [POSITION_LOCK_KEY])
      const row = await trx.from('entries').max('position as max').first()
      const position = ((row?.max as number | null) ?? 0) + 1

      return Entry.create(
        {
          title: input.title,
          type: input.type,
          subtitle: input.subtitle ?? null,
          format: input.format ?? 'paragraph',
          content: input.content ?? '',
          imageUrl: input.image ?? null,
          tags: input.tags ?? [],
          meta: input.meta ?? {},
          position,
          entryDate,
        },
        { client: trx }
      )
    })
  }

  /** Omitted optional fields keep their stored value; provided ones replace it. */
  async update(id: string, input: EntryInput) {
    const entry = await this.find(id)
    const entryDate = this.parseDate(input.date)

    entry.merge({
      title: input.title,
      type: input.type,
      ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
      ...(input.format !== undefined && { format: input.format }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.image !== undefined && { imageUrl: input.image }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.meta !== undefined && { meta: input.meta }),
      ...(entryDate && { entryDate }),
    })
    await entry.save()
    return entry
  }

  async delete(id: string) {
    const entry = await this.find(id)
    await entry.delete()
  }

  /** `up` moves toward the start of the list (lower position), `down` toward the end. */
  async move(id: string, direction: 'up' | 'down') {
    await db.transaction(async (trx) => {
      await trx.rawQuery('select pg_advisory_xact_lock(?)', [POSITION_LOCK_KEY])

      const current = await Entry.query({ client: trx }).where('id', id).first()
      if (!current) throw new NotFoundError('Entry')

      const up = direction === 'up'
      const neighbour = await Entry.query({ client: trx })
        .where('position', up ? '<' : '>', current.position)
        .orderBy('position', up ? 'desc' : 'asc')
        .first()
      if (!neighbour) return

      const position = current.position
      current.position = neighbour.position
      neighbour.position = position
      await current.save()
      await neighbour.save()
    })
    return this.list()
  }

  private parseDate(value?: string) {
    if (value === undefined) return null
    const parsed = DateTime.fromFormat(value, 'dd/MM/yyyy', { zone: 'utc' })
    if (!parsed.isValid) throw new InvalidInputError('date must be a valid DD/MM/YYYY date', 'date')
    return parsed
  }
}
