import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const requiredEnvironment = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required database environment variable: ${name}`)
  return value
}

const port = Number(process.env.MYSQL_PORT ?? 3306)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('MYSQL_PORT must be an integer between 1 and 65535')
}

const adapter = new PrismaMariaDb({
  host: requiredEnvironment('MYSQL_HOST'),
  port,
  user: requiredEnvironment('MYSQL_USER'),
  password: requiredEnvironment('MYSQL_PASSWORD'),
  database: requiredEnvironment('MYSQL_DATABASE'),
  connectionLimit: 5,
})

export const prisma = new PrismaClient({ adapter })
