import { createApiClient } from '@inahuyshop/api-client'

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1'

if (process.env.EAS_BUILD_PROFILE === 'production' && API_BASE_URL.startsWith('http://')) {
  throw new Error('Production admin mobile builds require an HTTPS API URL')
}

export function createAdminApi(getToken: () => string | null) {
  return createApiClient({
    baseUrl: API_BASE_URL,
    timeoutMs: 10000,
    getToken,
  })
}
