import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'
import type { Customer } from '@/lib/types'

export default function ProfileScreen() {
  const { api, isAuthenticated } = useCustomer()
  const [profile, setProfile] = useState<Customer | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (isAuthenticated)
      api
        .request<Customer>('/customer/profile')
        .then((response) => {
          setProfile(response.data)
          setFullName(response.data.fullName || '')
          setPhone(response.data.phone || '')
        })
        .catch(() => setMessage('Profil gagal dimuat.'))
  }, [api, isAuthenticated])
  async function save() {
    try {
      await api.request('/customer/profile', {
        method: 'PATCH',
        body: { fullName, phone: phone || null },
      })
      setMessage('Profil tersimpan.')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Profil gagal disimpan.')
    }
  }
  if (!isAuthenticated)
    return (
      <AppScreen title="Profil">
        <StateView title="Masuk untuk mengelola profil" />
      </AppScreen>
    )
  return (
    <AppScreen title="Profil">
      <Text>{profile?.email}</Text>
      <TextInput
        accessibilityLabel="Nama lengkap"
        onChangeText={setFullName}
        placeholder="Nama lengkap"
        style={styles.input}
        value={fullName}
      />
      <TextInput
        accessibilityLabel="Nomor telepon"
        onChangeText={setPhone}
        placeholder="Nomor telepon"
        style={styles.input}
        value={phone}
      />
      <ActionButton onPress={save}>Simpan</ActionButton>
      {message ? (
        <Text accessibilityRole="status" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  input: {
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: Spacing.two,
  },
  message: { color: Colors.light.primary },
})
