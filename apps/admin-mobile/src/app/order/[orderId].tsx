import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAdmin } from '@/context/AdminProvider'
import { getAllowedTrackingStatuses, isDestructiveAdminAction } from '@/lib/action-policy'

type Order = {
  orderId: number
  orderNumber: string
  status: string
  totalAmount: number
  customer?: { fullName?: string; email?: string }
  shipment?: { shipmentId: number; tracking?: { status: string }[] }
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const { api } = useAdmin()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [courier, setCourier] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await api.request<Order[]>(`/admin/orders?page=1&pageSize=100`)
      setOrder(response.data.find((item) => String(item.orderId) === orderId) ?? null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.')
    }
  }, [api, orderId])

  useEffect(() => {
    const initialLoad = async () => load()
    initialLoad()
  }, [load])

  async function changeStatus(status: string) {
    Alert.alert('Konfirmasi', `Ubah status pesanan menjadi ${status}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Lanjut',
        style: isDestructiveAdminAction(status) ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await api.request(`/admin/orders/${orderId}/status`, {
              method: 'PATCH',
              body: { status },
            })
            await load()
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Status gagal diperbarui.')
          }
        },
      },
    ])
  }

  async function createShipment() {
    if (!courier || !serviceType || !trackingNumber) {
      setError('Kurir, layanan, dan nomor resi wajib diisi.')
      return
    }
    Alert.alert('Konfirmasi pengiriman', 'Buat shipment dan ubah pesanan menjadi shipped?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kirim',
        onPress: async () => {
          try {
            await api.request(`/admin/orders/${orderId}/shipment`, {
              method: 'POST',
              body: { courier, serviceType, trackingNumber },
            })
            await load()
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Shipment gagal dibuat.')
          }
        },
      },
    ])
  }

  async function updateTracking(status: string) {
    const shipmentId = order?.shipment?.shipmentId
    if (!shipmentId) return
    Alert.alert('Konfirmasi tracking', `Ubah tracking menjadi ${status}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Lanjut',
        onPress: async () => {
          try {
            await api.request(`/admin/shipments/${shipmentId}/tracking`, {
              method: 'POST',
              body: { status },
            })
            await load()
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Tracking gagal diperbarui.')
          }
        },
      },
    ])
  }

  const previousTrackingStatus = order?.shipment?.tracking?.at(-1)?.status
  const nextTrackingStatuses = getAllowedTrackingStatuses(previousTrackingStatus)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {!order && !error && <Text style={styles.loading}>Memuat detail pesanan...</Text>}
        {order && (
          <>
            <Text style={styles.eyebrow}>DETAIL PESANAN</Text>
            <Text style={styles.title}>{order.orderNumber}</Text>
            <Text style={styles.subtext}>
              {order.customer?.fullName} - {order.customer?.email}
            </Text>
            <View style={styles.card}>
              <Text>Status: {order.status}</Text>
              <Text>Total: Rp{Number(order.totalAmount).toLocaleString('id-ID')}</Text>
            </View>
            {order.status === 'paid' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => changeStatus('processing')}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Mulai proses</Text>
              </Pressable>
            )}
            {order.status === 'pending_payment' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => changeStatus('cancelled')}
                style={[styles.button, styles.danger]}
              >
                <Text style={styles.buttonText}>Batalkan pesanan</Text>
              </Pressable>
            )}
            {order.status === 'processing' && !order.shipment && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Buat shipment</Text>
                <TextInput
                  accessibilityLabel="Kurir"
                  onChangeText={setCourier}
                  placeholder="Kurir"
                  style={styles.input}
                  value={courier}
                />
                <TextInput
                  accessibilityLabel="Jenis layanan"
                  onChangeText={setServiceType}
                  placeholder="Jenis layanan"
                  style={styles.input}
                  value={serviceType}
                />
                <TextInput
                  accessibilityLabel="Nomor resi"
                  onChangeText={setTrackingNumber}
                  placeholder="Nomor resi"
                  style={styles.input}
                  value={trackingNumber}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={createShipment}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Kirim pesanan</Text>
                </Pressable>
              </View>
            )}
            {order.shipment &&
              nextTrackingStatuses.map((status: string) => (
                <Pressable
                  accessibilityRole="button"
                  key={status}
                  onPress={() => updateTracking(status)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Tracking: {status}</Text>
                </Pressable>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 20, gap: 12 },
  eyebrow: { color: '#697386', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17202a', fontSize: 26, fontWeight: '800' },
  subtext: { color: '#697386' },
  loading: { color: '#697386', padding: 20 },
  error: { backgroundColor: '#fff4f4', color: '#7a2424', borderRadius: 8, padding: 12 },
  card: {
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde3ea',
    padding: 16,
  },
  sectionTitle: { color: '#17202a', fontWeight: '800' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#dde3ea',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1f6f5c',
    paddingHorizontal: 12,
  },
  danger: { backgroundColor: '#a43a3a' },
  buttonText: { color: '#fff', fontWeight: '800' },
})
