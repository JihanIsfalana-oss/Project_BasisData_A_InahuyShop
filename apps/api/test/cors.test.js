import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createApp } from '../src/app.js'
import { readCorsOrigins } from '../src/config.js'

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')

  try {
    const address = server.address()
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

test('requires configured HTTPS browser origins in production', () => {
  assert.throws(
    () => readCorsOrigins({ NODE_ENV: 'production' }),
    /CORS_ALLOWED_ORIGINS is required/,
  )
  assert.throws(
    () =>
      readCorsOrigins({
        NODE_ENV: 'production',
        CORS_ALLOWED_ORIGINS: 'http://shop.example.test',
      }),
    /must use HTTPS/,
  )
})

test('accepts an exact list of production browser origins', () => {
  assert.deepEqual(
    readCorsOrigins({
      NODE_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://shop.example.test, https://admin.example.test',
    }),
    ['https://shop.example.test', 'https://admin.example.test'],
  )
})

test('answers allowed CORS preflights and rejects disallowed origins', async () => {
  const app = createApp({
    checkDatabase: async () => {},
    allowedOrigins: ['https://shop.example.test'],
  })

  await withServer(app, async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://shop.example.test',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'authorization,content-type',
      },
    })
    assert.equal(allowed.status, 204)
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://shop.example.test')
    assert.match(allowed.headers.get('access-control-allow-headers'), /authorization/i)
    assert.equal(allowed.headers.get('access-control-expose-headers'), 'X-Request-Id')

    const rejected = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'OPTIONS',
      headers: { origin: 'https://unlisted.example.test' },
    })
    assert.equal(rejected.status, 403)

    const mobileRequest = await fetch(`${baseUrl}/api/health`)
    assert.equal(mobileRequest.status, 200)
  })
})
