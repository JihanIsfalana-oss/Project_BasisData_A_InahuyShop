import { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { formatMoney } from '@/lib/format'

type Variant = {
  variantId: number
  variantName: string
  price: string | number
  stockQty: number
  deliveryType: string
}
type Product = {
  name: string
  description?: string
  images?: { url: string }[]
  variants: Variant[]
  reviews?: { rating: number; comment?: string }[]
}

export default function ProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>()
  const { api, isAuthenticated, refreshCart } = useCustomer()
  const [product, setProduct] = useState<Product | null>(null)
  const [selected, setSelected] = useState<Variant | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    api
      .request<Product>(`/products/${productId}`)
      .then((response) => {
        setProduct(response.data)
        setSelected(
          response.data.variants.find((item) => item.stockQty > 0) ??
            response.data.variants[0] ??
            null,
        )
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Produk tidak tersedia.'),
      )
  }, [api, productId])

  async function addToCart() {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    if (!selected) return
    try {
      await api.request('/customer/cart/items', {
        method: 'POST',
        body: { variantId: selected.variantId, quantity: 1 },
      })
      await refreshCart()
      setMessage('Produk masuk ke keranjang.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Produk gagal ditambahkan.')
    }
  }

  if (error)
    return (
      <AppScreen title="Detail produk">
        <StateView title="Produk tidak tersedia" message={error} />
      </AppScreen>
    )
  if (!product)
    return (
      <AppScreen title="Detail produk">
        <StateView title="Memuat produk..." />
      </AppScreen>
    )
  return (
    <AppScreen title={product.name}>
      {product.images?.[0]?.url ? (
        <Image source={product.images[0].url} contentFit="cover" style={styles.image} />
      ) : null}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.heading}>Pilih varian</Text>
      <View style={styles.variants}>
        {product.variants.map((variant) => (
          <Pressable
            key={variant.variantId}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected?.variantId === variant.variantId }}
            onPress={() => setSelected(variant)}
            style={[styles.variant, selected?.variantId === variant.variantId && styles.selected]}
          >
            <Text style={styles.variantName}>{variant.variantName}</Text>
            <Text>{formatMoney(variant.price)}</Text>
            <Text style={styles.meta}>
              {variant.deliveryType === 'digital' ? 'Digital' : `Stok ${variant.stockQty}`}
            </Text>
          </Pressable>
        ))}
      </View>
      <ActionButton
        disabled={!selected || (selected.deliveryType === 'physical' && selected.stockQty < 1)}
        onPress={addToCart}
      >
        Tambah ke keranjang
      </ActionButton>
      {message ? (
        <Text accessibilityRole="status" style={styles.success}>
          {message}
        </Text>
      ) : null}
      <Text style={styles.heading}>Ulasan pelanggan</Text>
      {product.reviews?.length ? (
        product.reviews.map((review, index) => (
          <View key={`${review.rating}-${index}`} style={styles.review}>
            <Text>{'★'.repeat(review.rating)}</Text>
            <Text>{review.comment || 'Tanpa komentar'}</Text>
          </View>
        ))
      ) : (
        <Text>Belum ada ulasan.</Text>
      )}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 16,
    height: 240,
    width: '100%',
  },
  name: { color: Colors.light.text, fontSize: 28, fontWeight: '800' },
  description: { color: Colors.light.textSecondary, fontSize: 16, lineHeight: 24 },
  heading: { color: Colors.light.text, fontSize: 18, fontWeight: '800', marginTop: Spacing.two },
  variants: { gap: Spacing.two },
  variant: {
    backgroundColor: '#fff',
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: Spacing.two,
  },
  selected: { borderColor: Colors.light.primary, borderWidth: 2 },
  variantName: { fontWeight: '700' },
  meta: { color: Colors.light.textSecondary, fontSize: 13 },
  review: { backgroundColor: '#fff', borderRadius: 12, gap: 4, padding: Spacing.two },
  success: { color: '#15803D', fontWeight: '700' },
})
