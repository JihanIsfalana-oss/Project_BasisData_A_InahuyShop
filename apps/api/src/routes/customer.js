import { Router } from 'express'
import { ApiError } from '../errors.js'
import { validateBody } from '../middleware/validate-body.js'
import { bodyIssues, validateRequiredStrings } from '../validation.js'

const addressValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(
      body,
      {
        label: { max: 80 },
        street: { max: 255 },
        district: { max: 120 },
        city: { max: 120 },
        province: { max: 120 },
        postalCode: { max: 16 },
      },
      issues,
    )
    if (body.isDefault !== undefined && typeof body.isDefault !== 'boolean') {
      issues.push({ field: 'isDefault', message: 'Must be a boolean' })
    }
    for (const key of Object.keys(body)) {
      if (
        !['label', 'street', 'district', 'city', 'province', 'postalCode', 'isDefault'].includes(
          key,
        )
      ) {
        issues.push({ field: key, message: 'Is not allowed' })
      }
    }
  }),
)

const profileValidation = validateBody(
  bodyIssues((body, issues) => {
    if (body.fullName !== undefined) {
      validateRequiredStrings(body, { fullName: { max: 191 } }, issues)
    }
    if (body.phone !== undefined && body.phone !== null) {
      validateRequiredStrings(body, { phone: { max: 32 } }, issues)
    }
    if (
      body.birthDate !== undefined &&
      body.birthDate !== null &&
      (typeof body.birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate))
    ) {
      issues.push({ field: 'birthDate', message: 'Must use YYYY-MM-DD format' })
    } else if (typeof body.birthDate === 'string') {
      const parsed = new Date(`${body.birthDate}T00:00:00.000Z`)
      if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== body.birthDate) {
        issues.push({ field: 'birthDate', message: 'Must be a valid calendar date' })
      }
    }
    const allowed = new Set(['fullName', 'phone', 'birthDate'])
    for (const key of Object.keys(body)) {
      if (!allowed.has(key)) issues.push({ field: key, message: 'Is not allowed' })
    }
    if (Object.keys(body).length === 0) {
      issues.push({ field: 'body', message: 'At least one field is required' })
    }
  }),
)

function toAddressData(body) {
  return {
    label: body.label.trim(),
    street: body.street.trim(),
    district: body.district.trim(),
    city: body.city.trim(),
    province: body.province.trim(),
    postalCode: body.postalCode.trim(),
  }
}

export function createCustomerRouter(prisma) {
  const router = Router()

  router.get('/profile', (req, res) => {
    const { customerId, fullName, email, phone, birthDate, createdAt } = req.auth.account
    res.json({
      success: true,
      data: { id: customerId, fullName, email, phone, birthDate, createdAt },
    })
  })

  router.patch('/profile', profileValidation, async (req, res) => {
    const data = {}
    if (req.body.fullName !== undefined) data.fullName = req.body.fullName.trim()
    if (req.body.phone !== undefined) data.phone = req.body.phone?.trim() || null
    if (req.body.birthDate !== undefined) {
      data.birthDate = req.body.birthDate ? new Date(`${req.body.birthDate}T00:00:00.000Z`) : null
    }

    try {
      const customer = await prisma.customer.update({
        where: { customerId: req.auth.id },
        data,
      })
      res.json({
        success: true,
        data: {
          id: customer.customerId,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          birthDate: customer.birthDate,
        },
      })
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ApiError(409, 'ACCOUNT_CONFLICT', 'Phone is already registered')
      }
      throw error
    }
  })

  router.get('/addresses', async (req, res) => {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: req.auth.id },
      orderBy: [{ isDefault: 'desc' }, { addressId: 'desc' }],
    })
    res.json({ success: true, data: addresses })
  })

  router.post('/addresses', addressValidation, async (req, res) => {
    const address = await prisma.$transaction(async (tx) => {
      const makeDefault = req.body.isDefault === true
      const existing = await tx.customerAddress.count({ where: { customerId: req.auth.id } })
      if (makeDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: req.auth.id, isDefault: true },
          data: { isDefault: false },
        })
      }
      return tx.customerAddress.create({
        data: {
          customerId: req.auth.id,
          ...toAddressData(req.body),
          isDefault: makeDefault || existing === 0,
        },
      })
    })
    res.status(201).json({ success: true, data: address })
  })

  router.patch('/addresses/:addressId', addressValidation, async (req, res) => {
    const addressId = Number(req.params.addressId)
    if (!Number.isSafeInteger(addressId) || addressId < 1) {
      throw new ApiError(400, 'INVALID_ID', 'Address ID is invalid')
    }
    const address = await prisma.customerAddress.findFirst({
      where: { addressId, customerId: req.auth.id },
    })
    if (!address) throw new ApiError(404, 'NOT_FOUND', 'Address not found')
    const updated = await prisma.$transaction(async (tx) => {
      const makeDefault = req.body.isDefault === true
      if (makeDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: req.auth.id, isDefault: true },
          data: { isDefault: false },
        })
      }
      return tx.customerAddress.update({
        where: { addressId },
        data: { ...toAddressData(req.body), ...(makeDefault ? { isDefault: true } : {}) },
      })
    })
    res.json({ success: true, data: updated })
  })

  router.delete('/addresses/:addressId', async (req, res) => {
    const addressId = Number(req.params.addressId)
    if (!Number.isSafeInteger(addressId) || addressId < 1) {
      throw new ApiError(400, 'INVALID_ID', 'Address ID is invalid')
    }
    const address = await prisma.customerAddress.findFirst({
      where: { addressId, customerId: req.auth.id },
    })
    if (!address) throw new ApiError(404, 'NOT_FOUND', 'Address not found')
    try {
      await prisma.$transaction(async (tx) => {
        await tx.customerAddress.delete({ where: { addressId } })
        if (address.isDefault) {
          const nextDefault = await tx.customerAddress.findFirst({
            where: { customerId: req.auth.id },
            orderBy: { addressId: 'asc' },
          })
          if (nextDefault) {
            await tx.customerAddress.update({
              where: { addressId: nextDefault.addressId },
              data: { isDefault: true },
            })
          }
        }
      })
    } catch (error) {
      if (error?.code === 'P2003') {
        throw new ApiError(409, 'ADDRESS_IN_USE', 'Address is referenced by order history')
      }
      throw error
    }
    res.status(204).end()
  })

  return router
}
