const ADMIN_SESSION_KEY = 'admin-session'

function getItem(storage, key) {
  return typeof storage.getItem === 'function' ? storage.getItem(key) : storage.get(key) || null
}

function setItem(storage, key, value) {
  if (typeof storage.setItem === 'function') storage.setItem(key, value)
  else storage.set(key, value)
}

function removeItem(storage, key) {
  if (typeof storage.removeItem === 'function') storage.removeItem(key)
  else storage.delete(key)
}

export function readAdminSession(storage = globalThis.localStorage) {
  const raw = getItem(storage, ADMIN_SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    clearAdminSession(storage)
    return null
  }
}

export function writeAdminSession(storage, token, admin) {
  setItem(storage, ADMIN_SESSION_KEY, JSON.stringify({ token, admin }))
}

export function clearAdminSession(storage = globalThis.localStorage) {
  removeItem(storage, ADMIN_SESSION_KEY)
}

export function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Rp0'
  return `Rp${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount)}`
}

export function normalizeApiError(payload) {
  return {
    code: payload?.error?.code || 'UNKNOWN_ERROR',
    message: payload?.error?.message || 'Terjadi kesalahan yang tidak diketahui',
  }
}
