import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { ApiError } from '../errors.js'
import { authenticate } from '../middleware/authenticate.js'
import { hashPassword, verifyPassword } from '../security/passwords.js'
import { createOpaqueToken } from '../security/tokens.js'
import { bodyIssues, validateRequiredStrings } from '../validation.js'
import { validateBody } from '../middleware/validate-body.js'

const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function createLoginLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts' },
        requestId: req.id,
      }),
  })
}

const registerValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(
      body,
      {
        fullName: { min: 1, max: 191 },
        email: { min: 3, max: 254, pattern: emailPattern },
        phone: { min: 1, max: 32 },
        password: { min: 12, max: 128 },
        birthDate: { min: 10, max: 10, pattern: /^\d{4}-\d{2}-\d{2}$/ },
      },
      issues,
    )
    if (typeof body.birthDate === 'string') {
      const parsed = new Date(`${body.birthDate}T00:00:00.000Z`)
      if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== body.birthDate) {
        issues.push({ field: 'birthDate', message: 'Must be a valid YYYY-MM-DD date' })
      }
    }
    const allowed = new Set(['fullName', 'email', 'phone', 'password', 'birthDate'])
    for (const key of Object.keys(body)) {
      if (!allowed.has(key)) issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const loginValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(
      body,
      { identifier: { min: 1, max: 254 }, password: { min: 1, max: 128 } },
      issues,
    )
    for (const key of Object.keys(body)) {
      if (!['identifier', 'password'].includes(key)) {
        issues.push({ field: key, message: 'Is not allowed' })
      }
    }
  }),
)

function publicCustomer(customer) {
  return {
    id: customer.customerId,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    birthDate: customer.birthDate,
  }
}

function publicAdmin(admin) {
  return { id: admin.adminId, username: admin.username }
}

async function createSession(prisma, owner) {
  const { token, tokenHash } = createOpaqueToken()
  const expiresAt = new Date(Date.now() + sessionLifetimeMs)

  await prisma.authSession.create({
    data: {
      tokenHash,
      expiresAt,
      ...(owner.role === 'customer' ? { customerId: owner.id } : { adminId: owner.id }),
    },
  })

  return { token, expiresAt }
}

export function createAuthRouter(prisma) {
  const router = Router()
  const loginLimiter = createLoginLimiter()
  const requireCustomer = authenticate(prisma, ['customer'])
  const requireAdmin = authenticate(prisma, ['admin'])

  router.post('/auth/register', registerValidation, async (req, res) => {
    const { fullName, email, phone, password, birthDate } = req.body
    try {
      const customer = await prisma.customer.create({
        data: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          ...(phone ? { phone: phone.trim() } : {}),
          passwordHash: await hashPassword(password),
          ...(birthDate ? { birthDate: new Date(`${birthDate}T00:00:00.000Z`) } : {}),
        },
      })
      const session = await createSession(prisma, { role: 'customer', id: customer.customerId })
      res
        .status(201)
        .json({ success: true, data: { customer: publicCustomer(customer), ...session } })
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ApiError(409, 'ACCOUNT_CONFLICT', 'Email or phone is already registered')
      }
      throw error
    }
  })

  router.post('/auth/login', loginLimiter, loginValidation, async (req, res) => {
    const email = req.body.identifier.trim().toLowerCase()
    const customer = await prisma.customer.findUnique({ where: { email } })
    const valid = await verifyPassword(req.body.password, customer?.passwordHash)
    if (!customer || !customer.isActive || !valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')
    }
    const session = await createSession(prisma, { role: 'customer', id: customer.customerId })
    res
      .status(200)
      .json({ success: true, data: { customer: publicCustomer(customer), ...session } })
  })

  router.post('/auth/admin/login', loginLimiter, loginValidation, async (req, res) => {
    const admin = await prisma.seller.findUnique({
      where: { username: req.body.identifier.trim() },
    })
    const valid = await verifyPassword(req.body.password, admin?.passwordHash)
    if (!admin || !valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Username or password is incorrect')
    }
    const session = await createSession(prisma, { role: 'admin', id: admin.adminId })
    res.status(200).json({ success: true, data: { admin: publicAdmin(admin), ...session } })
  })

  router.post('/auth/logout', authenticate(prisma), async (req, res) => {
    await prisma.authSession.update({
      where: { tokenHash: req.auth.sessionHash },
      data: { revokedAt: new Date() },
    })
    res.status(200).json({ success: true, data: { loggedOut: true } })
  })

  router.get('/auth/me', authenticate(prisma), (req, res) => {
    res.status(200).json({
      success: true,
      data:
        req.auth.role === 'customer'
          ? { role: req.auth.role, customer: publicCustomer(req.auth.account) }
          : { role: req.auth.role, admin: publicAdmin(req.auth.account) },
    })
  })

  router.get('/admin/session', requireAdmin, (req, res) => {
    res.status(200).json({ success: true, data: { admin: publicAdmin(req.auth.account) } })
  })

  router.get('/customer/session', requireCustomer, (req, res) => {
    res.status(200).json({ success: true, data: { customer: publicCustomer(req.auth.account) } })
  })

  return router
}
