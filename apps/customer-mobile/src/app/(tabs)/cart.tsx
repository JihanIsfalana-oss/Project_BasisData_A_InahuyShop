import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { formatMoney } from '@/lib/format'
import type { CartItem } from '@/lib/types'

export default function CartScreen() {
  const { api, cart, isAuthenticated, refreshCart } = useCustomer()
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (isAuthenticated)
      refreshCart().catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Keranjang gagal dimuat.'),
      )
  }, [isAuthenticated, refreshCart])

  if (!isAuthenticated)
    return (
      <AppScreen title="Keranjang">
        <StateView title="Masuk untuk melihat keranjang" onRetry={() => router.push('/auth')} />
      </AppScreen>
    )
  if (error)
    return (
      <AppScreen title="Keranjang">
        <StateView
          title="Keranjang gagal dimuat"
          message={error}
          onRetry={() => refreshCart().catch(() => {})}
        />
      </AppScreen>
    )
  return (
    <AppScreen title="Keranjang">
      {cart.items.length === 0 ? (
        <StateView
          title="Keranjang masih kosong"
          message="Pilih produk dari beranda."
          onRetry={() => router.replace('/')}
        />
      ) : null}
      {cart.items.map((item: CartItem) => (
        <View key={item.variantId} style={styles.item}>
          <View style={styles.copy}>
            <Text style={styles.name}>{item.product?.name}</Text>
            <Text>{item.variantName}</Text>
            <Text>
              {item.quantity} × {formatMoney(item.price)}
            </Text>
          </View>
          <ActionButton
            variant="danger"
            onPress={async () => {
              await api.request(`/customer/cart/items/${item.variantId}`, { method: 'DELETE' })
              await refreshCart()
            }}
          >
            Hapus
          </ActionButton>
        </View>
      ))}
      {cart.items.length > 0 ? (
        <ActionButton onPress={() => router.push('/checkout')}>Lanjut checkout</ActionButton>
      ) : null}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
  },
  copy: { flex: 1, gap: 4 },
  name: { color: Colors.light.text, fontSize: 16, fontWeight: '700' },
})
