import { useEffect, useState } from 'react'
import { PriceText } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { getOrderStatusLabel } from '../app/account.js'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'

export function OrdersPage() {
  const { api } = useStorefront()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    api
      .request('/customer/orders')
      .then((response) => setOrders(response.data))
      .catch((reason) => setError(reason.message))
  }, [api])
  if (error)
    return (
      <div className="page">
        <ErrorState message={error} />
      </div>
    )
  if (!orders)
    return (
      <div className="page">
        <LoadingState />
      </div>
    )
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">YOUR ORDERS</p>
        <h1>Riwayat pesanan</h1>
      </div>
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => (
            <button
              type="button"
              className="order-card"
              key={order.orderId}
              onClick={() => navigate(`/orders/${order.orderId}`)}
            >
              <span>#{order.orderNumber}</span>
              <strong>{getOrderStatusLabel(order.status)}</strong>
              <PriceText amount={Number(order.grandTotal)} currency="IDR" />
              <small>{new Date(order.orderDate).toLocaleDateString('id-ID')}</small>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState>Belum ada pesanan.</EmptyState>
      )}
    </div>
  )
}
