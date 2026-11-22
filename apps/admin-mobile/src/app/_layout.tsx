import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'

import { AdminProvider, useAdmin } from '@/context/AdminProvider'

SplashScreen.preventAutoHideAsync()

function RootNavigation() {
  const colorScheme = useColorScheme()
  const { loading } = useAdmin()

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined)
  }, [])

  if (loading) return null

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: 'Login Admin', presentation: 'modal' }} />
        <Stack.Screen name="order/[orderId]" options={{ title: 'Detail Pesanan' }} />
        <Stack.Screen name="products" options={{ title: 'Produk' }} />
      </Stack>
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <AdminProvider>
      <RootNavigation />
    </AdminProvider>
  )
}
