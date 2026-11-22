import { ApiClientError } from '@inahuyshop/api-client'
import { router } from 'expo-router'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { createAdminApi } from '@/lib/api'
import { clearAdminSessionToken, readAdminSessionToken, saveAdminSessionToken } from '@/lib/session'

type Admin = { id: string; username: string }
type Api = ReturnType<typeof createAdminApi>

type AdminContextValue = {
  api: Api
  token: string | null
  admin: Admin | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message
  if (error instanceof Error) return error.message
  return 'Terjadi gangguan jaringan. Coba lagi.'
}

export function AdminProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const api = useMemo(() => createAdminApi(() => token), [token])

  const clearSession = useCallback(async () => {
    await clearAdminSessionToken()
    setToken(null)
    setAdmin(null)
  }, [])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      try {
        const storedToken = await readAdminSessionToken()
        if (!storedToken) return
        setToken(storedToken)
        const bootstrapApi = createAdminApi(() => storedToken)
        const response = await bootstrapApi.request<{ role: string; admin: Admin }>('/auth/me')
        if (active) setAdmin(response.data.admin)
      } catch (reason) {
        if (active) {
          setError(getErrorMessage(reason))
          if (reason instanceof ApiClientError && [401, 403, 410].includes(reason.status)) {
            await clearSession()
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [clearSession])

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      setError(null)
      const response = await api.request<{ token: string; admin: Admin }>('/auth/admin/login', {
        method: 'POST',
        body: { identifier, password },
      })
      await saveAdminSessionToken(response.data.token)
      setToken(response.data.token)
      setAdmin(response.data.admin)
      router.replace('/(tabs)/dashboard')
    },
    [api],
  )

  const signOut = useCallback(async () => {
    try {
      if (token) await api.request('/auth/logout', { method: 'POST' })
    } finally {
      await clearSession()
      router.replace('/auth')
    }
  }, [api, clearSession, token])

  const value = useMemo(
    () => ({
      api,
      token,
      admin,
      loading,
      error,
      isAuthenticated: Boolean(token && admin),
      signIn,
      signOut,
      clearError: () => setError(null),
    }),
    [admin, api, error, loading, signIn, signOut, token],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error('useAdmin must be used inside AdminProvider')
  return value
}
