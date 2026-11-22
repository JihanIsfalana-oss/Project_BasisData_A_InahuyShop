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

test('client preserves the API base path for endpoint paths with or without a leading slash', async () => {
  const requestedUrls = []
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    timeoutMs: 1000,
    fetchImpl: async (url) => {
      requestedUrls.push(String(url))
      return response({ success: true })
    },
  })

  await client.request('/customer/cart')
  await client.request('customer/cart')

  assert.deepEqual(requestedUrls, [
    'https://api.example.test/api/v1/customer/cart',
    'https://api.example.test/api/v1/customer/cart',
  ])
})

test('client accepts an empty 204 response', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    timeoutMs: 1000,
    fetchImpl: async () => new Response(null, { status: 204 }),
  })

  assert.equal(await client.request('/admin/categories/1', { method: 'DELETE' }), null)
})

test('client normalizes API errors', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.example.test',
    timeoutMs: 1000,
    fetchImpl: async () =>
      response(
        {
          success: false,
          error: { code: 'INVALID', message: 'Bad request', details: [{ path: ['email'] }] },
          requestId: 'body-1',
        },
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
      assert.deepEqual(error.fieldIssues, [{ path: ['email'] }])
      return true
    },
  )
})

test('client rejects empty responses and preserves timeout with caller signal', async () => {
  const caller = new AbortController()
  const client = createApiClient({
    baseUrl: 'https://api.example.test',
    timeoutMs: 5,
    fetchImpl: (_url, init) =>
      new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(Object.assign(new Error(), { name: 'AbortError' })),
        )
      }),
  })
  await assert.rejects(
    () => client.request('/slow', { signal: caller.signal }),
    (error) => {
      assert.equal(error.code, 'TIMEOUT')
      return true
    },
  )
  const emptyClient = createApiClient({
    baseUrl: 'https://api.example.test',
    timeoutMs: 1000,
    fetchImpl: async () => response(undefined),
  })
  await assert.rejects(
    () => emptyClient.request('/empty'),
    (error) => error.code === 'INVALID_RESPONSE',
  )
})
