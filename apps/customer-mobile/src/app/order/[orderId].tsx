import { useCallback, useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { OrderStatus } from '@/components/OrderStatus'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { downloadDigitalAsset } from '@/lib/download'
import { formatMoney } from '@/lib/format'
import type { Order } from '@/lib/types'

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const { api, token } = useCustomer()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')

  const loadOrder = useCallback(async () => {
    try {
      const response = await api.request<Order>(`/customer/orders/${orderId}`)
      setOrder(response.data)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pesanan tidak tersedia.')
    }
  }, [api, orderId])
  useEffect(() => {
    const timer = setTimeout(() => loadOrder(), 0)
    return () => clearTimeout(timer)
  }, [loadOrder])

  async function download(deliveryId: number) {
    try {
      if (!token) throw new Error('Sesi berakhir. Masuk kembali.')
      const tokenResponse = await api.request<{ downloadUrl: string; downloadToken: string }>(
        `/customer/digital-deliveries/${deliveryId}/token`,
      )
      await downloadDigitalAsset(
        tokenResponse.data.downloadUrl,
        token,
        tokenResponse.data.downloadToken,
        `inahuyshop-${deliveryId}`,
      )
      setMessage('File siap dibuka.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Download gagal.')
    }
  }

  async function review(orderItemId: number) {
    try {
      const value = Number(rating)
      if (!Number.isInteger(value) || value < 1 || value > 5)
        throw new Error('Rating harus 1 sampai 5.')
      await api.request(`/customer/order-items/${orderItemId}/reviews`, {
        method: 'POST',
        body: { rating: value, comment: comment.trim() || undefined },
      })
      setMessage('Ulasan terkirim.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ulasan gagal dikirim.')
    }
  }

  if (error && !order)
    return (
      <AppScreen title="Detail pesanan">
        <StateView title="Pesanan tidak tersedia" message={error} onRetry={loadOrder} />
      </AppScreen>
    )
  if (!order)
    return (
      <AppScreen title="Detail pesanan">
        <StateView title="Memuat pesanan..." />
      </AppScreen>
    )
  return (
    <AppScreen title={`#${order.orderNumber}`}>
      <OrderStatus status={order.status} />
      {order.items.map((item) => (
        <View key={item.orderItemId} style={styles.card}>
          <Text style={styles.name}>{item.productName}</Text>
          <Text>
            {item.quantity} × {formatMoney(item.unitPrice)}
          </Text>
          {item.digitalDeliveries?.map((delivery) => (
            <ActionButton key={delivery.deliveryId} onPress={() => download(delivery.deliveryId)}>
              Unduh produk digital
            </ActionButton>
          ))}
          <TextInput
            accessibilityLabel="Rating"
            keyboardType="number-pad"
            onChangeText={setRating}
            placeholder="Rating 1-5"
            style={styles.input}
            value={rating}
          />
          <TextInput
            accessibilityLabel="Komentar ulasan"
            onChangeText={setComment}
            placeholder="Tulis ulasan (opsional)"
            style={styles.input}
            value={comment}
          />
          <ActionButton variant="secondary" onPress={() => review(item.orderItemId)}>
            Kirim ulasan
          </ActionButton>
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.heading}>Ringkasan</Text>
        <Text>Total {formatMoney(order.grandTotal)}</Text>
        {order.shipment ? (
          <>
            <Text style={styles.heading}>Pengiriman</Text>
            <Text>
              {order.shipment.courier || 'Kurir manual'} ·{' '}
              {order.shipment.trackingNumber || 'Resi belum tersedia'}
            </Text>
            {order.shipment.tracking?.map((event) => (
              <Text key={event.trackingSeq}>
                {event.status} · {event.description}
              </Text>
            ))}
          </>
        ) : null}
      </View>
      {order.status === 'pending_payment' ? (
        <ActionButton onPress={() => router.push(`/payment/${order.orderId}`)}>
          Bayar sekarang
        </ActionButton>
      ) : null}
      {message ? (
        <Text accessibilityRole="status" style={styles.success}>
          {message}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, gap: Spacing.two, padding: Spacing.three },
  name: { color: Colors.light.text, fontSize: 17, fontWeight: '800' },
  heading: { color: Colors.light.text, fontSize: 18, fontWeight: '800' },
  input: {
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.two,
  },
  success: { color: '#15803D', fontWeight: '700' },
  error: { color: '#B91C1C' },
})
