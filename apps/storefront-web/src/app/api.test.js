import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeApiPath } from './api.js'

test('keeps API v1 base path when normalizing endpoint paths', () => {
  assert.equal(normalizeApiPath('/products'), 'products')
  assert.equal(normalizeApiPath('customer/cart'), 'customer/cart')
})
