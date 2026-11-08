import { test } from '@japa/runner'
import { adminToken, resetDatabase, expectStatus } from './helpers.js'

test.group('entries', (group) => {
  group.each.setup(resetDatabase)

  test('create applies defaults and appends at the end', async ({ client, assert }) => {
    const token = await adminToken()

    const first = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'One', type: 'TEXTE', date: '05/11/2026' })
    const second = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'Two', type: 'CITATION', tags: ['A'], meta: { apaCiteAuthor: 'Klein, N.' } })

    first.assertStatus(201)
    assert.containsSubset(first.body(), {
      title: 'One',
      type: 'TEXTE',
      subtitle: null,
      format: 'paragraph',
      content: '',
      image: null,
      tags: [],
      meta: {},
      position: 1,
      date: '05/11/2026',
    })
    second.assertStatus(201)
    assert.equal(second.body().position, 2)
    assert.deepEqual(second.body().meta, { apaCiteAuthor: 'Klein, N.' })
    assert.match(second.body().date, /^\d{2}\/\d{2}\/\d{4}$/)
  })

  test('create validates title, type and date', async ({ client }) => {
    const token = await adminToken()

    await expectStatus(client.post('/api/entries').bearerToken(token).json({ type: 'TEXTE' }), 422)
    await expectStatus(
      client.post('/api/entries').bearerToken(token).json({ title: 'x', type: 'NOPE' }),
      422
    )

    const badDate = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'x', type: 'TEXTE', date: '31/02/2026' })
    badDate.assertStatus(422)
    badDate.assertBodyContains({ errors: [{ field: 'date' }] })
  })

  test('list is public and sorted by position; show returns one or 404', async ({
    client,
    assert,
  }) => {
    const token = await adminToken()
    const created = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'A', type: 'TEXTE' })
    await client.post('/api/entries').bearerToken(token).json({ title: 'B', type: 'TEXTE' })

    const list = await client.get('/api/entries')
    list.assertStatus(200)
    assert.deepEqual(
      list.body().map((e: { title: string }) => e.title),
      ['A', 'B']
    )

    const show = await client.get(`/api/entries/${created.body().id}`)
    show.assertStatus(200)
    assert.equal(show.body().title, 'A')

    const missing = await client.get('/api/entries/00000000-0000-4000-8000-000000000000')
    missing.assertStatus(404)
    missing.assertBodyContains({ errors: [{ message: 'Entry not found' }] })
    await expectStatus(client.get('/api/entries/not-a-uuid'), 404)
  })

  test('update replaces provided fields and keeps omitted ones', async ({ client, assert }) => {
    const token = await adminToken()
    const created = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'Old', type: 'TEXTE', content: 'kept', tags: ['X'], subtitle: 'sub' })

    const updated = await client
      .put(`/api/entries/${created.body().id}`)
      .bearerToken(token)
      .json({ title: 'New', type: 'RESSOURCE', subtitle: null })

    updated.assertStatus(200)
    assert.containsSubset(updated.body(), {
      title: 'New',
      type: 'RESSOURCE',
      subtitle: null,
      content: 'kept',
      tags: ['X'],
      position: 1,
    })
  })

  test('delete removes the entry', async ({ client }) => {
    const token = await adminToken()
    const created = await client
      .post('/api/entries')
      .bearerToken(token)
      .json({ title: 'Bye', type: 'TEXTE' })

    await expectStatus(client.delete(`/api/entries/${created.body().id}`).bearerToken(token), 204)
    await expectStatus(client.get(`/api/entries/${created.body().id}`), 404)
    await expectStatus(client.delete(`/api/entries/${created.body().id}`).bearerToken(token), 404)
  })

  test('move swaps with the neighbour and is a no-op at the edges', async ({ client, assert }) => {
    const token = await adminToken()
    const ids: string[] = []
    for (const title of ['A', 'B', 'C']) {
      const response = await client
        .post('/api/entries')
        .bearerToken(token)
        .json({ title, type: 'TEXTE' })
      ids.push(response.body().id)
    }
    const titles = (body: { title: string }[]) => body.map((e) => e.title)

    const down = await client
      .patch(`/api/entries/${ids[0]}/move`)
      .bearerToken(token)
      .json({ direction: 'down' })
    down.assertStatus(200)
    assert.deepEqual(titles(down.body()), ['B', 'A', 'C'])

    const up = await client
      .patch(`/api/entries/${ids[2]}/move`)
      .bearerToken(token)
      .json({ direction: 'up' })
    assert.deepEqual(titles(up.body()), ['B', 'C', 'A'])

    const edge = await client
      .patch(`/api/entries/${ids[1]}/move`)
      .bearerToken(token)
      .json({ direction: 'up' })
    assert.deepEqual(titles(edge.body()), ['B', 'C', 'A'])

    const invalid = await client
      .patch(`/api/entries/${ids[0]}/move`)
      .bearerToken(token)
      .json({ direction: 'left' })
    invalid.assertStatus(422)
  })
})
