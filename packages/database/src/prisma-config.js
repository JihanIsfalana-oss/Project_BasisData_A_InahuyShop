import { readFileSync } from 'node:fs'

function requiredEnvironment(environment, name) {
  const value = environment[name]
  if (!value) {
    throw new Error(`Missing required database environment variable: ${name}`)
  }
  return value
}

export function buildPrismaDatabaseUrl(environment = process.env, { generate = false } = {}) {
  const databaseUrl = new URL('mysql://localhost')
  databaseUrl.hostname = generate ? '127.0.0.1' : requiredEnvironment(environment, 'MYSQL_HOST')
  databaseUrl.port = generate ? '3306' : requiredEnvironment(environment, 'MYSQL_PORT')
  databaseUrl.username = generate ? 'build' : requiredEnvironment(environment, 'MYSQL_USER')
  databaseUrl.password = generate ? 'build' : requiredEnvironment(environment, 'MYSQL_PASSWORD')
  databaseUrl.pathname = `/${generate ? 'build' : requiredEnvironment(environment, 'MYSQL_DATABASE')}`

  if (!generate) {
    const caFile = environment.MYSQL_SSL_CA_FILE
    if (environment.NODE_ENV === 'production' && !caFile) {
      throw new Error('MYSQL_SSL_CA_FILE is required for production MySQL migrations')
    }

    if (caFile) {
      readFileSync(caFile)
      databaseUrl.searchParams.set('sslcert', caFile)
      databaseUrl.searchParams.set('sslaccept', 'strict')
    }
  }

  return databaseUrl.toString()
}
