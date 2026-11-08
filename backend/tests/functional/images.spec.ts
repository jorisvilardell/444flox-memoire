import { test } from '@japa/runner'
import { adminToken, PNG, resetDatabase, expectStatus } from './helpers.js'

test.group('images', (group) => {
  group.each.setup(resetDatabase)

  test('upload then fetch returns the bytes with cache headers', async ({ client, assert }) => {
    const token = await adminToken()

    const upload = await client
      .post('/api/images')
      .bearerToken(token)
      .file('file', PNG, { filename: 'pixel.png', contentType: 'image/png' })
    upload.assertStatus(201)
    assert.match(upload.body().url, /^\/api\/images\/[0-9a-f-]{36}$/)
    assert.equal(upload.body().url, `/api/images/${upload.body().id}`)

    const fetched = await client.get(upload.body().url)
    fetched.assertStatus(200)
    fetched.assertHeader('content-type', 'image/png')
    fetched.assertHeader('cache-control', 'public, max-age=31536000, immutable')
    assert.isTrue(Buffer.from(fetched.response.body).equals(PNG))
  })

  test('non-image files are rejected', async ({ client }) => {
    const token = await adminToken()

    const response = await client
      .post('/api/images')
      .bearerToken(token)
      .file('file', Buffer.from('hello'), { filename: 'note.txt', contentType: 'text/plain' })
    response.assertStatus(422)
  })

  test('text disguised as a png is rejected', async ({ client }) => {
    const token = await adminToken()

    const response = await client
      .post('/api/images')
      .bearerToken(token)
      .file('file', Buffer.from('<script>alert(1)</script>'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
    response.assertStatus(422)
  })

  test('files over 5 MB are rejected', async ({ client }) => {
    const token = await adminToken()
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)])

    const response = await client
      .post('/api/images')
      .bearerToken(token)
      .file('file', big, { filename: 'big.png', contentType: 'image/png' })
    response.assertStatus(422)
  })

  test('unknown image answers 404', async ({ client }) => {
    await expectStatus(client.get('/api/images/00000000-0000-4000-8000-000000000000'), 404)
  })
})
