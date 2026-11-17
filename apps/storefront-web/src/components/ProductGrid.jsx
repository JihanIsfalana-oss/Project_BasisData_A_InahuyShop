import { ProductCard } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'

export function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <button
          type="button"
          className="product-tile"
          key={product.productId}
          onClick={() => navigate(`/products/${product.productId}`)}
        >
          <ProductCard
            name={product.name}
            amount={Number(product.variants?.[0]?.price ?? 0)}
            currency="IDR"
            imageUrl={product.images?.[0]?.imageUrl ?? product.images?.[0]?.url}
          />
          <span>{product.category?.name ?? 'Produk pilihan'}</span>
        </button>
      ))}
    </div>
  )
}
