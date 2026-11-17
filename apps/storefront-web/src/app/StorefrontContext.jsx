import { useCallback, useEffect, useMemo, useState } from 'react'
import { createStorefrontApi } from './api.js'
import { navigate } from './routes.js'
import { StorefrontContext } from './context.js'

const TOKEN_KEY = 'inahuyshop.session.token'

function readToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function StorefrontProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [account, setAccount] = useState(null)
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  const api = useMemo(() => createStorefrontApi(() => token), [token])

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setAccount(null)
    setCart({ items: [] })
  }, [])

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [] })
      return
    }
    const response = await api.request('/customer/cart')
    setCart(response.data)
  }, [api, token])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const [session] = await Promise.all([
          api.request('/auth/me'),
          refreshCart().catch((error) => {
            if (error.status === 401) throw error
            setNotice(error.message)
          }),
        ])
        if (active) setAccount(session.data)
      } catch (error) {
        if (error.status === 401) clearSession()
        else if (active) setNotice(error.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [api, clearSession, refreshCart, token])

  const authenticate = useCallback(
    async (path, body) => {
      const response = await api.request(path, { method: 'POST', body })
      window.localStorage.setItem(TOKEN_KEY, response.data.token)
      setToken(response.data.token)
      setAccount(
        path.endsWith('/register') ? { role: 'customer', customer: response.data.customer } : null,
      )
      await refreshCart().catch(() => {})
      return response.data
    },
    [api, refreshCart],
  )

  const logout = useCallback(async () => {
    if (token) await api.request('/auth/logout', { method: 'POST' }).catch(() => {})
    clearSession()
    navigate('/')
  }, [api, clearSession, token])

  const value = useMemo(
    () => ({
      api,
      account,
      cart,
      loading,
      notice,
      setNotice,
      token,
      isAuthenticated: Boolean(token && account),
      authenticate,
      logout,
      clearSession,
      refreshCart,
    }),
    [account, api, authenticate, cart, clearSession, loading, logout, notice, refreshCart, token],
  )

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>
}
