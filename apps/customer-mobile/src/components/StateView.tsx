import { StyleSheet, Text, View } from 'react-native'

import { ActionButton } from './ActionButton'
import { Colors, Spacing } from '@/constants/theme'

export function StateView({
  title,
  message,
  onRetry,
}: {
  title: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <ActionButton onPress={onRetry} variant="secondary">
          Coba lagi
        </ActionButton>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.two, padding: Spacing.five },
  title: { color: Colors.light.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { color: Colors.light.textSecondary, textAlign: 'center' },
})
