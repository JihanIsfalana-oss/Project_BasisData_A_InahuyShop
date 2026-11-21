import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAdmin } from '@/context/AdminProvider'

export default function AdminAuthScreen() {
  const { signIn, error } = useAdmin()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function submit() {
    if (!identifier || !password) {
      setFormError('Username dan password wajib diisi.')
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      await signIn(identifier, password)
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Login admin gagal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>INAHUYSHOP</Text>
        <Text style={styles.title}>Admin Console</Text>
        {(formError || error) && (
          <Text accessibilityRole="alert" style={styles.error}>
            {formError || error}
          </Text>
        )}
        <TextInput
          accessibilityLabel="Username admin"
          autoCapitalize="none"
          onChangeText={setIdentifier}
          placeholder="Username"
          style={styles.input}
          value={identifier}
        />
        <TextInput
          accessibilityLabel="Password admin"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={submit}
          style={[styles.button, busy && styles.disabled]}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Masuk</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf2ef',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  eyebrow: { color: '#697386', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#17202a', fontSize: 28, fontWeight: '800' },
  error: { backgroundColor: '#fff4f4', borderRadius: 8, color: '#7a2424', padding: 12 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#dde3ea',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1f6f5c',
  },
  buttonText: { color: '#fff', fontWeight: '800' },
  disabled: { opacity: 0.6 },
})
