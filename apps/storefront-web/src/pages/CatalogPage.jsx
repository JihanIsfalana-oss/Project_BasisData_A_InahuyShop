import { useEffect, useState } from 'react'
import { Input } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState.jsx'
import { ProductGrid } from '../components/ProductGrid.jsx'

export function CatalogPage() {
  const { api } = useStorefront()
  const params = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  useEffect(() => {
    api
      .request('/categories')
      .then((response) => setCategories(response.data))
      .catch(() => {})
  }, [api])
  useEffect(() => {
    const search = new URLSearchParams({ pageSize: '24' })
    if (query.trim()) search.set('q', query.trim())
    if (category) search.set('category', category)
    api
      .request(`/products?${search}`)
      .then((response) => {
        setProducts(response.data)
        setError(null)
      })
      .catch((reason) => setError(reason.message))
  }, [api, category, query])
  const submit = (event) => {
    event.preventDefault()
    navigate(`/catalog?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`)
  }
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">DISCOVERY</p>
        <h1>Katalog produk</h1>
        <p>Pilih produk digital atau fisik sesuai kebutuhanmu.</p>
      </div>
      <form className="filter-bar" onSubmit={submit}>
        <Input
          label="Cari produk"
          id="catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nama atau brand"
        />
        <label htmlFor="category-filter">
          Kategori
          <select
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item.categoryId} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Cari</button>
      </form>
      {error ? (
        <ErrorState message={error} />
      ) : products === null ? (
        <LoadingState />
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState>Produk tidak ditemukan.</EmptyState>
      )}
    </div>
  )
}
