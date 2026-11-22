export function shouldClearSession(error) {
  return Boolean(error && typeof error === 'object' && 'status' in error && error.status === 401)
}
