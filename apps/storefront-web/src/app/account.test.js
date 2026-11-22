import test from 'node:test'
import assert from 'node:assert/strict'
import { getOrderStatusLabel, isDownloadAvailable } from './account.js'

test('maps order status and protects expired downloads', () => {
  assert.equal(getOrderStatusLabel('pending_payment'), 'Menunggu pembayaran')
  assert.equal(getOrderStatusLabel('completed'), 'Selesai')
  assert.equal(
    isDownloadAvailable({ expiresAt: '2999-01-01T00:00:00.000Z' }, new Date('2026-01-01')),
    true,
  )
  assert.equal(
    isDownloadAvailable({ expiresAt: '2020-01-01T00:00:00.000Z' }, new Date('2026-01-01')),
    false,
  )
})
