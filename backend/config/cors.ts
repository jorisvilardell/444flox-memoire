import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const allowed = env
  .get('CORS_ORIGIN')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// `*` reflects any origin; intended for local development only.
const origin = allowed.includes('*') ? true : allowed

export default defineConfig({
  enabled: true,
  origin,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  // Bearer tokens only; no cookies are used.
  credentials: false,
  maxAge: 90,
})
