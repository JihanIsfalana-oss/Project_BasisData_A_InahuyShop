import type { ProductSummary } from '@/components/ProductCard'

let snapshot: ProductSummary[] = []

export function getCatalogSnapshot() {
  return snapshot
}

export function setCatalogSnapshot(products: ProductSummary[]) {
  snapshot = products
}
