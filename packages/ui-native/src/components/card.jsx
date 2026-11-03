import { View } from 'react-native'

/**
 * Komponen pembuktian integrasi RS-01.8.5.
 * Didefinisikan ulang pada M-07.5.
 *
 * @param {{ children?: import('react').ReactNode }} props
 */
export function Card({ children }) {
  return <View testID="ui-native-card">{children}</View>
}
