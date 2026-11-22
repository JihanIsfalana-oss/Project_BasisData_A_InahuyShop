import assert from 'node:assert/strict'
import test from 'node:test'
import { getAllowedTrackingStatuses, isDestructiveAdminAction } from './action-policy.js'

test('marks cancellation and destructive shipment changes', () => {
  assert.equal(isDestructiveAdminAction('cancelled'), true)
  assert.equal(isDestructiveAdminAction('processing'), false)
})

test('provides only next shipment tracking statuses', () => {
  assert.deepEqual(getAllowedTrackingStatuses('picked_up'), ['in_transit'])
  assert.deepEqual(getAllowedTrackingStatuses('in_transit'), ['out_for_delivery'])
  assert.deepEqual(getAllowedTrackingStatuses('out_for_delivery'), ['delivered'])
  assert.deepEqual(getAllowedTrackingStatuses('delivered'), [])
})
