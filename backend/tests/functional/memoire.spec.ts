import { test } from '@japa/runner'
import { adminToken, resetDatabase, expectStatus } from './helpers.js'

const doc = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})

test.group('memoire', (group) => {
  group.each.setup(resetDatabase)

  test('reads as empty before anything is saved', async ({ client }) => {
    const response = await client.get('/api/memoire')
    response.assertStatus(200)
    response.assertBody({ content: null, updatedAt: null })
  })

  test('admin saves then anyone reads the latest version', async ({ client, assert }) => {
    const token = await adminToken()

    const first = await client
      .put('/api/memoire')
      .bearerToken(token)
      .json({ content: doc('Premier jet') })
    first.assertStatus(200)
    assert.deepEqual(first.body().content, doc('Premier jet'))
    assert.match(first.body().updatedAt, /^\d{4}-\d{2}-\d{2}T/)

    await client
      .put('/api/memoire')
      .bearerToken(token)
      .json({ content: doc('Version finale') })

    const read = await client.get('/api/memoire')
    read.assertStatus(200)
    assert.deepEqual(read.body().content, doc('Version finale'))
  })

  test('keeps the spaces around formatted text runs', async ({ client, assert }) => {
    const token = await adminToken()
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'seules les ' },
            { type: 'text', text: 'différences', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' comptent' },
          ],
        },
      ],
    }

    await client.put('/api/memoire').bearerToken(token).json({ content })

    const read = await client.get('/api/memoire')
    assert.deepEqual(read.body().content, content)
  })

  test('saving requires a token', async ({ client }) => {
    await expectStatus(client.put('/api/memoire').json({ content: doc('x') }), 401)
  })

  test('content must be an editor document', async ({ client }) => {
    const token = await adminToken()

    await expectStatus(client.put('/api/memoire').bearerToken(token).json({}), 422)
    await expectStatus(
      client
        .put('/api/memoire')
        .bearerToken(token)
        .json({ content: { type: 'paragraph' } }),
      422
    )
    await expectStatus(
      client.put('/api/memoire').bearerToken(token).json({ content: '<p>html</p>' }),
      422
    )
  })

  test('content over 2 MB is rejected', async ({ client }) => {
    const token = await adminToken()
    const response = await client
      .put('/api/memoire')
      .bearerToken(token)
      .json({ content: doc('a'.repeat(2 * 1024 * 1024)) })
    response.assertStatus(422)
  })
})
