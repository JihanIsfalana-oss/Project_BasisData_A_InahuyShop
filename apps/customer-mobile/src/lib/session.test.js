import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldClearSession } from './session-policy.js'

test('clears session only after an unauthorized response', () => {
  assert.equal(shouldClearSession({ status: 401 }), true)
  assert.equal(shouldClearSession({ code: 'TIMEOUT' }), false)
  assert.equal(shouldClearSession(new TypeError('fetch failed')), false)
})
