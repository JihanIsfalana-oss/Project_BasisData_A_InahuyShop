import { useEffect, useMemo, useState } from 'react'
import { PriceText } from '@inahuyshop/ui-web'
import { createCheckoutRequest, requiresShippingAddress } from '../app/checkout.js'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { AddressPicker } from '../components/AddressPicker.jsx'
import { ErrorState } from '../components/AsyncState.jsx'

export function CheckoutPage() {
  const { api, cart } = useStorefront()
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    api
      .request('/customer/addresses')
      .then((response) => {
        setAddresses(response.data)
        setAddressId(
          response.data.find((item) => item.isDefault)?.addressId ??
            response.data[0]?.addressId ??
            null,
        )
      })
      .catch((reason) => setError(reason.message))
  }, [api])
  const shippingRequired = useMemo(() => requiresShippingAddress(cart.items), [cart.items])
  if (!cart.items.length)
    return (
      <div className="page">
        <h1>Keranjang kosong</h1>
        <button type="button" onClick={() => navigate('/catalog')}>
          Kembali ke katalog
        </button>
      </div>
    )
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const submit = async (event) => {
    event.preventDefault()
    if (shippingRequired && !addressId) {
      setError('Pilih alamat pengiriman untuk item fisik.')
      return
    }
    setBusy(true)
    try {
      const response = await createCheckoutRequest(api, {
        addressId,
        voucherCode,
        idempotencyKey: `web-${crypto.randomUUID()}`,
      })
      navigate(`/payment/${response.data.orderId}`)
    } catch (reason) {
      setError(reason.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="page checkout-page">
      <div className="page-heading">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Review pesanan</h1>
      </div>
      {error ? <ErrorState message={error} /> : null}
      <form onSubmit={submit}>
        <div className="checkout-items">
          {cart.items.map((item) => (
            <div key={item.variantId}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <PriceText amount={Number(item.price) * item.quantity} currency="IDR" />
            </div>
          ))}
        </div>
        <label htmlFor="voucher">
          Kode voucher
          <input
            id="voucher"
            value={voucherCode}
            onChange={(event) => setVoucherCode(event.target.value)}
            placeholder="Opsional"
          />
        </label>
        {shippingRequired ? (
          <AddressPicker addresses={addresses} value={addressId} onChange={setAddressId} />
        ) : (
          <p className="info-box">Pesanan digital tidak memerlukan alamat pengiriman.</p>
        )}
        <div className="summary-card">
          <span>Subtotal</span>
          <PriceText amount={subtotal} currency="IDR" />
          <button type="submit" disabled={busy}>
            {busy ? 'Membuat pesanan...' : 'Buat pesanan'}
          </button>
        </div>
      </form>
    </div>
  )
}
