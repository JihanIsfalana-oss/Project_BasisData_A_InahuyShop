import { useCallback, useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { useAdmin } from '@/context/AdminProvider'

type Summary = {
  pendingOrders: number
  paidOrders: number
  activeCustomers: number
  lowStockVariants: number
}

export default function DashboardScreen() {
  const { api, admin, signOut } = useAdmin()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await api.request<Summary>('/admin/dashboard')
      setSummary(response.data)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ringkasan gagal dimuat.')
    }
  }, [api])

  useEffect(() => {
    const initialLoad = async () => load()
    initialLoad()
  }, [load])

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const cards = summary
    ? [
        ['Menunggu bayar', summary.pendingOrders],
        ['Pesanan aktif', summary.paidOrders],
        ['Pelanggan aktif', summary.activeCustomers],
        ['Stok rendah', summary.lowStockVariants],
      ]
    : []

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>RINGKASAN</Text>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtext}>{admin?.username}</Text>
          </View>
          <Text accessibilityRole="button" onPress={signOut} style={styles.logout}>
            Keluar
          </Text>
        </View>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <View style={styles.grid}>
          {cards.map(([label, value]) => (
            <View key={String(label)} style={styles.card}>
              <Text style={styles.cardLabel}>{label}</Text>
              <Text style={styles.cardValue}>{value}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/products')}
          style={styles.productButton}
        >
          <Text style={styles.productButtonText}>Ringkasan produk</Text>
        </Pressable>
        {!summary && !error && <Text style={styles.loading}>Memuat ringkasan...</Text>}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#697386', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17202a', fontSize: 30, fontWeight: '800' },
  subtext: { color: '#697386' },
  logout: { color: '#1f6f5c', fontWeight: '800', minHeight: 44, padding: 12 },
  error: { backgroundColor: '#fff4f4', color: '#7a2424', borderRadius: 8, padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    minHeight: 110,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dde3ea',
  },
  cardLabel: { color: '#697386' },
  cardValue: { color: '#17202a', fontSize: 30, fontWeight: '800' },
  productButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1f6f5c',
  },
  productButtonText: { color: '#fff', fontWeight: '800' },
  loading: { color: '#697386', paddingVertical: 20 },
})
