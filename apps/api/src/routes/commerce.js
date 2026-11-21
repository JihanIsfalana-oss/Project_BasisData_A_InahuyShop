import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { Router } from 'express'
import { ApiError } from '../errors.js'
import { validateBody } from '../middleware/validate-body.js'
import { resolvePrivateFile } from '../security/private-storage.js'
import { createOpaqueToken, hashToken } from '../security/tokens.js'
import { bodyIssues, validateMoney, validatePositiveInteger } from '../validation.js'

const cartItemValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!validatePositiveInteger(body.variantId)) {
      issues.push({ field: 'variantId', message: 'Must be a positive integer' })
    }
    if (body.quantity !== undefined && !validatePositiveInteger(body.quantity)) {
      issues.push({ field: 'quantity', message: 'Must be a positive integer' })
    }
    for (const key of Object.keys(body)) {
      if (!['variantId', 'quantity'].includes(key))
        issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const quantityValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!validatePositiveInteger(body.quantity)) {
      issues.push({ field: 'quantity', message: 'Must be a positive integer' })
    }
    for (const key of Object.keys(body)) {
      if (key !== 'quantity') issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const checkoutValidation = validateBody(
  bodyIssues((body, issues) => {
    if (
      body.addressId !== undefined &&
      body.addressId !== null &&
      !validatePositiveInteger(body.addressId)
    ) {
      issues.push({ field: 'addressId', message: 'Must be a positive integer' })
    }
    if (
      body.voucherCode !== undefined &&
      (typeof body.voucherCode !== 'string' || body.voucherCode.length > 80)
    ) {
      issues.push({ field: 'voucherCode', message: 'Must be a string of at most 80 characters' })
    }
    for (const key of Object.keys(body)) {
      if (!['addressId', 'voucherCode'].includes(key))
        issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const paymentValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!['success', 'failed', 'expired'].includes(body.status)) {
      issues.push({ field: 'status', message: 'Must be success, failed, or expired' })
    }
    for (const key of Object.keys(body)) {
      if (key !== 'status') issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const reviewValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
      issues.push({ field: 'rating', message: 'Must be an integer from 1 to 5' })
    }
    if (
      body.comment !== undefined &&
      body.comment !== null &&
      (typeof body.comment !== 'string' || body.comment.length > 5000)
    ) {
      issues.push({ field: 'comment', message: 'Must be a string of at most 5000 characters' })
    }
    for (const key of Object.keys(body)) {
      if (!['rating', 'comment'].includes(key))
        issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

function sumSafe(values) {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!validateMoney(total))
    throw new ApiError(400, 'TOTAL_OUT_OF_RANGE', 'Order total exceeds supported range')
  return total
}

function publicOrder(order) {
  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: order.orderDate,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    shippingCost: order.shippingCost,
    grandTotal: order.grandTotal,
    items: order.items?.map((item) => ({
      orderItemId: item.orderItemId,
      productName: item.productNameSnapshot,
      variantId: item.variantId,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      deliveryType: item.variant?.deliveryType,
      digitalDeliveries: item.digitalDeliveries?.map((delivery) => ({
        deliveryId: delivery.deliveryId,
        expiresAt: delivery.expiresAt,
        downloadCount: delivery.downloadCount,
      })),
    })),
    payments: order.payments?.map((payment) => ({
      paymentId: payment.paymentId,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
      paymentReference: payment.paymentReference,
      paidAt: payment.paidAt,
    })),
    shipment: order.shipment
      ? {
          shipmentId: order.shipment.shipmentId,
          courier: order.shipment.courier,
          serviceType: order.shipment.serviceType,
          trackingNumber: order.shipment.trackingNumber,
          shippedAt: order.shipment.shippedAt,
          tracking: order.shipment.tracking,
        }
      : null,
  }
}

const orderInclude = {
  items: {
    include: {
      variant: { select: { deliveryType: true } },
      digitalDeliveries: {
        select: { deliveryId: true, expiresAt: true, downloadCount: true },
      },
    },
  },
  payments: true,
  shipment: { include: { tracking: { orderBy: { trackingSeq: 'asc' } } } },
}

function calculateDiscount(voucher, subtotal) {
  const value = Number(voucher.discountValue)
  const discount =
    voucher.discountType === 'percentage' ? Math.floor((subtotal * value) / 100) : Math.floor(value)
  return Math.min(subtotal, discount)
}

async function validateVoucher(tx, code, subtotal) {
  if (!code) return null
  await tx.$queryRaw`SELECT voucher_id FROM vouchers WHERE code = ${code} FOR UPDATE`
  const voucher = await tx.voucher.findUnique({ where: { code } })
  if (!voucher || voucher.validUntil <= new Date() || subtotal < Number(voucher.minPurchase)) {
    throw new ApiError(
      400,
      'INVALID_VOUCHER',
      'Voucher is invalid or does not meet its requirements',
    )
  }
  if (voucher.usageLimit !== null) {
    const usage = await tx.orderVoucher.count({ where: { voucherId: voucher.voucherId } })
    if (usage >= voucher.usageLimit) {
      throw new ApiError(409, 'VOUCHER_EXHAUSTED', 'Voucher usage limit has been reached')
    }
  }
  return voucher
}

export function createCommerceRouter(
  prisma,
  { storageRoot = process.env.DIGITAL_STORAGE_ROOT } = {},
) {
  const router = Router()

  router.get('/cart', async (req, res) => {
    const cart = await prisma.cart.findUnique({
      where: { customerId: req.auth.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { productId: true, name: true, isActive: true } },
              },
            },
          },
        },
      },
    })
    res.json({
      success: true,
      data: cart
        ? {
            cartId: cart.cartId,
            items: cart.items.map(({ variant, quantity }) => ({
              variantId: variant.variantId,
              sku: variant.sku,
              variantName: variant.variantName,
              price: variant.price,
              stockQty: variant.stockQty,
              deliveryType: variant.deliveryType,
              product: variant.product,
              quantity,
            })),
          }
        : { cartId: null, items: [] },
    })
  })

  router.post('/cart/items', cartItemValidation, async (req, res) => {
    const variant = await prisma.productVariant.findFirst({
      where: { variantId: req.body.variantId, product: { isActive: true } },
      select: { variantId: true },
    })
    if (!variant) throw new ApiError(404, 'VARIANT_NOT_FOUND', 'Active product variant not found')
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { customerId: req.auth.id },
        update: {},
        create: { customerId: req.auth.id },
      })
      const key = { cartId: cart.cartId, variantId: variant.variantId }
      const current = await tx.cartItem.findUnique({ where: { cartId_variantId: key } })
      const quantity = (current?.quantity ?? 0) + (req.body.quantity ?? 1)
      if (!validatePositiveInteger(quantity))
        throw new ApiError(400, 'INVALID_QUANTITY', 'Quantity is too large')
      return tx.cartItem.upsert({
        where: { cartId_variantId: key },
        update: { quantity },
        create: { ...key, quantity },
      })
    })
    res.status(200).json({ success: true, data: result })
  })

  router.patch('/cart/items/:variantId', quantityValidation, async (req, res) => {
    const variantId = Number(req.params.variantId)
    if (!validatePositiveInteger(variantId))
      throw new ApiError(400, 'INVALID_ID', 'Variant ID is invalid')
    const cart = await prisma.cart.findUnique({ where: { customerId: req.auth.id } })
    if (!cart) throw new ApiError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found')
    try {
      const item = await prisma.cartItem.update({
        where: { cartId_variantId: { cartId: cart.cartId, variantId } },
        data: { quantity: req.body.quantity },
      })
      res.json({ success: true, data: item })
    } catch (error) {
      if (error?.code === 'P2025')
        throw new ApiError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found')
      throw error
    }
  })

  router.delete('/cart/items/:variantId', async (req, res) => {
    const variantId = Number(req.params.variantId)
    if (!validatePositiveInteger(variantId))
      throw new ApiError(400, 'INVALID_ID', 'Variant ID is invalid')
    const cart = await prisma.cart.findUnique({ where: { customerId: req.auth.id } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.cartId, variantId } })
    }
    res.status(204).end()
  })

  router.post('/checkout', checkoutValidation, async (req, res) => {
    const suppliedKey = req.get('idempotency-key')
    if (!suppliedKey || !/^[A-Za-z0-9._:-]{8,100}$/.test(suppliedKey)) {
      throw new ApiError(
        400,
        'IDEMPOTENCY_KEY_REQUIRED',
        'A valid Idempotency-Key header is required',
      )
    }
    const checkoutKey = `${req.auth.id}:${suppliedKey}`

    try {
      const order = await prisma.$transaction(
        async (tx) => {
          const previous = await tx.order.findUnique({
            where: { checkoutKey },
            include: orderInclude,
          })
          if (previous) return { order: previous, replay: true }

          const cart = await tx.cart.findUnique({
            where: { customerId: req.auth.id },
            include: {
              items: {
                include: {
                  variant: {
                    include: { product: true, digitalAssets: { select: { assetId: true } } },
                  },
                },
              },
            },
          })
          if (!cart?.items.length) throw new ApiError(400, 'EMPTY_CART', 'Cart contains no items')

          const physicalItems = cart.items.filter(
            (item) => item.variant.deliveryType === 'physical',
          )
          const hasDigital = cart.items.some((item) => item.variant.deliveryType === 'digital')
          if (cart.items.some((item) => !item.variant.product.isActive)) {
            throw new ApiError(409, 'PRODUCT_UNAVAILABLE', 'A cart item is no longer available')
          }
          if (
            hasDigital &&
            cart.items.some(
              (item) =>
                item.variant.deliveryType === 'digital' && !item.variant.digitalAssets.length,
            )
          ) {
            throw new ApiError(
              409,
              'DIGITAL_ASSET_UNAVAILABLE',
              'A digital product asset is not configured',
            )
          }

          let addressId = null
          if (physicalItems.length) {
            if (!req.body.addressId) {
              throw new ApiError(400, 'SHIPPING_ADDRESS_REQUIRED', 'A shipping address is required')
            }
            const address = await tx.customerAddress.findFirst({
              where: { addressId: req.body.addressId, customerId: req.auth.id },
              select: { addressId: true },
            })
            if (!address)
              throw new ApiError(
                400,
                'INVALID_ADDRESS',
                'Shipping address does not belong to this customer',
              )
            addressId = address.addressId
          }

          const subtotal = sumSafe(
            cart.items.map((item) => {
              const unitPrice = Number(item.variant.price)
              if (!validateMoney(unitPrice) || !validatePositiveInteger(item.quantity)) {
                throw new ApiError(
                  409,
                  'INVALID_CART_ITEM',
                  'A cart item has an invalid price or quantity',
                )
              }
              return unitPrice * item.quantity
            }),
          )
          const voucher = await validateVoucher(
            tx,
            req.body.voucherCode?.trim().toUpperCase(),
            subtotal,
          )
          const discountAmount = voucher ? calculateDiscount(voucher, subtotal) : 0
          const shippingCost = 0
          const grandTotal = sumSafe([subtotal - discountAmount, shippingCost])

          for (const item of physicalItems) {
            const updated = await tx.productVariant.updateMany({
              where: {
                variantId: item.variantId,
                deliveryType: 'physical',
                stockQty: { gte: item.quantity },
                product: { isActive: true },
              },
              data: { stockQty: { decrement: item.quantity } },
            })
            if (updated.count !== 1) {
              throw new ApiError(
                409,
                'INSUFFICIENT_STOCK',
                'A physical cart item has insufficient stock',
              )
            }
          }

          const created = await tx.order.create({
            data: {
              orderNumber: randomUUID().replaceAll('-', ''),
              checkoutKey,
              customerId: req.auth.id,
              shippingAddressId: addressId,
              subtotal,
              discountAmount,
              shippingCost,
              grandTotal,
              items: {
                create: cart.items.map((item) => ({
                  variantId: item.variantId,
                  productNameSnapshot: item.variant.product.name,
                  unitPrice: item.variant.price,
                  quantity: item.quantity,
                  lineTotal: Number(item.variant.price) * item.quantity,
                })),
              },
              payments: {
                create: {
                  amount: grandTotal,
                  status: 'pending',
                  method: 'simulation',
                  paymentReference: `SIM-${randomUUID()}`,
                },
              },
              ...(voucher
                ? {
                    voucher: {
                      create: {
                        voucherId: voucher.voucherId,
                        discountApplied: discountAmount,
                      },
                    },
                  }
                : {}),
            },
            include: orderInclude,
          })
          await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } })
          return { order: created, replay: false }
        },
        { isolationLevel: 'Serializable', timeout: 15_000 },
      )
      res.status(order.replay ? 200 : 201).json({
        success: true,
        data: publicOrder(order.order),
        meta: { idempotentReplay: order.replay },
      })
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error?.code === 'P2002') {
        const existing = await prisma.order.findUnique({
          where: { checkoutKey },
          include: orderInclude,
        })
        if (existing) {
          res.status(200).json({
            success: true,
            data: publicOrder(existing),
            meta: { idempotentReplay: true },
          })
          return
        }
      }
      if (error?.code === 'P2034') {
        throw new ApiError(
          409,
          'CHECKOUT_CONFLICT',
          'Cart changed during checkout; retry with the same idempotency key',
        )
      }
      throw error
    }
  })

  router.get('/orders', async (req, res) => {
    const page = Number(req.query.page ?? 1)
    const pageSize = Number(req.query.pageSize ?? 20)
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      throw new ApiError(400, 'INVALID_PAGINATION', 'page or pageSize is invalid')
    }
    const where = { customerId: req.auth.id }
    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { orderDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    res.json({
      success: true,
      data: orders.map(publicOrder),
      meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    })
  })

  router.get('/orders/:orderId', async (req, res) => {
    const orderId = Number(req.params.orderId)
    if (!validatePositiveInteger(orderId))
      throw new ApiError(400, 'INVALID_ID', 'Order ID is invalid')
    const order = await prisma.order.findFirst({
      where: { orderId, customerId: req.auth.id },
      include: orderInclude,
    })
    if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found')
    res.json({ success: true, data: publicOrder(order) })
  })

  router.post('/orders/:orderId/payment/simulate', paymentValidation, async (req, res) => {
    const orderId = Number(req.params.orderId)
    if (!validatePositiveInteger(orderId))
      throw new ApiError(400, 'INVALID_ID', 'Order ID is invalid')
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: { orderId, customerId: req.auth.id },
          include: {
            payments: true,
            items: {
              include: { variant: { include: { digitalAssets: true } } },
            },
          },
        })
        if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found')
        const payment = order.payments[0]
        if (!payment || order.status !== 'pending_payment' || payment.status !== 'pending') {
          if (payment?.status === req.body.status) return order
          throw new ApiError(409, 'PAYMENT_NOT_PENDING', 'Order payment is no longer pending')
        }

        const paidAt = req.body.status === 'success' ? new Date() : null
        await tx.payment.update({
          where: { paymentId: payment.paymentId },
          data: { status: req.body.status, paidAt },
        })
        if (req.body.status !== 'success') {
          for (const item of order.items) {
            if (item.variant.deliveryType === 'physical') {
              await tx.productVariant.update({
                where: { variantId: item.variantId },
                data: { stockQty: { increment: item.quantity } },
              })
            }
          }
          await tx.order.update({
            where: { orderId },
            data: { status: req.body.status === 'expired' ? 'expired' : 'cancelled' },
          })
        } else {
          for (const item of order.items) {
            if (item.variant.deliveryType === 'digital') {
              await tx.digitalDelivery.createMany({
                data: item.variant.digitalAssets.map((asset) => {
                  const token = randomUUID()
                  return {
                    orderItemId: item.orderItemId,
                    assetId: asset.assetId,
                    downloadTokenHash: hashToken(token),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  }
                }),
              })
            }
          }
          const physical = order.items.some((item) => item.variant.deliveryType === 'physical')
          await tx.order.update({
            where: { orderId },
            data: { status: physical ? 'paid' : 'completed' },
          })
        }
        return tx.order.findUnique({ where: { orderId }, include: orderInclude })
      },
      { isolationLevel: 'Serializable', timeout: 15_000 },
    )
    res.json({ success: true, data: publicOrder(result) })
  })

  router.post('/order-items/:orderItemId/reviews', reviewValidation, async (req, res) => {
    const orderItemId = Number(req.params.orderItemId)
    if (!validatePositiveInteger(orderItemId))
      throw new ApiError(400, 'INVALID_ID', 'Order item ID is invalid')
    const item = await prisma.orderItem.findFirst({
      where: {
        orderItemId,
        order: {
          customerId: req.auth.id,
          status: { in: ['paid', 'processing', 'shipped', 'completed'] },
          payments: { some: { status: 'success' } },
        },
      },
      select: { orderItemId: true },
    })
    if (!item)
      throw new ApiError(403, 'REVIEW_NOT_ELIGIBLE', 'A paid order item owned by you is required')
    try {
      const review = await prisma.review.create({
        data: {
          orderItemId,
          rating: req.body.rating,
          comment: req.body.comment?.trim() || null,
        },
      })
      res.status(201).json({ success: true, data: review })
    } catch (error) {
      if (error?.code === 'P2002')
        throw new ApiError(409, 'REVIEW_EXISTS', 'This order item already has a review')
      throw error
    }
  })

  router.post('/digital-deliveries/:deliveryId/token', async (req, res) => {
    const deliveryId = Number(req.params.deliveryId)
    if (!validatePositiveInteger(deliveryId))
      throw new ApiError(400, 'INVALID_ID', 'Delivery ID is invalid')
    const delivery = await prisma.digitalDelivery.findFirst({
      where: {
        deliveryId,
        expiresAt: { gt: new Date() },
        orderItem: {
          order: { customerId: req.auth.id, payments: { some: { status: 'success' } } },
          variant: { deliveryType: 'digital' },
        },
      },
      select: { deliveryId: true },
    })
    if (!delivery) throw new ApiError(404, 'NOT_FOUND', 'Digital delivery is unavailable')
    const { token, tokenHash } = createOpaqueToken()
    await prisma.digitalDelivery.update({
      where: { deliveryId },
      data: { downloadTokenHash: tokenHash },
    })
    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/customer/digital-deliveries/${deliveryId}/download`,
        downloadToken: token,
      },
    })
  })

  router.get('/digital-deliveries/:deliveryId/download', async (req, res) => {
    const deliveryId = Number(req.params.deliveryId)
    if (!validatePositiveInteger(deliveryId))
      throw new ApiError(400, 'INVALID_ID', 'Delivery ID is invalid')
    const token = req.get('x-download-token')
    if (!/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new ApiError(404, 'NOT_FOUND', 'Digital delivery is unavailable')
    const delivery = await prisma.digitalDelivery.findFirst({
      where: {
        deliveryId,
        downloadTokenHash: hashToken(token),
        expiresAt: { gt: new Date() },
        orderItem: {
          order: { customerId: req.auth.id, payments: { some: { status: 'success' } } },
          variant: { deliveryType: 'digital' },
        },
      },
      include: { asset: true },
    })
    if (!delivery) throw new ApiError(404, 'NOT_FOUND', 'Digital delivery is unavailable')

    const { filePath, fileInfo } = await resolvePrivateFile(storageRoot, delivery.asset.fileUrl)
    const stream = createReadStream(filePath)
    stream.on('error', (error) => {
      if (!res.headersSent) res.status(500).end()
      console.error(
        JSON.stringify({ level: 'error', event: 'digital.download_failed', requestId: req.id }),
      )
      stream.destroy(error)
    })
    await prisma.digitalDelivery.update({
      where: { deliveryId: delivery.deliveryId },
      data: { downloadCount: { increment: 1 } },
    })
    res.setHeader('content-type', 'application/octet-stream')
    res.setHeader('content-length', fileInfo.size)
    res.setHeader(
      'content-disposition',
      `attachment; filename="${basename(delivery.asset.fileName).replaceAll('"', '')}"`,
    )
    stream.pipe(res)
  })

  return router
}
