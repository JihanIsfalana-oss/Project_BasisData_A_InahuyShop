import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearAdminSession,
  formatCurrency,
  normalizeApiError,
  readAdminSession,
  writeAdminSession,
} from './admin-state.js'

test('admin session stores token and admin identity', () => {
  const storage = new Map()
  const admin = { id: 'seller-1', username: 'admin' }
  writeAdminSession(storage, 'opaque-token', admin)

  assert.deepEqual(readAdminSession(storage), {
    token: 'opaque-token',
    admin,
  })
})

test('admin session clearing removes only admin credentials', () => {
  const storage = new Map([
    ['admin-session', 'value'],
    ['customer-session', 'keep'],
  ])
  clearAdminSession(storage)

  assert.equal(storage.has('admin-session'), false)
  assert.equal(storage.get('customer-session'), 'keep')
})

test('currency formatting uses Indonesian rupiah', () => {
  assert.equal(formatCurrency(125000), 'Rp125.000')
})

test('API error normalization keeps server code and message', () => {
  assert.deepEqual(
    normalizeApiError({
      error: { code: 'INVALID_CREDENTIALS', message: 'Username or password is incorrect' },
    }),
    {
      code: 'INVALID_CREDENTIALS',
      message: 'Username or password is incorrect',
    },
  )
})
