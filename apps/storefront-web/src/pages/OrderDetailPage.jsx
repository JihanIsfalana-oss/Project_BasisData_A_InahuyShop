import { useEffect, useState } from 'react'
import { PriceText } from '@inahuyshop/ui-web'
import { API_BASE_URL } from '../app/api.js'
import { isDownloadAvailable } from '../app/account.js'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'
import { OrderStatus } from '../components/OrderStatus.jsx'
import { ReviewForm } from '../components/ReviewForm.jsx'

export function OrderDetailPage({ orderId }) {
  const { api, token } = useStorefront()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  useEffect(() => {
    api
      .request(`/customer/orders/${orderId}`)
      .then((response) => setOrder(response.data))
      .catch((reason) => setError(reason.message))
  }, [api, orderId])
  const download = async (deliveryId) => {
    try {
      const tokenResponse = await api.request(`/customer/digital-deliveries/${deliveryId}/token`)
      const response = await fetch(new URL(tokenResponse.data.downloadUrl, API_BASE_URL), {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-download-token': tokenResponse.data.downloadToken,
        },
      })
      if (!response.ok) throw new Error('Download tidak tersedia')
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'inahuyshop-download'
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (reason) {
      setError(reason.message)
    }
  }
  if (error)
    return (
      <div className="page">
        <ErrorState message={error} />
      </div>
    )
  if (!order)
    return (
      <div className="page">
        <LoadingState />
      </div>
    )
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">ORDER DETAIL</p>
        <h1>#{order.orderNumber}</h1>
        <OrderStatus status={order.status} />
      </div>
      <div className="order-detail-grid">
        <section className="detail-card">
          <h2>Item pesanan</h2>
          {order.items.map((item) => (
            <article className="order-item" key={item.orderItemId}>
              <div>
                <strong>{item.productName}</strong>
                <p>
                  {item.quantity} × <PriceText amount={Number(item.unitPrice)} currency="IDR" />
                </p>
              </div>
              {item.digitalDeliveries?.map((delivery) =>
                isDownloadAvailable(delivery) ? (
                  <button
                    type="button"
                    key={delivery.deliveryId}
                    onClick={() => download(delivery.deliveryId)}
                  >
                    Unduh
                  </button>
                ) : (
                  <small key={delivery.deliveryId}>Link unduhan kedaluwarsa</small>
                ),
              )}
              <ReviewForm
                onSubmit={async (body) => {
                  await api.request(`/customer/order-items/${item.orderItemId}/reviews`, {
                    method: 'POST',
                    body,
                  })
                  setMessage('Ulasan terkirim.')
                }}
              />
            </article>
          ))}
        </section>
        <aside className="detail-card">
          <h2>Ringkasan</h2>
          <p>
            Total <PriceText amount={Number(order.grandTotal)} currency="IDR" />
          </p>
          {order.shipment ? (
            <>
              <h2>Pengiriman</h2>
              <p>
                {order.shipment.courier ?? 'Kurir manual'} ·{' '}
                {order.shipment.trackingNumber ?? 'Nomor resi belum tersedia'}
              </p>
              {order.shipment.tracking?.map((event) => (
                <p key={event.trackingSeq}>
                  {event.status} · {event.description}
                </p>
              ))}
            </>
          ) : null}
          {message ? <p role="status">{message}</p> : null}
          {order.status === 'pending_payment' ? (
            <button type="button" onClick={() => navigate(`/payment/${order.orderId}`)}>
              Bayar sekarang
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
