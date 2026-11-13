import { MemoireSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export interface MemoireDoc {
  type: 'doc'
  content?: unknown[]
}

export default class Memoire extends MemoireSchema {
  static table = 'memoire'

  @column({ prepare: (value: unknown) => JSON.stringify(value) })
  declare content: MemoireDoc
}
