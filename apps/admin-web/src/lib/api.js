import { createApiClient } from '@inahuyshop/api-client'

export function createAdminApi({
  baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api/v1',
  getToken = () => null,
  fetchImpl = globalThis.fetch,
} = {}) {
  const client = createApiClient({
    baseUrl,
    timeoutMs: 10000,
    getToken,
    fetchImpl,
  })

  async function request(path, options) {
    const payload = await client.request(path, options)
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
