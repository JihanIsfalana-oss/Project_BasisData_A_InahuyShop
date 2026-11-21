import 'dotenv/config'
import { prisma } from '@inahuyshop/database'
import { hashPassword } from '../src/security/passwords.js'

const username = process.env.ADMIN_USERNAME?.trim()
const password = process.env.ADMIN_PASSWORD

if (
  !username ||
  username.length > 80 ||
  !password ||
  password.length < 16 ||
  password.length > 128
) {
  throw new Error('Set ADMIN_USERNAME and an ADMIN_PASSWORD of 16-128 characters')
}

try {
  const passwordHash = await hashPassword(password)
  await prisma.seller.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  })
  console.info(JSON.stringify({ level: 'info', event: 'admin.provisioned', username }))
} finally {
  await prisma.$disconnect()
}
