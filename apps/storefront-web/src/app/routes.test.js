import test from 'node:test'
import assert from 'node:assert/strict'
import { matchRoute } from './routes.js'

test('matches public and protected storefront routes', () => {
  assert.equal(matchRoute('/').name, 'home')
  assert.equal(matchRoute('/catalog').name, 'catalog')
  assert.equal(matchRoute('/products/12').params.productId, '12')
  assert.equal(matchRoute('/cart').protected, true)
  assert.equal(matchRoute('/checkout').name, 'checkout')
  assert.equal(matchRoute('/orders/42').params.orderId, '42')
  assert.equal(matchRoute('/account').name, 'account')
})

test('falls back to not-found for unknown paths', () => {
  assert.equal(matchRoute('/does-not-exist').name, 'not-found')
})
