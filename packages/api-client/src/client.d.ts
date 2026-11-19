export type ApiResponse<T = Record<string, unknown>> = {
  success?: boolean
  data: T
  meta?: Record<string, unknown>
}

export class ApiClientError extends Error {
  status: number
  code: string
  requestId?: string
  fieldIssues: unknown[]
}

export function createApiClient(options: {
  baseUrl: string
  timeoutMs: number
  fetchImpl?: typeof fetch
  getToken?: () => string | null | undefined
}): {
  request<T = Record<string, unknown>>(
    path: string,
    options?: {
      method?: string
      body?: unknown
      headers?: Record<string, string>
      signal?: AbortSignal
    },
  ): Promise<ApiResponse<T>>
}
