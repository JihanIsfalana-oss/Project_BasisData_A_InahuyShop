import { useEffect, useState } from 'react'
import { Button, PriceText } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import { ProductGallery } from '../components/ProductGallery.jsx'
import { VariantSelector } from '../components/VariantSelector.jsx'

export function ProductPage({ productId }) {
  const { api, isAuthenticated, refreshCart } = useStorefront()
  const [product, setProduct] = useState(null)
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState(null)
  useEffect(() => {
    api
      .request(`/products/${productId}`)
      .then((response) => {
        setProduct(response.data)
        setSelected(
          response.data.variants.find((variant) => variant.stockQty > 0) ??
            response.data.variants[0],
        )
      })
      .catch((reason) => setStatus({ type: 'error', message: reason.message }))
  }, [api, productId])
  if (status?.type === 'error')
    return (
      <div className="page">
        <ErrorState message={status.message} />
      </div>
    )
  if (!product)
    return (
      <div className="page">
        <LoadingState />
      </div>
    )
  if (!selected)
    return (
      <div className="page">
        <EmptyState>Varian produk tidak tersedia.</EmptyState>
      </div>
    )
  const addToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=/products/${productId}`)
      return
    }
    try {
      await api.request('/customer/cart/items', {
        method: 'POST',
        body: { variantId: selected.variantId, quantity },
      })
      await refreshCart()
      setStatus({ type: 'success', message: 'Produk masuk ke keranjang.' })
    } catch (reason) {
      setStatus({ type: 'error', message: reason.message })
    }
  }
  return (
    <div className="page product-page">
      <ProductGallery images={product.images} name={product.name} />
      <div className="product-copy">
        <p className="eyebrow">{product.category?.name ?? 'PRODUK'}</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <VariantSelector
          variants={product.variants}
          selectedId={selected.variantId}
          onChange={setSelected}
        />
        <div className="purchase-row">
          <PriceText amount={Number(selected.price) * quantity} currency="IDR" />
          <label htmlFor="quantity">
            Jumlah
            <input
              id="quantity"
              type="number"
              min="1"
              max={selected.deliveryType === 'physical' ? selected.stockQty : 99}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            />
          </label>
          <Button onClick={addToCart}>Tambah ke keranjang</Button>
        </div>
        {status ? (
          <p role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>
        ) : null}
      </div>
      <section className="reviews">
        <h2>Ulasan pelanggan</h2>
        {product.reviews?.length ? (
          product.reviews.map((review, index) => (
            <article key={`${review.createdAt}-${index}`}>
              <strong>{'★'.repeat(review.rating)}</strong>
              <p>{review.comment || 'Tanpa komentar'}</p>
            </article>
          ))
        ) : (
          <EmptyState>Belum ada ulasan.</EmptyState>
        )}
      </section>
    </div>
  )
}
