import { normalizeApiError } from './admin-state.js'

export class ApiRequestError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

export function createAdminApi({
  baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api/v1',
  getToken = () => null,
  fetchImpl = globalThis.fetch,
} = {}) {
  async function request(path, { method = 'GET', body } = {}) {
    const token = getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    let payload = null
    if (response.status !== 204) {
      payload = await response.json()
    }

    if (!response.ok) {
      const error = normalizeApiError(payload)
      throw new ApiRequestError(response.status, error.code, error.message)
    }

    return {
      data: payload?.data ?? null,
      meta: payload?.meta,
      payload,
    }
  }

  return {
    get: async (path) => (await request(path)).data,
    post: async (path, body) => (await request(path, { method: 'POST', body })).data,
    patch: async (path, body) => (await request(path, { method: 'PATCH', body })).data,
    delete: (path) => request(path, { method: 'DELETE' }),
  }
}
