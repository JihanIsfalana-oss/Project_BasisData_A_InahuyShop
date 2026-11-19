import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import type { Address } from '@/lib/types'

type AddressForm = {
  label: string
  street: string
  district: string
  city: string
  province: string
  postalCode: string
}
const emptyForm: AddressForm = {
  label: '',
  street: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
}

export default function AddressesScreen() {
  const { api, isAuthenticated } = useCustomer()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState<string | null>(null)
  const load = useCallback(async () => {
    try {
      const response = await api.request<Address[]>('/customer/addresses')
      setAddresses(response.data)
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Alamat gagal dimuat.')
    }
  }, [api])
  useEffect(() => {
    if (!isAuthenticated) return
    const timer = setTimeout(() => load(), 0)
    return () => clearTimeout(timer)
  }, [isAuthenticated, load])
  async function add() {
    try {
      await api.request('/customer/addresses', {
        method: 'POST',
        body: { ...form, isDefault: addresses.length === 0 },
      })
      setForm(emptyForm)
      setMessage('Alamat tersimpan.')
      await load()
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Alamat gagal disimpan.')
    }
  }
  async function remove(addressId: number) {
    try {
      await api.request(`/customer/addresses/${addressId}`, { method: 'DELETE' })
      await load()
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Alamat gagal dihapus.')
    }
  }
  if (!isAuthenticated)
    return (
      <AppScreen title="Alamat">
        <StateView title="Masuk untuk mengelola alamat" />
      </AppScreen>
    )
  return (
    <AppScreen title="Alamat">
      {addresses.map((address) => (
        <View key={address.addressId} style={styles.card}>
          <Text style={styles.name}>{address.label}</Text>
          <Text>{address.city}</Text>
          <ActionButton variant="danger" onPress={() => remove(address.addressId)}>
            Hapus
          </ActionButton>
        </View>
      ))}
      <Text style={styles.heading}>Tambah alamat</Text>
      {Object.keys(form).map((field) => (
        <TextInput
          key={field}
          accessibilityLabel={field}
          onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
          placeholder={field}
          style={styles.input}
          value={form[field as keyof AddressForm]}
        />
      ))}
      <ActionButton onPress={add}>Tambah alamat</ActionButton>
      {message ? (
        <Text accessibilityRole="status" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, gap: Spacing.two, padding: Spacing.three },
  name: { color: Colors.light.text, fontSize: 17, fontWeight: '800' },
  heading: { color: Colors.light.text, fontSize: 18, fontWeight: '800', marginTop: Spacing.two },
  input: {
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.two,
  },
  message: { color: Colors.light.primary },
})
