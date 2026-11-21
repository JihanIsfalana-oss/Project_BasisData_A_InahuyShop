import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url))
if (existsSync(rootEnvPath)) process.loadEnvFile(rootEnvPath)

const databaseUrl = new URL('mysql://localhost')
databaseUrl.hostname = env('MYSQL_HOST')
databaseUrl.port = env('MYSQL_PORT')
databaseUrl.username = env('MYSQL_USER')
databaseUrl.password = env('MYSQL_PASSWORD')
databaseUrl.pathname = `/${env('MYSQL_DATABASE')}`

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx seed.ts',
  },
  datasource: {
    url: databaseUrl.toString(),
  },
})
