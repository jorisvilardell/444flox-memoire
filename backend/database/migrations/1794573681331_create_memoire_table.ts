import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'memoire'

  async up() {
    // Single-document table: the site hosts exactly one mémoire, pinned to id 1.
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary().defaultTo(1)
      table.jsonb('content').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.check('id = 1', [], 'memoire_singleton_check')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
