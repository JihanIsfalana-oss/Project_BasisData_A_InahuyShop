export function requiresShippingAddress(items = []) {
  return items.some((item) => item.deliveryType === 'physical')
}

export async function createCheckoutRequest(api, { addressId, voucherCode, idempotencyKey }) {
  if (!idempotencyKey) throw new Error('Checkout idempotency key is required')
  const body = {
    ...(addressId ? { addressId } : {}),
    ...(voucherCode?.trim() ? { voucherCode: voucherCode.trim().toUpperCase() } : {}),
  }
  return api.request('/customer/checkout', {
    method: 'POST',
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}
