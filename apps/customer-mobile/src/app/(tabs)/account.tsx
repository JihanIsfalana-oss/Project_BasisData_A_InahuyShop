import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { StateView } from '@/components/StateView'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'

export default function AccountScreen() {
  const { session, isAuthenticated, signOut } = useCustomer()
  if (!isAuthenticated)
    return (
      <AppScreen title="Akun">
        <StateView title="Masuk untuk mengelola akun" onRetry={() => router.push('/auth')} />
      </AppScreen>
    )
  return (
    <AppScreen title="Akun">
      <View style={styles.card}>
        <Text style={styles.name}>{session?.customer.fullName}</Text>
        <Text>{session?.customer.email}</Text>
      </View>
      <ActionButton onPress={() => router.push('/profile')}>Edit profil</ActionButton>
      <ActionButton onPress={() => router.push('/addresses')} variant="secondary">
        Kelola alamat
      </ActionButton>
      <ActionButton onPress={() => signOut()} variant="danger">
        Keluar
      </ActionButton>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, gap: Spacing.two, padding: Spacing.three },
  name: { color: Colors.light.text, fontSize: 20, fontWeight: '800' },
})
