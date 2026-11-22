import { useState } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { ActionButton } from '@/components/ActionButton'
import { AppScreen } from '@/components/AppScreen'
import { useCustomer } from '@/context/CustomerProvider'
import { Colors, Spacing } from '@/constants/theme'

export default function AuthScreen() {
  const { signIn, signUp } = useCustomer()
  const [registering, setRegistering] = useState(false)
  const [fullName, setFullName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      if (registering) await signUp({ fullName, email: identifier, password })
      else await signIn(identifier, password)
      router.back()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Autentikasi gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppScreen title={registering ? 'Buat akun' : 'Masuk'}>
      <View style={styles.form}>
        {registering ? (
          <TextInput
            accessibilityLabel="Nama lengkap"
            onChangeText={setFullName}
            placeholder="Nama lengkap"
            style={styles.input}
            value={fullName}
          />
        ) : null}
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setIdentifier}
          placeholder="Email"
          style={styles.input}
          value={identifier}
        />
        <TextInput
          accessibilityLabel="Kata sandi"
          onChangeText={setPassword}
          placeholder="Kata sandi"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <ActionButton loading={loading} onPress={submit}>
          {registering ? 'Daftar' : 'Masuk'}
        </ActionButton>
        <ActionButton onPress={() => setRegistering((value) => !value)} variant="secondary">
          {registering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </ActionButton>
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two },
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
