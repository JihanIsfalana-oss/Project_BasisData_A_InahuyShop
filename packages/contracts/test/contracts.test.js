import test from 'node:test'
import assert from 'node:assert/strict'
import {
  API_HEALTH_MESSAGE,
  OrderStatus,
  DeliveryStatus,
  authRequestSchema,
  checkoutRequestSchema,
  productResponseSchema,
} from '../src/index.js'

test('exports stable status enums and existing health contract', () => {
  assert.equal(API_HEALTH_MESSAGE, 'InahuyShop API is running')
  assert.equal(OrderStatus.PENDING, 'PENDING')
  assert.equal(DeliveryStatus.PENDING, 'PENDING')
})

test('request schemas reject unknown fields', () => {
  assert.throws(() =>
    authRequestSchema.parse({ identifier: 'admin', password: 'secret', extra: true }),
  )
  assert.throws(() => checkoutRequestSchema.parse({ addressId: 1, extra: true }))
})

test('request schemas match API request shapes', () => {
  assert.deepEqual(authRequestSchema.parse({ identifier: 'admin', password: 'secret' }), {
    identifier: 'admin',
    password: 'secret',
  })
  assert.deepEqual(checkoutRequestSchema.parse({ addressId: 1, voucherCode: 'SAVE' }), {
    addressId: 1,
    voucherCode: 'SAVE',
  })
})

test('response schema accepts product DTO', () => {
  assert.deepEqual(
    productResponseSchema.parse({ id: 'p1', name: 'Course', price: 1000, currency: 'IDR' }),
    { id: 'p1', name: 'Course', price: 1000, currency: 'IDR' },
  )
})
