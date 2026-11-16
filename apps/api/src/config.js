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
