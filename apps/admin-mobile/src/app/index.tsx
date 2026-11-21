import { router } from 'expo-router'
import { useEffect } from 'react'

import { useAdmin } from '@/context/AdminProvider'

export default function IndexRoute() {
  const { loading, isAuthenticated } = useAdmin()

  useEffect(() => {
    if (loading) return
    router.replace(isAuthenticated ? '/(tabs)/dashboard' : '/auth')
  }, [isAuthenticated, loading])

  return null
}
