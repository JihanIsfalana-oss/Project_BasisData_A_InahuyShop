import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'

import { AppScreen } from '@/components/AppScreen'
import { ProductCard, type ProductSummary } from '@/components/ProductCard'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { getCatalogSnapshot, setCatalogSnapshot } from '@/lib/catalog-cache'
import { withNetworkRetry } from '@/lib/network'

type CatalogResponse = {
  productId: number
  name: string
  brand?: string | null
  images?: { url: string; altText?: string }[]
  variants?: { price: number | string; stockQty: number; deliveryType: string }[]
}[]
type Category = { slug: string; name: string }

export default function HomeScreen() {
  const { api, offline } = useCustomer()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductSummary[]>(getCatalogSnapshot())
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadCatalog = useCallback(async () => {
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        withNetworkRetry(() =>
          api.request<CatalogResponse>(
            `/products?page=1&pageSize=50${query ? `&q=${encodeURIComponent(query)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
          ),
        ),
        withNetworkRetry(() => api.request<Category[]>('/categories')),
      ])
      setProducts(productResponse.data)
      setCatalogSnapshot(productResponse.data)
      setCategories(categoryResponse.data)
      setError(null)
    } catch (reason) {
      setProducts(getCatalogSnapshot())
      setError(
        reason instanceof Error
          ? `${reason.message} Data terakhir dipertahankan.`
          : 'Katalog tidak tersedia.',
      )
    }
  }, [api, category, query])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog()
    }, 0)
    return () => clearTimeout(timer)
  }, [category, loadCatalog])

  return (
    <AppScreen title="InahuyShop">
      <Text style={styles.subtitle}>Produk pilihan untuk kebutuhan digital dan fisik.</Text>
      {offline ? (
        <Text style={styles.offline}>
          Mode jaringan terbatas. Data terakhir mungkin ditampilkan.
        </Text>
      ) : null}
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Cari produk"
          onChangeText={setQuery}
          onSubmitEditing={loadCatalog}
          placeholder="Cari produk atau brand"
          returnKeyType="search"
          style={styles.search}
          value={query}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cari"
          onPress={loadCatalog}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Cari</Text>
        </Pressable>
      </View>
      <View style={styles.chips}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setCategory('')}
          style={[styles.chip, !category && styles.selectedChip]}
        >
          <Text>Semua</Text>
        </Pressable>
        {categories.map((item) => (
          <Pressable
            key={item.slug}
            accessibilityRole="button"
            onPress={() => setCategory(item.slug)}
            style={[styles.chip, category === item.slug && styles.selectedChip]}
          >
            <Text>{item.name}</Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <StateView title="Katalog gagal dimuat" message={error} onRetry={loadCatalog} />
      ) : null}
      {!error && products.length === 0 ? (
        <StateView title="Produk belum tersedia" message="Coba ubah pencarian atau kategori." />
      ) : null}
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            onPress={() => router.push(`/product/${product.productId}`)}
          />
        ))}
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  subtitle: { color: Colors.light.textSecondary, fontSize: 16 },
  offline: { backgroundColor: '#FEF3C7', borderRadius: 10, color: '#92400E', padding: Spacing.two },
  searchRow: { flexDirection: 'row', gap: Spacing.two },
  search: {
    backgroundColor: '#fff',
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.two,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: Spacing.two,
  },
  searchButtonText: { color: '#fff', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 10,
  },
  selectedChip: { backgroundColor: Colors.light.backgroundSelected },
  grid: { gap: Spacing.two },
})
