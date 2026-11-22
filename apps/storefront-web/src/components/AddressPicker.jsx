export function AddressPicker({ addresses, value, onChange }) {
  return (
    <fieldset className="address-picker">
      <legend>Alamat pengiriman</legend>
      {addresses.length ? (
        addresses.map((address) => (
          <label key={address.addressId} className="address-option">
            <input
              type="radio"
              name="addressId"
              value={address.addressId}
              checked={value === address.addressId}
              onChange={() => onChange(address.addressId)}
            />
            <span>
              <strong>{address.label}</strong>
              <br />
              {address.street}, {address.district}, {address.city}, {address.province}{' '}
              {address.postalCode}
            </span>
          </label>
        ))
      ) : (
        <p>Belum ada alamat. Tambahkan alamat di halaman akun.</p>
      )}
    </fieldset>
  )
}
