import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { StyleSheet, Text } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors } from '@/constants/theme'

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>()
  const { api } = useCustomer()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function simulate(status: 'success' | 'failed' | 'expired') {
    setLoading(true)
    setError(null)
    try {
      await api.request(`/customer/orders/${orderId}/payment/simulate`, {
        method: 'POST',
        body: { status },
      })
      router.replace(`/order/${orderId}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Simulasi pembayaran gagal.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AppScreen title="Simulasi pembayaran">
      <Text>Pilih hasil pembayaran untuk melanjutkan pesanan.</Text>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <ActionButton loading={loading} onPress={() => simulate('success')}>
        Bayar berhasil
      </ActionButton>
      <ActionButton disabled={loading} onPress={() => simulate('failed')} variant="secondary">
        Bayar gagal
      </ActionButton>
      <ActionButton disabled={loading} onPress={() => simulate('expired')} variant="danger">
        Kedaluwarsa
      </ActionButton>
    </AppScreen>
  )
}

const styles = StyleSheet.create({ error: { color: Colors.light.text, marginVertical: 12 } })
