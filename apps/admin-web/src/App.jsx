import { useEffect, useState } from 'react'
import { Badge, Button, Card, Input } from '@inahuyshop/ui-web'
import './App.css'
import {
  clearAdminSession,
  formatCurrency,
  readAdminSession,
  writeAdminSession,
} from './lib/admin-state.js'
import { createAdminApi } from './lib/api.js'

const api = createAdminApi({ getToken: () => readAdminSession()?.token })
const sections = [
  ['dashboard', 'Dashboard'],
  ['orders', 'Pesanan'],
  ['catalog', 'Katalog'],
  ['vouchers', 'Voucher'],
]

function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = await api.post('/auth/admin/login', { identifier, password })
      writeAdminSession(localStorage, session.token, session.admin)
      onLogin(session.admin)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">INAHUYSHOP</p>
        <h1>Admin Console</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <Input
          label="Username"
          name="identifier"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" disabled={busy || !identifier || !password}>
          {busy ? 'Masuk...' : 'Masuk'}
        </Button>
      </form>
    </main>
  )
}

function PageHeader({ title, description }) {
  return (
    <header className="page-header">
      <p className="eyebrow">OPERASI</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(setSummary)
      .catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!summary) return <div className="loading">Memuat ringkasan...</div>

  const cards = [
    ['Menunggu pembayaran', summary.pendingOrders],
    ['Pesanan aktif', summary.paidOrders],
    ['Pelanggan aktif', summary.activeCustomers],
    ['Stok rendah', summary.lowStockVariants],
  ]

  return (
    <section>
      <PageHeader title="Dashboard" description="Ringkasan operasional InahuyShop" />
      <div className="summary-grid">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="summary-label">{label}</p>
            <strong className="summary-value">{value}</strong>
          </Card>
        ))}
      </div>
    </section>
  )
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  async function load(nextStatus = status, nextQuery = query) {
    setError('')
    try {
      const params = new URLSearchParams()
      if (nextStatus) params.set('status', nextStatus)
      if (nextQuery) params.set('q', nextQuery)
      setOrders(await api.get(`/admin/orders${params.size ? `?${params}` : ''}`))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    const loadInitialOrders = async () => {
      try {
        setOrders(await api.get('/admin/orders'))
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    loadInitialOrders()
  }, [])

  async function updateStatus(orderId, nextStatus) {
    if (!window.confirm(`Ubah status pesanan menjadi ${nextStatus}?`)) return
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function createShipment(order) {
    const courier = window.prompt('Kurir')
    const serviceType = window.prompt('Jenis layanan')
    const trackingNumber = window.prompt('Nomor resi')
    if (!courier || !serviceType || !trackingNumber) return
    try {
      await api.post(`/admin/orders/${order.orderId}/shipment`, {
        courier,
        serviceType,
        trackingNumber,
      })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function updateTracking(shipmentId) {
    const nextStatus = window.prompt('Status tracking: in_transit, out_for_delivery, delivered')
    if (!nextStatus) return
    try {
      await api.post(`/admin/shipments/${shipmentId}/tracking`, { status: nextStatus })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section>
      <PageHeader title="Pesanan" description="Pantau dan tindak lanjuti pesanan" />
      <div className="toolbar">
        <Input
          aria-label="Cari pesanan"
          placeholder="Cari nomor pesanan atau pelanggan"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Semua status</option>
          {[
            'pending_payment',
            'paid',
            'processing',
            'shipped',
            'completed',
            'cancelled',
            'expired',
          ].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Button onClick={() => load(status, query)}>Cari</Button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pesanan</th>
              <th>Pelanggan</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderNumber}</td>
                <td>{order.customer?.fullName}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <Badge>{order.status}</Badge>
                </td>
                <td>
                  <div className="action-row">
                    <Button variant="secondary" onClick={() => setSelected(order)}>
                      Detail
                    </Button>
                    {order.status === 'paid' && (
                      <Button onClick={() => updateStatus(order.orderId, 'processing')}>
                        Proses
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button onClick={() => createShipment(order)}>Kirim</Button>
                    )}
                    {order.status === 'pending_payment' && (
                      <Button
                        variant="danger"
                        onClick={() => updateStatus(order.orderId, 'cancelled')}
                      >
                        Batalkan
                      </Button>
                    )}
                    {order.shipment && (
                      <Button
                        variant="secondary"
                        onClick={() => updateTracking(order.shipment.shipmentId)}
                      >
                        Tracking
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="detail-panel" role="dialog" aria-label="Detail pesanan">
          <button
            className="icon-button"
            onClick={() => setSelected(null)}
            aria-label="Tutup detail"
          >
            ×
          </button>
          <h2>{selected.orderNumber}</h2>
          <p>{selected.customer?.email}</p>
          <dl>
            <dt>Status</dt>
            <dd>{selected.status}</dd>
            <dt>Total</dt>
            <dd>{formatCurrency(selected.totalAmount)}</dd>
          </dl>
        </div>
      )}
    </section>
  )
}

function Catalog() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products?pageSize=100')])
      .then(([categoryData, productData]) => {
        setCategories(categoryData)
        setProducts(productData)
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  async function addCategory() {
    const name = window.prompt('Nama kategori')
    if (!name) return
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    try {
      await api.post('/admin/categories', { name, slug })
      setCategories(await api.get('/categories'))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return
    try {
      await api.delete(`/admin/categories/${category.categoryId}`)
      setCategories(await api.get('/categories'))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section>
      <PageHeader title="Katalog" description="Kelola kategori dan produk" />
      {error && <div className="alert alert-error">{error}</div>}
      <div className="two-column">
        <Card>
          <div className="card-heading">
            <h2>Kategori</h2>
            <Button onClick={addCategory}>Tambah</Button>
          </div>
          <ul className="simple-list">
            {categories.map((category) => (
              <li key={category.categoryId}>
                <span>{category.name}</span>
                <Button variant="danger" onClick={() => deleteCategory(category)}>
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Produk aktif</h2>
          </div>
          <ul className="simple-list">
            {products.map((product) => (
              <li key={product.productId}>
                <span>
                  {product.name}
                  <small>{product.category?.name}</small>
                </span>
                <Badge>{product.variants?.length || 0} varian</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

function Vouchers() {
  const [vouchers, setVouchers] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      setVouchers(await api.get('/admin/vouchers'))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    const loadInitialVouchers = async () => {
      try {
        setVouchers(await api.get('/admin/vouchers'))
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    loadInitialVouchers()
  }, [])

  async function addVoucher() {
    const code = window.prompt('Kode voucher')
    if (!code) return
    const discountType = window.prompt('Jenis diskon: fixed atau percentage')
    if (!['fixed', 'percentage'].includes(discountType)) return
    const discountValue = Number(window.prompt('Nilai diskon'))
    const minPurchase = Number(window.prompt('Minimum pembelian', '0'))
    const validUntil = window.prompt('Berakhir (YYYY-MM-DD)')
    if (!discountValue || !validUntil) return
    try {
      await api.post('/admin/vouchers', {
        code,
        discountType,
        discountValue,
        minPurchase,
        validUntil: `${validUntil}T23:59:59.000Z`,
      })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deactivate(voucher) {
    if (!window.confirm(`Nonaktifkan voucher ${voucher.code}?`)) return
    try {
      await api.post(`/admin/vouchers/${voucher.voucherId}/deactivate`)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section>
      <PageHeader title="Voucher" description="Kelola voucher dan masa berlaku" />
      <div className="card-heading">
        <h2>Daftar voucher</h2>
        <Button onClick={addVoucher}>Tambah voucher</Button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="voucher-grid">
        {vouchers.map((voucher) => (
          <Card key={voucher.voucherId}>
            <div className="card-heading">
              <strong>{voucher.code}</strong>
              <Badge>{voucher.isActive ? 'active' : 'inactive'}</Badge>
            </div>
            <p>
              {voucher.discountType === 'percentage'
                ? `${voucher.discountValue}%`
                : formatCurrency(voucher.discountValue)}
            </p>
            <Button variant="danger" onClick={() => deactivate(voucher)}>
              Nonaktifkan
            </Button>
          </Card>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [session, setSession] = useState(() => readAdminSession())
  const [section, setSection] = useState('dashboard')

  useEffect(() => {
    if (!session) return
    api.get('/auth/me').catch((requestError) => {
      if (requestError.status === 401) {
        clearAdminSession(localStorage)
        setSession(null)
      }
    })
  }, [session])

  function logout() {
    api.post('/auth/logout').finally(() => {
      clearAdminSession(localStorage)
      setSession(null)
    })
  }

  if (!session)
    return <Login onLogin={(admin) => setSession({ token: readAdminSession()?.token, admin })} />

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="brand">INAHUYSHOP</div>
        <nav aria-label="Navigasi admin">
          {sections.map(([key, label]) => (
            <button
              key={key}
              className={section === key ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="topbar">
          <span>Admin: {session.admin.username}</span>
          <Button variant="secondary" onClick={logout}>
            Keluar
          </Button>
        </header>
        <div className="content">
          {section === 'dashboard' && <Dashboard />}
          {section === 'orders' && <Orders />}
          {section === 'catalog' && <Catalog />}
          {section === 'vouchers' && <Vouchers />}
        </div>
      </main>
    </div>
  )
}

export default App
