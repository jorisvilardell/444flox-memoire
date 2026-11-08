import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('title', 255).notNullable()
      table
        .enum('type', ['TEXTE', 'RÉFÉRENCES', 'CITATION', 'INTERVIEW', 'RESSOURCE'], {
          useNative: false,
          enumName: 'entries_type_check',
        })
        .notNullable()
      table.string('subtitle', 255).nullable()
      table
        .enum('format', ['paragraph', 'bullet', 'numbered'], {
          useNative: false,
          enumName: 'entries_format_check',
        })
        .notNullable()
        .defaultTo('paragraph')
      table.text('content').notNullable().defaultTo('')
      table.text('image_url').nullable()
      table.jsonb('tags').notNullable().defaultTo('[]')
      table.jsonb('meta').notNullable().defaultTo('{}')
      table.integer('position').notNullable()
      table.date('entry_date').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Public list is always read in display order.
      table.index(['position'], 'entries_position_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
