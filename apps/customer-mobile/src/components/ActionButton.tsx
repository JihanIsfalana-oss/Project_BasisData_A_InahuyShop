import type { PropsWithChildren } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { Colors, Spacing } from '@/constants/theme'

export function ActionButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  accessibilityLabel,
}: PropsWithChildren<{
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  accessibilityLabel?: string
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || disabled || loading) && styles.muted,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.light.primary} />
      ) : (
        <Text style={[styles.label, variant === 'primary' && styles.primaryLabel]}>{children}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  primary: { backgroundColor: Colors.light.primary },
  secondary: { backgroundColor: Colors.light.backgroundElement },
  danger: { backgroundColor: '#FEE2E2' },
  label: { color: Colors.light.primary, fontSize: 16, fontWeight: '700' },
  primaryLabel: { color: '#fff' },
  muted: { opacity: 0.55 },
})
