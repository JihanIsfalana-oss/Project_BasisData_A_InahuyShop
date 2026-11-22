import 'dotenv/config'
import * as Sentry from '@sentry/node'
import { prisma } from '@inahuyshop/database'
import { createApp } from './app.js'
import { readConfig, readCorsOrigins } from './config.js'
import { initializeSentry } from './monitoring/sentry.js'
import { startAdminAuditRetention } from './security/admin-audit.js'

const { port, nodeEnvironment } = readConfig()
const captureException = initializeSentry(Sentry, nodeEnvironment)
const allowedOrigins = readCorsOrigins()
const app = createApp({
  prisma,
  checkDatabase: () => prisma.$queryRaw`SELECT 1`,
  captureException,
  allowedOrigins,
})
const server = app.listen(port, () => {
  console.info(
    JSON.stringify({
      level: 'info',
      event: 'server.started',
      port,
      nodeEnvironment,
    }),
  )
})
const auditRetentionInterval = startAdminAuditRetention(prisma)

async function shutdown(signal) {
  clearInterval(auditRetentionInterval)
  server.close(async (error) => {
    if (error) {
      console.error(JSON.stringify({ level: 'error', event: 'server.close_failed' }))
      process.exitCode = 1
    }

    try {
      await prisma.$disconnect()
    } catch {
      console.error(JSON.stringify({ level: 'error', event: 'database.disconnect_failed' }))
      process.exitCode = 1
    }

    console.info(JSON.stringify({ level: 'info', event: 'server.stopped', signal }))
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
