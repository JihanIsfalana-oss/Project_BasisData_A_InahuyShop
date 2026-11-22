import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAdmin } from '@/context/AdminProvider'

type Order = {
  orderId: number
  orderNumber: string
  status: string
  totalAmount: number
  customer?: { fullName?: string }
}

export default function OrdersScreen() {
  const { api } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (nextStatus = status, nextQuery = query) => {
      setError(null)
      try {
        const params = new URLSearchParams()
        if (nextStatus) params.set('status', nextStatus)
        if (nextQuery) params.set('q', nextQuery)
        const response = await api.request<Order[]>(
          `/admin/orders${params.size ? `?${params}` : ''}`,
        )
        setOrders(response.data)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.')
      }
    },
    [api, query, status],
  )

  useEffect(() => {
    const initialLoad = async () => load()
    initialLoad()
  }, [load])

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Text style={styles.eyebrow}>OPERASI</Text>
        <Text style={styles.title}>Pesanan</Text>
        <TextInput
          accessibilityLabel="Cari pesanan"
          onChangeText={setQuery}
          onSubmitEditing={() => load()}
          placeholder="Nomor pesanan atau pelanggan"
          style={styles.search}
          value={query}
        />
        <ScrollView horizontal contentContainerStyle={styles.filters}>
          {['', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'].map(
            (item) => (
              <Pressable
                accessibilityRole="button"
                key={item || 'all'}
                onPress={() => {
                  setStatus(item)
                  load(item, query)
                }}
                style={[styles.filter, status === item && styles.filterSelected]}
              >
                <Text>{item || 'Semua'}</Text>
              </Pressable>
            ),
          )}
        </ScrollView>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {orders.map((order) => (
          <Pressable
            accessibilityRole="button"
            key={order.orderId}
            onPress={() => router.push(`/order/${order.orderId}`)}
            style={styles.orderCard}
          >
            <View>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.subtext}>{order.customer?.fullName || '-'}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.status}>{order.status}</Text>
              <Text style={styles.amount}>
                Rp{Number(order.totalAmount).toLocaleString('id-ID')}
              </Text>
            </View>
          </Pressable>
        ))}
        {!error && orders.length === 0 && <Text style={styles.empty}>Tidak ada pesanan.</Text>}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 20, gap: 12 },
  eyebrow: { color: '#697386', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17202a', fontSize: 30, fontWeight: '800' },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#dde3ea',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  filters: { gap: 8 },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#e8eeec',
    paddingHorizontal: 14,
  },
  filterSelected: { backgroundColor: '#b9d9cf' },
  error: { backgroundColor: '#fff4f4', color: '#7a2424', borderRadius: 8, padding: 12 },
  orderCard: {
    minHeight: 82,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde3ea',
    padding: 14,
  },
  orderNumber: { color: '#17202a', fontWeight: '800' },
  subtext: { color: '#697386', marginTop: 4 },
  orderRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  status: { color: '#1f6f5c', fontWeight: '700' },
  amount: { color: '#17202a', fontWeight: '800' },
  empty: { color: '#697386', textAlign: 'center', padding: 24 },
})
