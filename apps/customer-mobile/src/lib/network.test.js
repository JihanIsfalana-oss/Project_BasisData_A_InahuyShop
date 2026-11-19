import test from 'node:test'
import assert from 'node:assert/strict'

import { isRetryableNetworkError } from './network-classification.js'

test('classifies timeout and fetch failures as retryable network errors', () => {
  assert.equal(isRetryableNetworkError({ code: 'TIMEOUT' }), true)
  assert.equal(isRetryableNetworkError(new TypeError('fetch failed')), true)
  assert.equal(isRetryableNetworkError({ status: 401 }), false)
})
