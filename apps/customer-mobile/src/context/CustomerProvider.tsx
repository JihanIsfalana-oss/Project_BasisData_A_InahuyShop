import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ApiClientError } from '@inahuyshop/api-client'

import { createCustomerApi } from '@/lib/api'
import {
  clearSessionToken,
  readSessionToken,
  saveSessionToken,
  shouldClearSession,
} from '@/lib/session'
import type { Cart, Customer, Session } from '@/lib/types'

type Api = ReturnType<typeof createCustomerApi>

type CustomerContextValue = {
  api: Api
  token: string | null
  session: Session | null
  cart: Cart
  loading: boolean
  offline: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (identifier: string, password: string) => Promise<void>
  signUp: (input: {
    fullName: string
    email: string
    password: string
    phone?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  refreshCart: () => Promise<void>
  setError: (message: string | null) => void
  clearError: () => void
}

const CustomerContext = createContext<CustomerContextValue | null>(null)

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message
  if (error instanceof Error) return error.message
  return 'Terjadi gangguan jaringan. Coba lagi.'
}

export function CustomerProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = useMemo(() => createCustomerApi(() => token), [token])

  const clearSession = useCallback(async () => {
    await clearSessionToken()
    setToken(null)
    setSession(null)
    setCart({ items: [] })
  }, [])

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [] })
      return
    }
    try {
      const response = await api.request<Cart>('/customer/cart')
      setCart(response.data)
      setOffline(false)
    } catch (reason) {
      if (reason instanceof ApiClientError && reason.status === 401) await clearSession()
      else setOffline(true)
      throw reason
    }
  }, [api, clearSession, token])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      try {
        const storedToken = await readSessionToken()
        if (!storedToken) return
        setToken(storedToken)
        const bootstrapApi = createCustomerApi(() => storedToken)
        const [sessionResponse, cartResponse] = await Promise.all([
          bootstrapApi.request<Session>('/auth/me'),
          bootstrapApi.request<Cart>('/customer/cart'),
        ])
        if (active) {
          setSession(sessionResponse.data)
          setCart(cartResponse.data)
          setOffline(false)
        }
      } catch (reason) {
        if (active) {
          setError(getErrorMessage(reason))
          setOffline(true)
          if (shouldClearSession(reason)) await clearSession()
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

  const authenticate = useCallback(
    async (path: string, body: Record<string, string | undefined>) => {
      setError(null)
      const response = await api.request<{ token: string; customer: Customer }>(path, {
        method: 'POST',
        body,
      })
      await saveSessionToken(response.data.token)
      setToken(response.data.token)
      setSession({
        role: 'customer',
        customer: response.data.customer,
      })
      const authenticatedApi = createCustomerApi(() => response.data.token)
      const cartResponse = await authenticatedApi.request<Cart>('/customer/cart')
      setCart(cartResponse.data)
      setOffline(false)
    },
    [api],
  )

  const signIn = useCallback(
    (identifier: string, password: string) => authenticate('/auth/login', { identifier, password }),
    [authenticate],
  )

  const signUp = useCallback(
    (input: { fullName: string; email: string; password: string; phone?: string }) =>
      authenticate('/auth/register', input),
    [authenticate],
  )

  const signOut = useCallback(async () => {
    try {
      if (token) await api.request('/auth/logout', { method: 'POST' })
    } finally {
      await clearSession()
    }
  }, [api, clearSession, token])

  const value = useMemo(
    () => ({
      api,
      token,
      session,
      cart,
      loading,
      offline,
      error,
      isAuthenticated: Boolean(token && session),
      signIn,
      signUp,
      signOut,
      refreshCart,
      setError,
      clearError: () => setError(null),
    }),
    [api, cart, error, loading, offline, refreshCart, session, signIn, signOut, signUp, token],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  const value = useContext(CustomerContext)
  if (!value) throw new Error('useCustomer must be used inside CustomerProvider')
  return value
}
