export function shouldClearAdminSession(error) {
  return [401, 403, 410].includes(error?.status)
}
