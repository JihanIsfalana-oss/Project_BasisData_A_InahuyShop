import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiClientError, createApiClient } from '../src/client.js'

const response = (body, options = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status: options.status ?? 200,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  })

test('client serializes JSON and injects auth token', async () => {
  let request
  const client = createApiClient({
    baseUrl: 'https://api.example.test',
    timeoutMs: 1000,
    getToken: () => 'token-1',
    fetchImpl: async (url, init) => {
      request = { url, init }
      return response({ ok: true })
    },
  })
  assert.deepEqual(await client.request('/checkout', { method: 'POST', body: { items: [] } }), {
    ok: true,
  })
  assert.equal(request.url, 'https://api.example.test/checkout')
  assert.equal(request.init.headers.Authorization, 'Bearer token-1')
  assert.equal(request.init.body, '{"items":[]}')
})

test('client normalizes API errors', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.example.test',
    timeoutMs: 1000,
    fetchImpl: async () =>
      response(
        { code: 'INVALID', message: 'Bad request', fieldIssues: [{ path: ['email'] }] },
        { status: 400, headers: { 'x-request-id': 'req-1' } },
      ),
  })
  await assert.rejects(
    () => client.request('/login'),
    (error) => {
      assert.ok(error instanceof ApiClientError)
      assert.equal(error.status, 400)
      assert.equal(error.code, 'INVALID')
      assert.equal(error.requestId, 'req-1')
      return true
    },
  )
})
