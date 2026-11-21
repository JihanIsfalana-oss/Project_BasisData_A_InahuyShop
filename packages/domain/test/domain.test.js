import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addMoney,
  multiplyMoney,
  calculateCheckoutTotals,
  isDeliveryEligible,
  canTransitionOrderStatus,
} from '../src/index.js'

test('money arithmetic preserves integer minor units', () => {
  assert.deepEqual(addMoney({ amount: 1000, currency: 'IDR' }, { amount: 500, currency: 'IDR' }), {
    amount: 1500,
    currency: 'IDR',
  })
  assert.deepEqual(multiplyMoney({ amount: 500, currency: 'IDR' }, 3), {
    amount: 1500,
    currency: 'IDR',
  })
})

test('checkout totals calculate mixed items and capped discount', () => {
  assert.deepEqual(
    calculateCheckoutTotals({
      items: [
        { unitPrice: 1000, quantity: 2 },
        { unitPrice: 500, quantity: 1 },
      ],
      discount: 5000,
      shipping: 0,
    }),
    { subtotal: 2500, discount: 2500, shipping: 0, total: 0, currency: 'IDR' },
  )
})

test('delivery eligibility requires an address for physical items', () => {
  assert.deepEqual(isDeliveryEligible({ deliveryType: 'SHIPMENT', hasPhysicalItems: true }), {
    eligible: false,
    reason: 'address-required',
  })
})

test('order transitions reject backwards movement', () => {
  assert.equal(canTransitionOrderStatus('PAID', 'PROCESSING'), true)
  assert.equal(canTransitionOrderStatus('COMPLETED', 'PENDING'), false)
})
