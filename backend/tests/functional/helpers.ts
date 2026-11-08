import type { ApiResponse } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

export async function adminToken() {
  const admin = await User.create({
    email: 'admin@carnet.local',
    fullName: 'Admin',
    password: 'unused-password',
  })
  const token = await User.accessTokens.create(admin)
  return token.value!.release()
}

export const resetDatabase = () => testUtils.db().truncate()

// 1x1 transparent PNG.
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

export async function expectStatus(request: PromiseLike<ApiResponse>, status: number) {
  const response = await request
  response.assertStatus(status)
}
