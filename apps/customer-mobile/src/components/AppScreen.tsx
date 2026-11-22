import type { PropsWithChildren, ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, Spacing } from '@/constants/theme'

export function AppScreen({
  children,
  title,
  headerRight,
}: PropsWithChildren<{ title?: string; headerRight?: ReactNode }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        accessible
      >
        {(title || headerRight) && (
          <View style={styles.header}>
            {title ? (
              <Text style={styles.title} maxFontSizeMultiplier={1.4}>
                {title}
              </Text>
            ) : (
              <View />
            )}
            {headerRight}
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  content: { flexGrow: 1, gap: Spacing.three, padding: Spacing.three, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: Colors.light.text, fontSize: 28, fontWeight: '800' },
})
