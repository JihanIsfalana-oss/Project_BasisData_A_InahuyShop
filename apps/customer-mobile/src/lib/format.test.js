import test from 'node:test'
import assert from 'node:assert/strict'

import { createIdempotencyKey, formatMoney, formatStatus } from './format.js'

test('formats Indonesian rupiah without fractional digits', () => {
  assert.equal(formatMoney(125000), 'Rp 125.000')
})

test('maps order status to a readable label', () => {
  assert.equal(formatStatus('pending_payment'), 'Menunggu pembayaran')
  assert.equal(formatStatus('completed'), 'Selesai')
})

test('creates an API-safe checkout idempotency key', () => {
  const key = createIdempotencyKey(
    () => 1700000000000,
    () => 0.123456,
  )
  assert.match(key, /^checkout-1700000000000-[a-z0-9]{8}$/)
})
