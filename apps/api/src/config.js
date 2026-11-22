import 'dotenv/config'

const validNodeEnvironments = new Set(['development', 'test', 'production'])

export function readConfig(environment = process.env) {
  const portValue = environment.PORT ?? '3000'
  const port = Number(portValue)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }

  const nodeEnvironment = environment.NODE_ENV ?? 'development'
  if (!validNodeEnvironments.has(nodeEnvironment)) {
    throw new Error('NODE_ENV must be development, test, or production')
  }

  return { port, nodeEnvironment }
}

export function readCorsOrigins(environment = process.env) {
  const origins = (environment.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (environment.NODE_ENV === 'production' && origins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS is required in production')
  }

  for (const origin of origins) {
    let parsedOrigin
    try {
      parsedOrigin = new URL(origin)
    } catch {
      throw new Error(`CORS origin is invalid: ${origin}`)
    }

    if (parsedOrigin.origin !== origin || !['http:', 'https:'].includes(parsedOrigin.protocol)) {
      throw new Error(`CORS origin must be an origin without a path: ${origin}`)
    }

    if (environment.NODE_ENV === 'production' && parsedOrigin.protocol !== 'https:') {
      throw new Error(`CORS origin must use HTTPS in production: ${origin}`)
    }
  }

  return [...new Set(origins)]
}
