import { isRetryableNetworkError } from './network-classification.js'

export { isRetryableNetworkError }

export async function withNetworkRetry<T>(operation: () => Promise<T>, retries = 1) {
  let attempt = 0
  while (true) {
    try {
      return await operation()
    } catch (error) {
      if (!isRetryableNetworkError(error) || attempt >= retries) throw error
      attempt += 1
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
    }
  }
}
