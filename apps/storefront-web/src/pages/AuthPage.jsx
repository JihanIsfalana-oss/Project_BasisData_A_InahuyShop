import { useState } from 'react'
import { Input } from '@inahuyshop/ui-web'
import { navigate } from '../app/routes.js'
import { useStorefront } from '../app/useStorefront.js'

export function AuthPage() {
  const { authenticate } = useStorefront()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
  })
  const [error, setError] = useState(null)
  const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/account'
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register'
      const body =
        mode === 'login'
          ? { identifier: form.identifier, password: form.password }
          : {
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              password: form.password,
              birthDate: form.birthDate,
            }
      await authenticate(path, body)
      navigate(returnTo)
    } catch (reason) {
      setError(reason.message)
    }
  }
  return (
    <div className="page auth-page">
      <div className="form-card">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun pelanggan'}</h1>
        {error ? (
          <p role="alert" className="error-text">
            {error}
          </p>
        ) : null}
        <form onSubmit={submit}>
          {mode === 'register' ? (
            <>
              <Input
                label="Nama lengkap"
                name="fullName"
                value={form.fullName}
                onChange={update('fullName')}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={update('email')}
                required
              />
              <Input
                label="Nomor telepon"
                name="phone"
                value={form.phone}
                onChange={update('phone')}
                required
              />
              <Input
                label="Tanggal lahir"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={update('birthDate')}
                required
              />
            </>
          ) : (
            <Input
              label="Email"
              name="identifier"
              type="email"
              value={form.identifier}
              onChange={update('identifier')}
              required
            />
          )}
          <Input
            label="Password"
            name="password"
            type="password"
            minLength="12"
            value={form.password}
            onChange={update('password')}
            required
          />
          <button type="submit">{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
        >
          {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </div>
  )
}
