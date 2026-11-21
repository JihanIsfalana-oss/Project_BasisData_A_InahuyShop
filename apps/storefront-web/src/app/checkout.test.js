import test from 'node:test'
import assert from 'node:assert/strict'
import { createCheckoutRequest, requiresShippingAddress } from './checkout.js'

test('requires an address for physical and mixed carts', () => {
  assert.equal(requiresShippingAddress([{ deliveryType: 'digital' }]), false)
  assert.equal(requiresShippingAddress([{ deliveryType: 'physical' }]), true)
  assert.equal(
    requiresShippingAddress([{ deliveryType: 'digital' }, { deliveryType: 'physical' }]),
    true,
  )
})

test('sends a stable idempotency key for checkout', async () => {
  const calls = []
  const api = {
    request: async (...args) => {
      calls.push(args)
      return { data: { orderId: 7 } }
    },
  }
  const result = await createCheckoutRequest(api, {
    addressId: 3,
    voucherCode: 'SAVE',
    idempotencyKey: 'checkout-1234',
  })
  assert.equal(result.data.orderId, 7)
  assert.deepEqual(calls[0], [
    '/customer/checkout',
    {
      method: 'POST',
      body: { addressId: 3, voucherCode: 'SAVE' },
      headers: { 'Idempotency-Key': 'checkout-1234' },
    },
  ])
})
