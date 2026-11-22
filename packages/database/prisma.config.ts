import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'
import { buildPrismaDatabaseUrl } from './src/prisma-config.js'

const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url))
if (existsSync(rootEnvPath)) process.loadEnvFile(rootEnvPath)

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx seed.ts',
  },
  datasource: {
    url: buildPrismaDatabaseUrl(process.env, { generate: process.argv[2] === 'generate' }),
  },
})
