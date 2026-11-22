const statusLabels = {
  pending_payment: 'Menunggu pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

export function getOrderStatusLabel(status) {
  return statusLabels[status] ?? status
}

export function isDownloadAvailable(delivery, now = new Date()) {
  return Boolean(delivery?.expiresAt && new Date(delivery.expiresAt) > now)
}
