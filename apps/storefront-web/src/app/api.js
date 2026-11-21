import { createApiClient } from '@inahuyshop/api-client'

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export function normalizeApiPath(path) {
  return String(path).replace(/^\/+/, '')
}

export function createStorefrontApi(getToken) {
  const client = createApiClient({
    baseUrl: API_BASE_URL,
    timeoutMs: 10000,
    getToken,
  })
  return {
    request(path, options) {
      return client.request(normalizeApiPath(path), options)
    },
  }
}
