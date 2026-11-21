import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'

import { Colors } from '@/constants/theme'

export default function TabLayout() {
  const scheme = useColorScheme()
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light']
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="cart" options={{ title: 'Keranjang' }} />
      <Tabs.Screen name="orders" options={{ title: 'Pesanan' }} />
      <Tabs.Screen name="account" options={{ title: 'Akun' }} />
    </Tabs>
  )
}
