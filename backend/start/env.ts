import { Env } from '@adonisjs/core/env'

const env = await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  APP_KEY: Env.schema.secret(),

  // Database: either DATABASE_URL, or the discrete DB_* variables.
  DATABASE_URL: Env.schema.string.optional(),
  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),
  DB_SSL: Env.schema.boolean.optional(),

  ADMIN_PASSWORD: Env.schema.secret(),
  CORS_ORIGIN: Env.schema.string(),
})

if (!env.get('DATABASE_URL')) {
  const missing = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_DATABASE'].filter(
    (key) => env.get(key as 'DB_HOST') === undefined
  )
  if (missing.length > 0) {
    throw new Error(`Set DATABASE_URL or the missing variables: ${missing.join(', ')}`)
  }
}

export default env
