const statusLabels = Object.freeze({
  pending_payment: 'Menunggu pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
})

export function formatMoney(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function formatStatus(status) {
  return statusLabels[status] ?? String(status).replaceAll('_', ' ')
}

export function createIdempotencyKey(now = Date.now, random = Math.random) {
  const timestamp = now()
  const suffix = Math.floor(random() * 0xffffffff)
    .toString(36)
    .padStart(8, '0')
    .slice(0, 8)
  return `checkout-${timestamp}-${suffix}`
}
