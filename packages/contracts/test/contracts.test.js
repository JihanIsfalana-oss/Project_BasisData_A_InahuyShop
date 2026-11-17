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
    authRequestSchema.parse({ username: 'admin', password: 'secret', extra: true }),
  )
  assert.throws(() => checkoutRequestSchema.parse({ items: [], extra: true }))
})

test('response schema accepts product DTO', () => {
  assert.deepEqual(
    productResponseSchema.parse({ id: 'p1', name: 'Course', price: 1000, currency: 'IDR' }),
    { id: 'p1', name: 'Course', price: 1000, currency: 'IDR' },
  )
})
