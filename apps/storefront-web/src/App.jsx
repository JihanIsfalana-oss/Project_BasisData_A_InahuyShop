import { useEffect, useState } from 'react'
import { StorefrontProvider } from './app/StorefrontContext.jsx'
import { useStorefront } from './app/useStorefront.js'
import { matchRoute, navigate } from './app/routes.js'
import { ErrorState, LoadingState } from './components/AsyncState.jsx'
import { StorefrontShell } from './components/StorefrontShell.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { PaymentPage } from './pages/PaymentPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { OrderDetailPage } from './pages/OrderDetailPage.jsx'
import { AccountPage } from './pages/AccountPage.jsx'
import './App.css'

function RoutedApp() {
  const [route, setRoute] = useState(() => matchRoute())
  const { loading, notice, setNotice } = useStorefront()
  useEffect(() => {
    const update = () => setRoute(matchRoute())
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  if (loading)
    return (
      <StorefrontShell>
        <div className="page">
          <LoadingState label="Menyiapkan sesi..." />
        </div>
      </StorefrontShell>
    )
  if (notice)
    return (
      <StorefrontShell>
        <div className="page">
          <ErrorState message={notice} onRetry={() => setNotice(null)} />
        </div>
      </StorefrontShell>
    )
  if (route.protected) {
    const token = window.localStorage.getItem('inahuyshop.session.token')
    if (!token) {
      navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`)
      return null
    }
  }
  let page
  if (route.name === 'home') page = <HomePage />
  else if (route.name === 'catalog') page = <CatalogPage />
  else if (route.name === 'product') page = <ProductPage productId={route.params.productId} />
  else if (route.name === 'auth') page = <AuthPage />
  else if (route.name === 'cart') page = <CartPage />
  else if (route.name === 'checkout') page = <CheckoutPage />
  else if (route.name === 'payment') page = <PaymentPage orderId={route.params.orderId} />
  else if (route.name === 'orders') page = <OrdersPage />
  else if (route.name === 'order') page = <OrderDetailPage orderId={route.params.orderId} />
  else if (route.name === 'account') page = <AccountPage />
  else
    page = (
      <div className="page">
        <h1>Halaman belum tersedia</h1>
        <p>Gunakan katalog untuk melanjutkan.</p>
        <button type="button" onClick={() => navigate('/catalog')}>
          Buka katalog
        </button>
      </div>
    )
  return <StorefrontShell>{page}</StorefrontShell>
}

function App() {
  return (
    <StorefrontProvider>
      <RoutedApp />
    </StorefrontProvider>
  )
}

export default App
