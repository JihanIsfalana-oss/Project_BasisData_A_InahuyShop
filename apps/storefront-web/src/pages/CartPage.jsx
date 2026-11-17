import { useEffect, useState } from 'react'
import { PriceText } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'

export function CartPage() {
  const { api, cart, refreshCart } = useStorefront()
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    refreshCart().catch((reason) => setError(reason.message))
  }, [refreshCart])
  const update = async (item, quantity) => {
    setBusy(true)
    try {
      if (quantity < 1)
        await api.request(`/customer/cart/items/${item.variantId}`, { method: 'DELETE' })
      else
        await api.request(`/customer/cart/items/${item.variantId}`, {
          method: 'PATCH',
          body: { quantity },
        })
      await refreshCart()
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
  if (!cart)
    return (
      <div className="page">
        <LoadingState />
      </div>
    )
  if (!cart.items.length)
    return (
      <div className="page">
        <div className="page-heading">
          <p className="eyebrow">YOUR BAG</p>
          <h1>Keranjangmu kosong</h1>
        </div>
        <EmptyState>Tambahkan produk dari katalog untuk mulai checkout.</EmptyState>
        <button type="button" onClick={() => navigate('/catalog')}>
          Buka katalog
        </button>
      </div>
    )
  const total = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">YOUR BAG</p>
        <h1>Keranjang</h1>
      </div>
      <div className="cart-list">
        {cart.items.map((item) => (
          <article className="cart-line" key={item.variantId}>
            <div>
              <h2>{item.product.name}</h2>
              <p>
                {item.variantName} · {item.deliveryType === 'digital' ? 'Digital' : 'Fisik'}
              </p>
            </div>
            <PriceText amount={Number(item.price) * item.quantity} currency="IDR" />
            <label htmlFor={`quantity-${item.variantId}`}>
              Jumlah
              <input
                id={`quantity-${item.variantId}`}
                type="number"
                min="0"
                value={item.quantity}
                disabled={busy}
                onChange={(event) => update(item, Number(event.target.value))}
              />
            </label>
          </article>
        ))}
      </div>
      <div className="summary-card">
        <span>Total</span>
        <PriceText amount={total} currency="IDR" />
        <button type="button" onClick={() => navigate('/checkout')}>
          Lanjut checkout
        </button>
      </div>
    </div>
  )
}
