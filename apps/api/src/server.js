import 'dotenv/config'
import { prisma } from '@inahuyshop/database'
import { createApp } from './app.js'
import { readConfig } from './config.js'

const { port, nodeEnvironment } = readConfig()
const app = createApp({
  prisma,
  checkDatabase: () => prisma.$queryRaw`SELECT 1`,
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

async function shutdown(signal) {
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
