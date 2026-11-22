import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Colors, Spacing } from '@/constants/theme'
import { formatMoney } from '@/lib/format'

export type ProductSummary = {
  productId: number
  name: string
  brand?: string | null
  images?: { url: string; altText?: string }[]
  variants?: { price: number | string; stockQty: number; deliveryType: string }[]
}

export function ProductCard({
  product,
  onPress,
}: {
  product: ProductSummary
  onPress: () => void
}) {
  const variant = product.variants?.[0]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Buka produk ${product.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {product.images?.[0]?.url ? (
        <Image source={product.images[0].url} contentFit="cover" style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>INAHUY</Text>
        </View>
      )}
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
        <Text style={styles.price}>
          {variant ? formatMoney(variant.price) : 'Harga belum tersedia'}
        </Text>
        {variant?.stockQty === 0 && variant.deliveryType === 'physical' ? (
          <Text style={styles.unavailable}>Stok habis</Text>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.75 },
  image: { backgroundColor: Colors.light.backgroundElement, height: 150, width: '100%' },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    height: 150,
    justifyContent: 'center',
  },
  placeholderText: { color: Colors.light.primary, fontWeight: '800' },
  copy: { gap: 4, padding: Spacing.two },
  name: { color: Colors.light.text, fontSize: 16, fontWeight: '700' },
  brand: { color: Colors.light.textSecondary, fontSize: 13 },
  price: { color: Colors.light.primary, fontSize: 16, fontWeight: '800' },
  unavailable: { color: '#B91C1C', fontSize: 12, fontWeight: '700' },
})
