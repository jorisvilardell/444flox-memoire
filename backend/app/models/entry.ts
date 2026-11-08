import { EntrySchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import type { EntryFormat, EntryMeta, EntryType } from '#models/entry_types'

// pg serializes JS arrays as SQL arrays, so jsonb values must be stringified explicitly.
const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value),
}

export default class Entry extends EntrySchema {
  @column()
  declare type: EntryType

  @column()
  declare format: EntryFormat

  @column(jsonColumn)
  declare tags: string[]

  @column(jsonColumn)
  declare meta: EntryMeta
}
