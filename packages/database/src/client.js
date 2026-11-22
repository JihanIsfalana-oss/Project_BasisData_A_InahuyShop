import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'
import { buildMySqlOptions } from './config.js'

const adapter = new PrismaMariaDb(buildMySqlOptions())

export const prisma = new PrismaClient({ adapter })
