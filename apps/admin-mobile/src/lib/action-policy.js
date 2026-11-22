export function isDestructiveAdminAction(status) {
  return status === 'cancelled'
}

export function getAllowedTrackingStatuses(previousStatus) {
  const next = {
    picked_up: ['in_transit'],
    in_transit: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
  }
  return next[previousStatus] ?? []
}
