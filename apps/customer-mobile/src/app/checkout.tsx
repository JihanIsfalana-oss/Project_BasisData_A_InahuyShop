import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, TextInput } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import { createIdempotencyKey, formatMoney } from '@/lib/format'
import type { Address, Cart } from '@/lib/types'

export default function CheckoutScreen() {
  const { api, cart, isAuthenticated } = useCustomer()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState<number | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    api
      .request<Address[]>('/customer/addresses')
      .then((response) => {
        setAddresses(response.data)
        setAddressId(
          response.data.find((item: any) => item.isDefault)?.addressId ??
            response.data[0]?.addressId ??
            null,
        )
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Alamat gagal dimuat.'),
      )
  }, [api, isAuthenticated])

  const needsAddress = cart.items.some(
    (item: Cart['items'][number]) => item.deliveryType === 'physical',
  )

  async function submit() {
    if (needsAddress && !addressId) {
      setError('Pilih alamat pengiriman terlebih dahulu.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await api.request('/customer/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': createIdempotencyKey() },
        body: {
          ...(addressId ? { addressId } : {}),
          ...(voucherCode.trim() ? { voucherCode: voucherCode.trim().toUpperCase() } : {}),
        },
      })
      router.replace(`/payment/${response.data.orderId}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Checkout gagal.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated)
    return (
      <AppScreen title="Checkout">
        <StateView title="Masuk untuk checkout" onRetry={() => router.push('/auth')} />
      </AppScreen>
    )
  return (
    <AppScreen title="Checkout">
      <Text style={styles.heading}>Ringkasan item</Text>
      {cart.items.map((item) => (
        <Text key={item.variantId}>
          {item.product?.name} · {item.quantity} × {formatMoney(item.price)}
        </Text>
      ))}
      {needsAddress ? (
        <>
          <Text style={styles.heading}>Alamat pengiriman</Text>
          {addresses.length === 0 ? (
            <StateView
              title="Belum ada alamat"
              message="Tambahkan alamat dari menu Akun."
              onRetry={() => router.push('/addresses')}
            />
          ) : (
            addresses.map((address) => (
              <ActionButton
                key={address.addressId}
                onPress={() => setAddressId(address.addressId)}
                variant={addressId === address.addressId ? 'primary' : 'secondary'}
              >
                {address.label} · {address.city}
              </ActionButton>
            ))
          )}
        </>
      ) : null}
      <Text style={styles.heading}>Voucher</Text>
      <TextInput
        accessibilityLabel="Kode voucher"
        autoCapitalize="characters"
        onChangeText={setVoucherCode}
        placeholder="Masukkan kode voucher"
        style={styles.input}
        value={voucherCode}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <ActionButton loading={loading} onPress={submit}>
        Buat pesanan
      </ActionButton>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  heading: { color: Colors.light.text, fontSize: 18, fontWeight: '800', marginTop: Spacing.two },
  input: {
    backgroundColor: '#fff',
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.two,
  },
  error: { color: '#B91C1C' },
})
