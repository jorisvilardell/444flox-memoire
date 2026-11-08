import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const ssl = env.get('DB_SSL') ? { rejectUnauthorized: false } : false
// Schema classes are generated from a dev database; the production image ships them prebuilt.
const generateSchema = env.get('NODE_ENV') !== 'production'
const databaseUrl = env.get('DATABASE_URL')

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    pg: {
      client: 'pg',
      connection: databaseUrl
        ? { connectionString: databaseUrl, ssl }
        : {
            host: env.get('DB_HOST'),
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
            ssl,
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      schemaGeneration: {
        enabled: generateSchema,
        rulesPaths: ['./database/schema_rules.js'],
      },
    },
  },
})

export default dbConfig
