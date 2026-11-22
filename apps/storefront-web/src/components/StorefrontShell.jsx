import { useEffect, useState } from 'react'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'

export function StorefrontShell({ children }) {
  const { account, cart, isAuthenticated, logout } = useStorefront()
  const [menuOpen, setMenuOpen] = useState(false)
  const count = cart.items.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  const go = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            go('/')
          }}
        >
          InahuyShop
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <nav id="primary-navigation" className={menuOpen ? 'navigation is-open' : 'navigation'}>
          <a
            href="/catalog"
            onClick={(event) => {
              event.preventDefault()
              go('/catalog')
            }}
          >
            Katalog
          </a>
          <a
            href="/cart"
            onClick={(event) => {
              event.preventDefault()
              go('/cart')
            }}
          >
            Keranjang ({count})
          </a>
          {isAuthenticated ? (
            <>
              <a
                href="/orders"
                onClick={(event) => {
                  event.preventDefault()
                  go('/orders')
                }}
              >
                Pesanan
              </a>
              <a
                href="/account"
                onClick={(event) => {
                  event.preventDefault()
                  go('/account')
                }}
              >
                {account?.customer?.fullName ?? 'Akun'}
              </a>
              <button type="button" onClick={logout}>
                Keluar
              </button>
            </>
          ) : (
            <a
              href="/auth"
              onClick={(event) => {
                event.preventDefault()
                go('/auth')
              }}
            >
              Masuk
            </a>
          )}
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">Produk digital dan fisik pilihan untuk kebutuhanmu.</footer>
    </div>
  )
}
