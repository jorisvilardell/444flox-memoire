import { test } from '@japa/runner'
import { adminToken, resetDatabase, expectStatus } from './helpers.js'

test.group('auth', (group) => {
  group.each.setup(resetDatabase)

  test('login with the right password returns a token and an expiry', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/api/auth/login').json({ password: 'test-admin-password' })

    response.assertStatus(200)
    assert.isString(response.body().token)
    assert.isAbove(new Date(response.body().expiresAt).getTime(), Date.now())

    const me = await client.get('/api/auth/me').bearerToken(response.body().token)
    me.assertStatus(200)
    me.assertBody({ admin: true })
  })

  test('login with a wrong password is rejected', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({ password: 'nope' })

    response.assertStatus(401)
    response.assertBody({ errors: [{ message: 'Unauthorized' }] })
  })

  test('login without a password fails validation', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({})

    response.assertStatus(422)
  })

  test('admin routes answer 401 without a token', async ({ client }) => {
    await expectStatus(client.get('/api/auth/me'), 401)
    await expectStatus(client.post('/api/entries').json({ title: 'x', type: 'TEXTE' }), 401)
    await expectStatus(client.post('/api/images'), 401)
  })

  test('logout revokes the token', async ({ client }) => {
    const token = await adminToken()

    await expectStatus(client.post('/api/auth/logout').bearerToken(token), 204)
    await expectStatus(client.get('/api/auth/me').bearerToken(token), 401)
  })

  test('health is public', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBody({ status: 'ok' })
  })
})
