export class ApiClientError extends Error {
  constructor({ status = 0, code = 'API_ERROR', message, requestId, fieldIssues = [] }) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.fieldIssues = fieldIssues
  }
}

const parseBody = async (response) => {
  const text = await response.text()
  if (!text) {
    throw new ApiClientError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'Response body is empty',
    })
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiClientError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'Response body is not valid JSON',
    })
  }
}

export const createApiClient = ({
  baseUrl,
  timeoutMs,
  fetchImpl = globalThis.fetch,
  getToken,
} = {}) => {
  if (
    !baseUrl ||
    !Number.isFinite(timeoutMs) ||
    timeoutMs <= 0 ||
    typeof fetchImpl !== 'function'
  ) {
    throw new TypeError('Invalid API client configuration')
  }

  return {
    async request(path, { method = 'GET', body, headers = {}, signal } = {}) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      const token = getToken?.()
      const abort = () => controller.abort()
      signal?.addEventListener('abort', abort, { once: true })
      const requestHeaders = { Accept: 'application/json', ...headers }
      if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
      if (token) requestHeaders.Authorization = `Bearer ${token}`

      try {
        const response = await fetchImpl(String(new URL(path, baseUrl)), {
          method,
          headers: requestHeaders,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        })
        const payload = await parseBody(response)
        if (!response.ok) {
          throw new ApiClientError({
            status: response.status,
            code: payload?.error?.code ?? payload?.code ?? `HTTP_${response.status}`,
            message:
              payload?.error?.message ??
              payload?.message ??
              `Request failed with status ${response.status}`,
            requestId: response.headers.get('x-request-id') ?? payload?.requestId ?? undefined,
            fieldIssues: payload?.error?.details ?? payload?.fieldIssues ?? [],
          })
        }
        return payload
      } catch (error) {
        if (error instanceof ApiClientError) throw error
        if (error.name === 'AbortError') {
          throw new ApiClientError({ code: 'TIMEOUT', message: 'Request timed out' })
        }
        throw error
      } finally {
        clearTimeout(timeout)
        signal?.removeEventListener('abort', abort)
      }
    },
  }
}
