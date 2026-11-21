import test from 'node:test'
import assert from 'node:assert/strict'

test('database package exposes backend Prisma client', async () => {
  process.env.MYSQL_HOST = '127.0.0.1'
  process.env.MYSQL_USER = 'inahuyshop'
  process.env.MYSQL_PASSWORD = 'change-me-local-only'
  process.env.MYSQL_DATABASE = 'inahuyshop'
  const { prisma } = await import('../src/client.js')
  assert.equal(typeof prisma.$connect, 'function')
  await prisma.$disconnect()
})
