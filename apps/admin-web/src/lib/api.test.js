import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminApi } from './api.js'

test('admin API adds bearer token and normalizes successful data', async () => {
  let authorization
  const api = createAdminApi({
    baseUrl: 'http://localhost:3000/api/v1',
    getToken: () => 'session-token',
    fetchImpl: async (_url, options) => {
      authorization = options.headers.Authorization
      return new Response(JSON.stringify({ success: true, data: { pendingOrders: 2 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  })

  const result = await api.get('/admin/dashboard')
  assert.equal(authorization, 'Bearer session-token')
  assert.equal(result.pendingOrders, 2)
})

test('admin API resolves paths without a leading slash under the versioned base URL', async () => {
  let requestUrl
  const api = createAdminApi({
    baseUrl: 'http://localhost:3000/api/v1',
    fetchImpl: async (url) => {
      requestUrl = url
      return new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  })

  await api.get('admin/dashboard')

  assert.equal(requestUrl, 'http://localhost:3000/api/v1/admin/dashboard')
})

test('admin API preserves the empty response shape for 204 deletes', async () => {
  const api = createAdminApi({
    baseUrl: 'http://localhost:3000/api/v1',
    fetchImpl: async () => new Response(null, { status: 204 }),
  })

  assert.deepEqual(await api.delete('/admin/categories/1'), {
    data: null,
    meta: undefined,
    payload: null,
  })
})

test('admin API throws normalized 401 error', async () => {
  const api = createAdminApi({
    baseUrl: 'http://localhost:3000/api/v1',
    getToken: () => 'expired-token',
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Session is invalid' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
  })

  await assert.rejects(
    api.get('/admin/dashboard'),
    (error) => error.code === 'UNAUTHORIZED' && error.status === 401,
  )
})
