import { useCallback, useEffect, useState } from 'react'
import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { AppScreen } from '@/components/AppScreen'
import { OrderStatus } from '@/components/OrderStatus'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { formatMoney } from '@/lib/format'
import type { Order } from '@/lib/types'

export default function OrdersScreen() {
  const { api, isAuthenticated } = useCustomer()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const loadOrders = useCallback(async () => {
    try {
      const response = await api.request<Order[]>('/customer/orders')
      setOrders(response.data)
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.')
    }
  }, [api])
  useEffect(() => {
    if (!isAuthenticated) return
    const timer = setTimeout(() => loadOrders(), 0)
    return () => clearTimeout(timer)
  }, [isAuthenticated, loadOrders])
  if (!isAuthenticated)
    return (
      <AppScreen title="Pesanan">
        <StateView title="Masuk untuk melihat pesanan" onRetry={() => router.push('/auth')} />
      </AppScreen>
    )
  if (error)
    return (
      <AppScreen title="Pesanan">
        <StateView title="Pesanan gagal dimuat" message={error} onRetry={loadOrders} />
      </AppScreen>
    )
  return (
    <AppScreen title="Pesanan">
      {orders.length === 0 ? (
        <StateView
          title="Belum ada pesanan"
          message="Pesanan yang dibuat akan tampil di sini."
          onRetry={() => router.replace('/')}
        />
      ) : (
        orders.map((order) => (
          <Pressable
            key={order.orderId}
            accessibilityRole="button"
            onPress={() => router.push(`/order/${order.orderId}`)}
            style={styles.order}
          >
            <View>
              <Text style={styles.number}>#{order.orderNumber}</Text>
              <Text>{new Date(order.orderDate).toLocaleDateString('id-ID')}</Text>
            </View>
            <View style={styles.right}>
              <OrderStatus status={order.status} />
              <Text style={styles.total}>{formatMoney(order.grandTotal)}</Text>
            </View>
          </Pressable>
        ))
      )}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  order: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
  },
  number: { color: Colors.light.text, fontSize: 16, fontWeight: '800' },
  right: { alignItems: 'flex-end', gap: 6 },
  total: { color: Colors.light.primary, fontWeight: '800' },
})
