import { useEffect, useState } from 'react'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import { ProductGrid } from '../components/ProductGrid.jsx'

export function HomePage() {
  const { api } = useStorefront()
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    api
      .request('/products?pageSize=6')
      .then((response) => setProducts(response.data))
      .catch((reason) => setError(reason.message))
  }, [api])
  return (
    <div className="page home-page">
      <section className="hero-panel">
        <p className="eyebrow">DIGITAL GOODS, MADE SIMPLE</p>
        <h1>Temukan produk yang membuat pekerjaanmu lebih ringan.</h1>
        <p>Belanja e-book, template, dan produk fisik dari satu toko terpercaya.</p>
        <button type="button" onClick={() => navigate('/catalog')}>
          Jelajahi katalog
        </button>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">PILIHAN TERBARU</p>
            <h2>Produk untuk mulai</h2>
          </div>
          <a
            href="/catalog"
            onClick={(event) => {
              event.preventDefault()
              navigate('/catalog')
            }}
          >
            Lihat semua
          </a>
        </div>
        {error ? (
          <ErrorState message={error} />
        ) : products === null ? (
          <LoadingState />
        ) : products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState>Belum ada produk aktif.</EmptyState>
        )}
      </section>
    </div>
  )
}
