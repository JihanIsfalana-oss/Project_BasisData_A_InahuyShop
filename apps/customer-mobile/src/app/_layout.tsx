import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useColorScheme } from 'react-native'
import { useEffect } from 'react'

import { CustomerProvider } from '@/context/CustomerProvider'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  useEffect(() => {
    SplashScreen.hideAsync().catch((error) => {
      console.warn('Unable to hide splash screen', error)
    })
  }, [])
  return (
    <CustomerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ title: 'Masuk', presentation: 'modal' }} />
          <Stack.Screen name="product/[productId]" options={{ title: 'Detail produk' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="payment/[orderId]" options={{ title: 'Pembayaran' }} />
          <Stack.Screen name="order/[orderId]" options={{ title: 'Detail pesanan' }} />
          <Stack.Screen name="profile" options={{ title: 'Profil' }} />
          <Stack.Screen name="addresses" options={{ title: 'Alamat' }} />
        </Stack>
      </ThemeProvider>
    </CustomerProvider>
  )
}
