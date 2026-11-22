import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldClearAdminSession } from './session-policy.js'

test('clears admin session for unauthorized and forbidden responses', () => {
  assert.equal(shouldClearAdminSession({ status: 401 }), true)
  assert.equal(shouldClearAdminSession({ status: 403 }), true)
  assert.equal(shouldClearAdminSession({ status: 410 }), true)
})

test('keeps admin session for server and network failures', () => {
  assert.equal(shouldClearAdminSession({ status: 500 }), false)
  assert.equal(shouldClearAdminSession({ code: 'NETWORK_ERROR' }), false)
})
