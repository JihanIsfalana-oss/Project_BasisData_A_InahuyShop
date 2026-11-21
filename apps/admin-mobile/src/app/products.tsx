import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAdmin } from '@/context/AdminProvider'

type Product = {
  productId: number
  name: string
  brand?: string
  category?: { name?: string }
  variants?: { variantId: number; variantName: string; stockQty: number; deliveryType: string }[]
}

export default function ProductsScreen() {
  const { api } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.request<Product[]>('/products?page=1&pageSize=100')
        setProducts(response.data)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Produk gagal dimuat.')
      }
    }
    load()
  }, [api])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>KATALOG</Text>
        <Text style={styles.title}>Ringkasan produk</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Produk bersifat ringkas dan read-only. Operasi CRUD kompleks diarahkan ke Admin Web.
          </Text>
        </View>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {products.map((product) => (
          <View key={product.productId} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.subtext}>
              {product.brand || '-'} - {product.category?.name || '-'}
            </Text>
            {product.variants?.map((variant) => (
              <View key={variant.variantId} style={styles.variant}>
                <Text>{variant.variantName}</Text>
                <Text style={styles.subtext}>
                  {variant.deliveryType} - stok {variant.stockQty}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {!error && products.length === 0 && (
          <Text style={styles.empty}>Tidak ada produk aktif.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 20, gap: 12 },
  eyebrow: { color: '#697386', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17202a', fontSize: 28, fontWeight: '800' },
  notice: { borderRadius: 10, backgroundColor: '#e8eeec', padding: 12 },
  noticeText: { color: '#355b52' },
  error: { backgroundColor: '#fff4f4', color: '#7a2424', borderRadius: 8, padding: 12 },
  card: {
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde3ea',
    padding: 16,
  },
  productName: { color: '#17202a', fontWeight: '800' },
  subtext: { color: '#697386' },
  variant: {
    minHeight: 44,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eef1f3',
  },
  empty: { color: '#697386', textAlign: 'center', padding: 24 },
})
