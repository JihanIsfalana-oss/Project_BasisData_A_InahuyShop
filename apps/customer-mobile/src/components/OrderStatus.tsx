import { StyleSheet, Text } from 'react-native'

import { Colors } from '@/constants/theme'
import { formatStatus } from '@/lib/format'

export function OrderStatus({ status }: { status: string }) {
  return <Text style={styles.status}>{formatStatus(status)}</Text>
}

const styles = StyleSheet.create({
  status: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 999,
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
})
