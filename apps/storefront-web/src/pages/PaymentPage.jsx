import { useEffect, useState } from 'react'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'

export function PaymentPage({ orderId }) {
  const { api } = useStorefront()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    api
      .request(`/customer/orders/${orderId}`)
      .then((response) => setOrder(response.data))
      .catch((reason) => setError(reason.message))
  }, [api, orderId])
  const simulate = async (status) => {
    setBusy(true)
    try {
      const response = await api.request(`/customer/orders/${orderId}/payment/simulate`, {
        method: 'POST',
        body: { status },
      })
      setOrder(response.data)
    } catch (reason) {
      setError(reason.message)
    } finally {
      setBusy(false)
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
  const payment = order.payments?.[0]
  if (payment?.status !== 'pending')
    return (
      <div className="page">
        <div className="success-panel">
          <p className="eyebrow">PAYMENT RESULT</p>
          <h1>
            {payment?.status === 'success'
              ? 'Pembayaran berhasil'
              : `Pembayaran ${payment?.status}`}
          </h1>
          <p>Status pesanan: {order.status}</p>
          <button type="button" onClick={() => navigate(`/orders/${orderId}`)}>
            Lihat detail pesanan
          </button>
        </div>
      </div>
    )
  return (
    <div className="page payment-page">
      <div className="page-heading">
        <p className="eyebrow">SIMULATION</p>
        <h1>Selesaikan pembayaran</h1>
        <p>Ini simulasi internal. Tidak ada charge nyata.</p>
      </div>
      <div className="payment-actions">
        <button type="button" disabled={busy} onClick={() => simulate('success')}>
          Bayar berhasil
        </button>
        <button type="button" disabled={busy} onClick={() => simulate('failed')}>
          Tandai gagal
        </button>
        <button type="button" disabled={busy} onClick={() => simulate('expired')}>
          Tandai kedaluwarsa
        </button>
      </div>
    </div>
  )
}
