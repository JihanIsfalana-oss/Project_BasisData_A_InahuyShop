import { useEffect, useState } from 'react'
import { Input } from '@inahuyshop/ui-web'
import { useStorefront } from '../app/useStorefront.js'
import { ErrorState, LoadingState } from '../components/AsyncState.jsx'

const emptyAddress = {
  label: '',
  street: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  isDefault: false,
}

export function AccountPage() {
  const { api } = useStorefront()
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(emptyAddress)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    Promise.all([api.request('/customer/profile'), api.request('/customer/addresses')])
      .then(([profileResponse, addressResponse]) => {
        setProfile(profileResponse.data)
        setAddresses(addressResponse.data)
      })
      .catch((reason) => setError(reason.message))
  }, [api])
  if (error)
    return (
      <div className="page">
        <ErrorState message={error} />
      </div>
    )
  if (!profile)
    return (
      <div className="page">
        <LoadingState />
      </div>
    )
  const updateProfile = async (event) => {
    event.preventDefault()
    try {
      const response = await api.request('/customer/profile', {
        method: 'PATCH',
        body: {
          fullName: profile.fullName,
          phone: profile.phone,
          birthDate: profile.birthDate?.slice(0, 10),
        },
      })
      setProfile(response.data)
      setMessage('Profil tersimpan.')
    } catch (reason) {
      setError(reason.message)
    }
  }
  const updateAddress = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }))
  const addAddress = async (event) => {
    event.preventDefault()
    try {
      const response = await api.request('/customer/addresses', { method: 'POST', body: form })
      setAddresses((current) => [...current, response.data])
      setForm(emptyAddress)
      setMessage('Alamat ditambahkan.')
    } catch (reason) {
      setError(reason.message)
    }
  }
  const removeAddress = async (addressId) => {
    try {
      await api.request(`/customer/addresses/${addressId}`, { method: 'DELETE' })
      setAddresses((current) => current.filter((address) => address.addressId !== addressId))
    } catch (reason) {
      setError(reason.message)
    }
  }
  return (
    <div className="page account-page">
      <div className="page-heading">
        <p className="eyebrow">ACCOUNT</p>
        <h1>Profil dan alamat</h1>
      </div>
      {message ? <p role="status">{message}</p> : null}
      <section className="detail-card">
        <h2>Profil</h2>
        <form onSubmit={updateProfile}>
          <Input
            label="Nama lengkap"
            value={profile.fullName ?? ''}
            onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
          />
          <Input
            label="Telepon"
            value={profile.phone ?? ''}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
          />
          <button type="submit">Simpan profil</button>
        </form>
      </section>
      <section className="detail-card">
        <h2>Alamat tersimpan</h2>
        {addresses.map((address) => (
          <article className="address-row" key={address.addressId}>
            <div>
              <strong>{address.label}</strong>
              <p>
                {address.street}, {address.city}
              </p>
            </div>
            <button type="button" onClick={() => removeAddress(address.addressId)}>
              Hapus
            </button>
          </article>
        ))}
        <form onSubmit={addAddress} className="address-form">
          {Object.keys(emptyAddress)
            .filter((key) => key !== 'isDefault')
            .map((key) => (
              <Input
                key={key}
                label={key}
                name={key}
                value={form[key]}
                onChange={updateAddress(key)}
                required
              />
            ))}
          <label>
            <input type="checkbox" checked={form.isDefault} onChange={updateAddress('isDefault')} />{' '}
            Jadikan default
          </label>
          <button type="submit">Tambah alamat</button>
        </form>
      </section>
    </div>
  )
}
