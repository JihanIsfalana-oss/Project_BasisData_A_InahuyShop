import { readFileSync } from 'node:fs'

const requiredEnvironment = (environment, name) => {
  const value = environment[name]
  if (!value) {
    throw new Error(`Missing required database environment variable: ${name}`)
  }
  return value
}

export function buildMySqlOptions(environment = process.env) {
  const port = Number(environment.MYSQL_PORT ?? 3306)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('MYSQL_PORT must be an integer between 1 and 65535')
  }

  const caFile = environment.MYSQL_SSL_CA_FILE
  if (environment.NODE_ENV === 'production' && !caFile) {
    throw new Error('MYSQL_SSL_CA_FILE is required for production MySQL connections')
  }

  const options = {
    host: requiredEnvironment(environment, 'MYSQL_HOST'),
    port,
    user: requiredEnvironment(environment, 'MYSQL_USER'),
    password: requiredEnvironment(environment, 'MYSQL_PASSWORD'),
    database: requiredEnvironment(environment, 'MYSQL_DATABASE'),
    connectionLimit: 5,
  }

  if (caFile) {
    options.ssl = {
      ca: readFileSync(caFile),
      rejectUnauthorized: true,
    }
  }

  return options
}
