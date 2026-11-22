const transitions = {
  PENDING: new Set(['PAID', 'CANCELLED']),
  PAID: new Set(['PROCESSING', 'CANCELLED']),
  PROCESSING: new Set(['SHIPPED', 'COMPLETED']),
  SHIPPED: new Set(['COMPLETED']),
  COMPLETED: new Set(),
  CANCELLED: new Set(),
}

export const canTransitionOrderStatus = (from, to) => transitions[from]?.has(to) ?? false
