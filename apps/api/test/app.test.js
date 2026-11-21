import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createApp } from '../src/app.js'
import { readConfig } from '../src/config.js'
import { validateBody } from '../src/middleware/validate-body.js'
import { hashPassword, verifyPassword } from '../src/security/passwords.js'

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

test('health endpoint preserves the existing success message and correlates requests', async () => {
  const app = createApp({ checkDatabase: async () => {} })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { 'x-request-id': 'test-request-42' },
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-request-id'), 'test-request-42')
    assert.equal(body.success, true)
    assert.equal(body.message, 'InahuyShop API is running')
    assert.equal(body.requestId, 'test-request-42')
  })
})

test('readiness endpoint checks the database dependency', async () => {
  const app = createApp({ checkDatabase: async () => {} })

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ready`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body.data, { status: 'ready' })
    assert.equal(typeof body.requestId, 'string')
  })

  const unavailableApp = createApp({
    checkDatabase: async () => {
      throw new Error('database connection unavailable')
    },
  })

  await withServer(unavailableApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ready`)
    const body = await response.json()

    assert.equal(response.status, 503)
    assert.equal(body.error.code, 'DEPENDENCY_UNAVAILABLE')
    assert.equal(body.error.message, 'A required dependency is unavailable')
  })
})

test('unknown routes and malformed JSON use the standard error envelope', async () => {
  const app = createApp({ checkDatabase: async () => {} })

  await withServer(app, async (baseUrl) => {
    const notFound = await fetch(`${baseUrl}/api/missing`)
    const notFoundBody = await notFound.json()
    assert.equal(notFound.status, 404)
    assert.equal(notFoundBody.error.code, 'NOT_FOUND')

    const invalidJson = await fetch(`${baseUrl}/api/missing`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    })
    const invalidJsonBody = await invalidJson.json()
    assert.equal(invalidJson.status, 400)
    assert.equal(invalidJsonBody.error.code, 'INVALID_JSON')
  })
})

test('request body validation forwards field issues as a client error', () => {
  const middleware = validateBody((body) =>
    typeof body?.email === 'string' ? [] : [{ field: 'email', message: 'Email is required' }],
  )
  let actualError

  middleware({ body: {} }, {}, (error) => {
    actualError = error
  })

  assert.equal(actualError.status, 400)
  assert.deepEqual(actualError.details, [{ field: 'email', message: 'Email is required' }])
})

test('runtime configuration rejects invalid ports and environments', () => {
  assert.throws(() => readConfig({ PORT: '0' }), /PORT must be an integer/)
  assert.throws(() => readConfig({ NODE_ENV: 'staging' }), /NODE_ENV must be/)
  assert.deepEqual(readConfig({ PORT: '4321', NODE_ENV: 'test' }), {
    port: 4321,
    nodeEnvironment: 'test',
  })
})

test('password hashes are salted and reject incorrect passwords and malformed hashes', async () => {
  const first = await hashPassword('a-strong-password-123')
  const second = await hashPassword('a-strong-password-123')

  assert.notEqual(first, second)
  assert.equal(await verifyPassword('a-strong-password-123', first), true)
  assert.equal(await verifyPassword('a-different-password', first), false)
  assert.equal(await verifyPassword('a-strong-password-123', 'not-a-hash'), false)
})

test('customer login creates a hashed, revocable session and role guards protect admin routes', async () => {
  const passwordHash = await hashPassword('a-strong-password-123')
  const customer = {
    customerId: 7,
    fullName: 'Test Customer',
    email: 'customer@example.test',
    phone: null,
    birthDate: null,
    passwordHash,
    isActive: true,
  }
  let savedSession
  let sessionLookup
  let revokedAt = null
  const prisma = {
    customer: { findUnique: async () => customer },
    authSession: {
      create: async ({ data }) => {
        savedSession = data
      },
      update: async ({ data }) => {
        revokedAt = data.revokedAt
      },
      findUnique: async ({ where }) => {
        sessionLookup = where.tokenHash
        return {
          ...savedSession,
          customer,
          admin: null,
          revokedAt,
          expiresAt: new Date(Date.now() + 60_000),
        }
      },
    },
  }

  await withServer(createApp({ checkDatabase: async () => {}, prisma }), async (baseUrl) => {
    const login = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: customer.email, password: 'a-strong-password-123' }),
    })
    const loginBody = await login.json()
    const token = loginBody.data.token

    assert.equal(login.status, 200)
    assert.equal(loginBody.data.customer.id, 7)
    assert.equal('passwordHash' in loginBody.data.customer, false)
    assert.equal(savedSession.customerId, 7)
    assert.equal(savedSession.adminId, undefined)
    assert.notEqual(savedSession.tokenHash, token)

    const me = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    })
    const meBody = await me.json()
    assert.equal(me.status, 200)
    assert.equal(meBody.data.role, 'customer')
    assert.equal(sessionLookup, savedSession.tokenHash)

    const forbidden = await fetch(`${baseUrl}/api/v1/admin/dashboard`, {
      headers: { authorization: `Bearer ${token}` },
    })
    const forbiddenBody = await forbidden.json()
    assert.equal(forbidden.status, 403)
    assert.equal(forbiddenBody.error.code, 'FORBIDDEN')

    const logout = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(logout.status, 200)
    const afterLogout = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    })
    assert.equal(afterLogout.status, 401)
  })
})

test('authentication endpoints rate-limit attempts and preserve request correlation', async () => {
  const prisma = {
    customer: { findUnique: async () => null },
    authSession: { create: async () => {} },
  }

  await withServer(createApp({ checkDatabase: async () => {}, prisma }), async (baseUrl) => {
    const responses = await Promise.all(
      Array.from({ length: 11 }, () =>
        fetch(`${baseUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ identifier: '', password: '' }),
        }),
      ),
    )
    const limited = responses.filter((response) => response.status === 429)
    assert.equal(limited.length, 1)
    const body = await limited[0].json()
    assert.equal(body.error.code, 'RATE_LIMITED')
    assert.equal(body.requestId, limited[0].headers.get('x-request-id'))
  })
})

test('customer login failures do not reveal whether the account exists', async () => {
  const prisma = {
    customer: { findUnique: async () => null },
    authSession: { create: async () => {} },
  }

  await withServer(createApp({ checkDatabase: async () => {}, prisma }), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        identifier: 'missing@example.test',
        password: 'a-strong-password-123',
      }),
    })
    const body = await response.json()

    assert.equal(response.status, 401)
    assert.equal(body.error.code, 'INVALID_CREDENTIALS')
    assert.equal(body.error.message, 'Email or password is incorrect')
  })
})
