import { Router } from 'express'
import { ApiError } from '../errors.js'
import { authenticate } from '../middleware/authenticate.js'
import { validateBody } from '../middleware/validate-body.js'
import { auditAdminMutation } from '../security/admin-audit.js'
import { resolvePrivateFile } from '../security/private-storage.js'
import {
  bodyIssues,
  validateMoney,
  validateNonnegativeInteger,
  validateRequiredStrings,
} from '../validation.js'

const productValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(body, { name: { max: 191 } }, issues)
    if (!Number.isSafeInteger(body.categoryId) || body.categoryId < 1) {
      issues.push({ field: 'categoryId', message: 'Must be a positive integer' })
    }
    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== 'string'
    ) {
      issues.push({ field: 'description', message: 'Must be a string or null' })
    }
    if (body.brand !== undefined && body.brand !== null && typeof body.brand !== 'string') {
      issues.push({ field: 'brand', message: 'Must be a string or null' })
    }
    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
      issues.push({ field: 'isActive', message: 'Must be a boolean' })
    }
    if (!Array.isArray(body.variants) || body.variants.length < 1 || body.variants.length > 50) {
      issues.push({ field: 'variants', message: 'Must contain 1 to 50 variants' })
    } else {
      body.variants.forEach((variant, index) => {
        if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
          issues.push({ field: `variants.${index}`, message: 'Must be an object' })
          return
        }
        for (const [field, max] of [
          ['sku', 80],
          ['variantName', 191],
        ]) {
          if (
            typeof variant[field] !== 'string' ||
            variant[field].trim().length < 1 ||
            variant[field].length > max
          ) {
            issues.push({
              field: `variants.${index}.${field}`,
              message: `Must be 1-${max} characters`,
            })
          }
        }
        if (!validateMoney(variant.price)) {
          issues.push({
            field: `variants.${index}.price`,
            message: 'Must be a non-negative integer amount',
          })
        }
        if (!validateNonnegativeInteger(variant.stockQty)) {
          issues.push({
            field: `variants.${index}.stockQty`,
            message: 'Must be a non-negative integer',
          })
        }
        if (!['digital', 'physical'].includes(variant.deliveryType)) {
          issues.push({
            field: `variants.${index}.deliveryType`,
            message: 'Must be digital or physical',
          })
        }
        if (
          variant.deliveryType === 'physical' &&
          variant.weightGram !== undefined &&
          variant.weightGram !== null &&
          !validateNonnegativeInteger(variant.weightGram)
        ) {
          issues.push({
            field: `variants.${index}.weightGram`,
            message: 'Must be a non-negative integer',
          })
        }
        for (const key of Object.keys(variant)) {
          if (
            !['sku', 'variantName', 'price', 'stockQty', 'deliveryType', 'weightGram'].includes(key)
          ) {
            issues.push({ field: `variants.${index}.${key}`, message: 'Is not allowed' })
          }
        }
      })
    }
    for (const key of Object.keys(body)) {
      if (!['name', 'categoryId', 'description', 'brand', 'isActive', 'variants'].includes(key)) {
        issues.push({ field: key, message: 'Is not allowed' })
      }
    }
  }),
)

const categoryValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(body, { name: { max: 120 }, slug: { max: 191 } }, issues)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug ?? '')) {
      issues.push({ field: 'slug', message: 'Must be a lowercase URL-safe slug' })
    }
    if (
      body.parentId !== undefined &&
      body.parentId !== null &&
      (!Number.isSafeInteger(body.parentId) || body.parentId < 1)
    ) {
      issues.push({ field: 'parentId', message: 'Must be a positive integer or null' })
    }
    for (const key of Object.keys(body)) {
      if (!['name', 'slug', 'parentId'].includes(key))
        issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const voucherValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(body, { code: { max: 80 }, validUntil: { max: 40 } }, issues)
    if (!['percentage', 'fixed'].includes(body.discountType)) {
      issues.push({ field: 'discountType', message: 'Must be percentage or fixed' })
    }
    if (
      !Number.isFinite(body.discountValue) ||
      body.discountValue <= 0 ||
      body.discountValue > 100_000_000
    ) {
      issues.push({ field: 'discountValue', message: 'Must be a positive supported number' })
    }
    if (!validateMoney(body.minPurchase ?? 0)) {
      issues.push({ field: 'minPurchase', message: 'Must be a non-negative integer amount' })
    }
    if (
      body.usageLimit !== undefined &&
      body.usageLimit !== null &&
      !validateNonnegativeInteger(body.usageLimit)
    ) {
      issues.push({ field: 'usageLimit', message: 'Must be a non-negative integer or null' })
    }
    const date = new Date(body.validUntil)
    if (!Number.isFinite(date.valueOf()))
      issues.push({ field: 'validUntil', message: 'Must be a valid datetime' })
    if (body.discountType === 'percentage' && body.discountValue > 100) {
      issues.push({ field: 'discountValue', message: 'Percentage cannot exceed 100' })
    }
    for (const key of Object.keys(body)) {
      if (
        ![
          'code',
          'discountType',
          'discountValue',
          'minPurchase',
          'usageLimit',
          'validUntil',
        ].includes(key)
      ) {
        issues.push({ field: key, message: 'Is not allowed' })
      }
    }
  }),
)

const assetValidation = validateBody(
  bodyIssues((body, issues) => {
    validateRequiredStrings(body, { fileUrl: { max: 1024 }, fileName: { max: 255 } }, issues)
    if (
      typeof body.fileUrl === 'string' &&
      (body.fileUrl.includes('..') ||
        body.fileUrl.startsWith('/') ||
        /^[a-z][a-z0-9+.-]*:/i.test(body.fileUrl))
    ) {
      issues.push({
        field: 'fileUrl',
        message: 'Must be a relative path inside configured private digital storage',
      })
    }
    if (typeof body.fileName === 'string' && /[\\/]/.test(body.fileName)) {
      issues.push({ field: 'fileName', message: 'Must be a file name, not a path' })
    }
    if (!Number.isSafeInteger(body.fileSize) || body.fileSize < 1) {
      issues.push({ field: 'fileSize', message: 'Must be a positive safe integer byte size' })
    }
    for (const key of Object.keys(body)) {
      if (!['fileUrl', 'fileName', 'fileSize'].includes(key))
        issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

const orderStatusValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!['processing', 'cancelled'].includes(body.status)) {
      issues.push({ field: 'status', message: 'Must be processing or cancelled' })
    }
  }),
)

const shipmentValidation = validateBody(
  bodyIssues((body, issues) => {
    for (const [field, max] of [
      ['courier', 120],
      ['serviceType', 120],
      ['trackingNumber', 191],
    ]) {
      if (
        typeof body[field] !== 'string' ||
        body[field].trim().length < 1 ||
        body[field].length > max
      ) {
        issues.push({ field, message: `Must be 1-${max} characters` })
      }
    }
  }),
)

const trackingValidation = validateBody(
  bodyIssues((body, issues) => {
    if (!['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(body.status)) {
      issues.push({ field: 'status', message: 'Tracking status is invalid' })
    }
    for (const key of Object.keys(body)) {
      if (key !== 'status') issues.push({ field: key, message: 'Is not allowed' })
    }
  }),
)

function routeId(value, label) {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1)
    throw new ApiError(400, 'INVALID_ID', `${label} ID is invalid`)
  return id
}

function prismaConflict(error, resource) {
  if (error?.code === 'P2002') throw new ApiError(409, 'DUPLICATE', `${resource} already exists`)
  if (error?.code === 'P2003')
    throw new ApiError(409, 'RESOURCE_IN_USE', `${resource} is referenced by other data`)
  throw error
}

export function createAdminRouter(prisma) {
  const router = Router()
  router.use(authenticate(prisma, ['admin']))

  router.get('/dashboard', async (_req, res) => {
    const [pendingOrders, paidOrders, customers, lowStockVariants] = await Promise.all([
      prisma.order.count({ where: { status: 'pending_payment' } }),
      prisma.order.count({ where: { status: { in: ['paid', 'processing'] } } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.productVariant.count({
        where: { deliveryType: 'physical', stockQty: { lte: 5 }, product: { isActive: true } },
      }),
    ])
    res.json({
      success: true,
      data: { pendingOrders, paidOrders, activeCustomers: customers, lowStockVariants },
    })
  })

  router.post('/vouchers/:voucherId/deactivate', async (req, res) => {
    const voucherId = routeId(req.params.voucherId, 'Voucher')
    try {
      const voucher = await auditAdminMutation(
        prisma,
        req,
        { action: 'voucher.deactivate', resourceType: 'voucher', resourceId: voucherId },
        (tx) =>
          tx.voucher.update({
            where: { voucherId },
            data: { validUntil: new Date() },
          }),
      )
      res.json({ success: true, data: voucher })
    } catch (error) {
      if (error?.code === 'P2025') throw new ApiError(404, 'NOT_FOUND', 'Voucher not found')
      throw error
    }
  })

  router.post('/categories', categoryValidation, async (req, res) => {
    try {
      const category = await auditAdminMutation(
        prisma,
        req,
        {
          action: 'category.create',
          resourceType: 'category',
          resourceId: (created) => created.categoryId,
        },
        (tx) =>
          tx.category.create({
            data: {
              name: req.body.name.trim(),
              slug: req.body.slug,
              ...(req.body.parentId ? { parentId: req.body.parentId } : {}),
            },
          }),
      )
      res.status(201).json({ success: true, data: category })
    } catch (error) {
      prismaConflict(error, 'Category')
    }
  })

  router.patch('/categories/:categoryId', categoryValidation, async (req, res) => {
    const categoryId = routeId(req.params.categoryId, 'Category')
    if (req.body.parentId === categoryId)
      throw new ApiError(400, 'CATEGORY_CYCLE', 'Category cannot be its own parent')
    if (req.body.parentId) {
      let current = await prisma.category.findUnique({ where: { categoryId: req.body.parentId } })
      while (current) {
        if (current.categoryId === categoryId) {
          throw new ApiError(400, 'CATEGORY_CYCLE', 'Category hierarchy cannot contain a cycle')
        }
        current = current.parentId
          ? await prisma.category.findUnique({ where: { categoryId: current.parentId } })
          : null
      }
    }
    try {
      const category = await auditAdminMutation(
        prisma,
        req,
        { action: 'category.update', resourceType: 'category', resourceId: categoryId },
        (tx) =>
          tx.category.update({
            where: { categoryId },
            data: {
              name: req.body.name.trim(),
              slug: req.body.slug,
              parentId: req.body.parentId ?? null,
            },
          }),
      )
      res.json({ success: true, data: category })
    } catch (error) {
      if (error?.code === 'P2025') throw new ApiError(404, 'NOT_FOUND', 'Category not found')
      prismaConflict(error, 'Category')
    }
  })

  router.delete('/categories/:categoryId', async (req, res) => {
    const categoryId = routeId(req.params.categoryId, 'Category')
    try {
      await auditAdminMutation(
        prisma,
        req,
        { action: 'category.delete', resourceType: 'category', resourceId: categoryId },
        (tx) => tx.category.delete({ where: { categoryId } }),
      )
    } catch (error) {
      if (error?.code === 'P2025') throw new ApiError(404, 'NOT_FOUND', 'Category not found')
      prismaConflict(error, 'Category')
    }
    res.status(204).end()
  })

  router.post('/products', productValidation, async (req, res) => {
    const hasDigital = req.body.variants.some((variant) => variant.deliveryType === 'digital')
    if (
      hasDigital &&
      req.body.variants.some(
        (variant) => variant.deliveryType === 'digital' && variant.stockQty !== 0,
      )
    ) {
      throw new ApiError(400, 'INVALID_DIGITAL_STOCK', 'Digital variants must use stockQty 0')
    }
    if (
      req.body.variants.some(
        (variant) => variant.deliveryType === 'physical' && variant.weightGram == null,
      )
    ) {
      throw new ApiError(400, 'WEIGHT_REQUIRED', 'Physical variants require weightGram')
    }
    try {
      const product = await auditAdminMutation(
        prisma,
        req,
        {
          action: 'product.create',
          resourceType: 'product',
          resourceId: (created) => created.productId,
        },
        (tx) =>
          tx.product.create({
            data: {
              categoryId: Number(req.body.categoryId),
              name: req.body.name.trim(),
              description: req.body.description ?? null,
              brand: req.body.brand?.trim() || null,
              isActive: req.body.isActive ?? true,
              variants: {
                create: req.body.variants.map((variant) => ({
                  sku: variant.sku.trim(),
                  variantName: variant.variantName.trim(),
                  price: variant.price,
                  stockQty: variant.deliveryType === 'physical' ? variant.stockQty : 0,
                  deliveryType: variant.deliveryType,
                  weightGram: variant.deliveryType === 'physical' ? variant.weightGram : null,
                })),
              },
            },
            include: { variants: true },
          }),
      )
      res.status(201).json({ success: true, data: product })
    } catch (error) {
      if (error?.code === 'P2025')
        throw new ApiError(400, 'CATEGORY_NOT_FOUND', 'Category not found')
      prismaConflict(error, 'Product or variant SKU')
    }
  })

  router.patch(
    '/products/:productId',
    validateBody(
      bodyIssues((body, issues) => {
        if (
          body.name !== undefined &&
          (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 191)
        ) {
          issues.push({ field: 'name', message: 'Must be 1-191 characters' })
        }
        if (
          body.description !== undefined &&
          body.description !== null &&
          typeof body.description !== 'string'
        ) {
          issues.push({ field: 'description', message: 'Must be a string or null' })
        }
        if (body.brand !== undefined && body.brand !== null && typeof body.brand !== 'string') {
          issues.push({ field: 'brand', message: 'Must be a string or null' })
        }
        if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
          issues.push({ field: 'isActive', message: 'Must be a boolean' })
        }
        if (
          Object.keys(body).some(
            (key) => !['name', 'description', 'brand', 'isActive'].includes(key),
          )
        ) {
          issues.push({ field: 'body', message: 'Contains unsupported fields' })
        }
        if (Object.keys(body).length === 0)
          issues.push({ field: 'body', message: 'At least one field is required' })
      }),
    ),
    async (req, res) => {
      const productId = routeId(req.params.productId, 'Product')
      const data = {}
      for (const key of ['name', 'description', 'brand', 'isActive']) {
        if (req.body[key] !== undefined)
          data[key] =
            key === 'name' || key === 'brand' ? req.body[key]?.trim() || null : req.body[key]
      }
      try {
        const product = await auditAdminMutation(
          prisma,
          req,
          { action: 'product.update', resourceType: 'product', resourceId: productId },
          (tx) => tx.product.update({ where: { productId }, data }),
        )
        res.json({ success: true, data: product })
      } catch (error) {
        if (error?.code === 'P2025') throw new ApiError(404, 'NOT_FOUND', 'Product not found')
        throw error
      }
    },
  )

  router.patch(
    '/variants/:variantId',
    validateBody(
      bodyIssues((body, issues) => {
        if (body.price !== undefined && !validateMoney(body.price)) {
          issues.push({ field: 'price', message: 'Must be a non-negative integer amount' })
        }
        if (body.stockQty !== undefined && !validateNonnegativeInteger(body.stockQty)) {
          issues.push({ field: 'stockQty', message: 'Must be a non-negative integer' })
        }
        for (const key of Object.keys(body)) {
          if (!['price', 'stockQty', 'variantName'].includes(key))
            issues.push({ field: key, message: 'Is not allowed' })
        }
        if (
          body.variantName !== undefined &&
          (typeof body.variantName !== 'string' ||
            !body.variantName.trim() ||
            body.variantName.length > 191)
        ) {
          issues.push({ field: 'variantName', message: 'Must be 1-191 characters' })
        }
        if (!Object.keys(body).length)
          issues.push({ field: 'body', message: 'At least one field is required' })
      }),
    ),
    async (req, res) => {
      const variantId = routeId(req.params.variantId, 'Variant')
      const variant = await prisma.productVariant.findUnique({ where: { variantId } })
      if (!variant) throw new ApiError(404, 'NOT_FOUND', 'Variant not found')
      if (
        variant.deliveryType === 'digital' &&
        req.body.stockQty !== undefined &&
        req.body.stockQty !== 0
      ) {
        throw new ApiError(400, 'INVALID_DIGITAL_STOCK', 'Digital variants must use stockQty 0')
      }
      const updated = await auditAdminMutation(
        prisma,
        req,
        { action: 'variant.update', resourceType: 'variant', resourceId: variantId },
        (tx) =>
          tx.productVariant.update({
            where: { variantId },
            data: {
              ...(req.body.price !== undefined ? { price: req.body.price } : {}),
              ...(req.body.stockQty !== undefined ? { stockQty: req.body.stockQty } : {}),
              ...(req.body.variantName !== undefined
                ? { variantName: req.body.variantName.trim() }
                : {}),
            },
          }),
      )
      res.json({ success: true, data: updated })
    },
  )

  router.post(
    '/products/:productId/images',
    validateBody(
      bodyIssues((body, issues) => {
        validateRequiredStrings(body, { url: { max: 2048 }, altText: { max: 255 } }, issues)
        if (!validateNonnegativeInteger(body.sortOrder ?? 0)) {
          issues.push({ field: 'sortOrder', message: 'Must be a non-negative integer' })
        }
      }),
    ),
    async (req, res) => {
      const productId = routeId(req.params.productId, 'Product')
      try {
        const image = await auditAdminMutation(
          prisma,
          req,
          { action: 'product.image.create', resourceType: 'product', resourceId: productId },
          (tx) =>
            tx.productImage.create({
              data: {
                productId,
                url: req.body.url.trim(),
                altText: req.body.altText.trim(),
                sortOrder: req.body.sortOrder ?? 0,
              },
            }),
        )
        res.status(201).json({ success: true, data: image })
      } catch (error) {
        if (error?.code === 'P2003') throw new ApiError(404, 'NOT_FOUND', 'Product not found')
        throw error
      }
    },
  )

  router.post('/variants/:variantId/digital-assets', assetValidation, async (req, res) => {
    const variantId = routeId(req.params.variantId, 'Variant')
    const variant = await prisma.productVariant.findUnique({ where: { variantId } })
    if (!variant) throw new ApiError(404, 'NOT_FOUND', 'Variant not found')
    if (variant.deliveryType !== 'digital') {
      throw new ApiError(
        400,
        'INVALID_DELIVERY_TYPE',
        'Digital assets can only be attached to digital variants',
      )
    }
    const { fileInfo } = await resolvePrivateFile(
      process.env.DIGITAL_STORAGE_ROOT,
      req.body.fileUrl,
    )
    if (fileInfo.size !== req.body.fileSize) {
      throw new ApiError(400, 'FILE_SIZE_MISMATCH', 'fileSize must match the private asset file')
    }
    const asset = await auditAdminMutation(
      prisma,
      req,
      {
        action: 'digital_asset.create',
        resourceType: 'digital_asset',
        resourceId: (created) => created.assetId,
      },
      (tx) =>
        tx.digitalAsset.create({
          data: {
            variantId,
            fileUrl: req.body.fileUrl,
            fileName: req.body.fileName.trim(),
            fileSize: BigInt(req.body.fileSize),
          },
        }),
    )
    res.status(201).json({
      success: true,
      data: {
        assetId: asset.assetId,
        variantId,
        fileName: asset.fileName,
        fileSize: asset.fileSize.toString(),
      },
    })
  })

  router.post('/vouchers', voucherValidation, async (req, res) => {
    try {
      const voucher = await auditAdminMutation(
        prisma,
        req,
        {
          action: 'voucher.create',
          resourceType: 'voucher',
          resourceId: (created) => created.voucherId,
        },
        (tx) =>
          tx.voucher.create({
            data: {
              code: req.body.code.trim().toUpperCase(),
              discountType: req.body.discountType,
              discountValue: req.body.discountValue,
              minPurchase: req.body.minPurchase ?? 0,
              usageLimit: req.body.usageLimit ?? null,
              validUntil: new Date(req.body.validUntil),
            },
          }),
      )
      res.status(201).json({ success: true, data: voucher })
    } catch (error) {
      prismaConflict(error, 'Voucher code')
    }
  })

  router.patch('/vouchers/:voucherId', voucherValidation, async (req, res) => {
    const voucherId = routeId(req.params.voucherId, 'Voucher')
    try {
      const voucher = await auditAdminMutation(
        prisma,
        req,
        { action: 'voucher.update', resourceType: 'voucher', resourceId: voucherId },
        (tx) =>
          tx.voucher.update({
            where: { voucherId },
            data: {
              code: req.body.code.trim().toUpperCase(),
              discountType: req.body.discountType,
              discountValue: req.body.discountValue,
              minPurchase: req.body.minPurchase ?? 0,
              usageLimit: req.body.usageLimit ?? null,
              validUntil: new Date(req.body.validUntil),
            },
          }),
      )
      res.json({ success: true, data: voucher })
    } catch (error) {
      if (error?.code === 'P2025') throw new ApiError(404, 'NOT_FOUND', 'Voucher not found')
      prismaConflict(error, 'Voucher code')
    }
  })

  router.get('/vouchers', async (_req, res) => {
    const vouchers = await prisma.voucher.findMany({ orderBy: { validUntil: 'desc' } })
    res.json({ success: true, data: vouchers })
  })

  router.delete('/vouchers/:voucherId', async (req, res) => {
    const voucherId = routeId(req.params.voucherId, 'Voucher')
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
      include: { orderVouchers: { take: 1 } },
    })
    if (!voucher) throw new ApiError(404, 'NOT_FOUND', 'Voucher not found')
    if (voucher.orderVouchers.length) {
      throw new ApiError(409, 'VOUCHER_USED', 'Voucher with order history cannot be deleted')
    }
    await auditAdminMutation(
      prisma,
      req,
      { action: 'voucher.delete', resourceType: 'voucher', resourceId: voucherId },
      (tx) => tx.voucher.delete({ where: { voucherId } }),
    )
    res.status(204).end()
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
    const where = {}
    if (req.query.status) {
      const statuses = [
        'pending_payment',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled',
        'expired',
      ]
      if (!statuses.includes(String(req.query.status))) {
        throw new ApiError(400, 'INVALID_STATUS', 'Order status filter is invalid')
      }
      where.status = String(req.query.status)
    }
    if (req.query.q !== undefined) {
      const query = String(req.query.q).trim()
      if (!query || query.length > 128) {
        throw new ApiError(400, 'INVALID_QUERY', 'Search query must contain 1-128 characters')
      }
      where.OR = [
        { orderNumber: { contains: query } },
        { customer: { fullName: { contains: query } } },
        { customer: { email: { contains: query } } },
      ]
    }
    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { customerId: true, fullName: true, email: true } },
          payments: true,
          items: { include: { variant: { select: { deliveryType: true } } } },
          shipment: { include: { tracking: { orderBy: { trackingSeq: 'asc' } } } },
        },
        orderBy: { orderDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])
    res.json({
      success: true,
      data: orders,
      meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    })
  })

  router.patch('/orders/:orderId/status', orderStatusValidation, async (req, res) => {
    const orderId = routeId(req.params.orderId, 'Order')
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: { include: { variant: true } }, payments: true, shipment: true },
    })
    if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found')
    if (req.body.status === 'processing') {
      const physical = order.items.some((item) => item.variant.deliveryType === 'physical')
      if (
        !physical ||
        order.status !== 'paid' ||
        !order.payments.some((payment) => payment.status === 'success')
      ) {
        throw new ApiError(
          409,
          'INVALID_ORDER_TRANSITION',
          'Only paid orders containing physical items can be processed',
        )
      }
    } else if (req.body.status === 'cancelled') {
      if (order.status !== 'pending_payment') {
        throw new ApiError(
          409,
          'INVALID_ORDER_TRANSITION',
          'Order cannot be cancelled from its current status',
        )
      }
      if (order.payments.some((payment) => payment.status === 'success')) {
        throw new ApiError(
          409,
          'PAYMENT_ALREADY_SUCCESS',
          'A paid order cannot be cancelled without a refund flow',
        )
      }
    }
    const updated = await auditAdminMutation(
      prisma,
      req,
      { action: 'order.status.update', resourceType: 'order', resourceId: orderId },
      async (tx) => {
        if (req.body.status === 'cancelled') {
          const current = await tx.order.findUnique({
            where: { orderId },
            include: {
              items: { include: { variant: { select: { deliveryType: true } } } },
              payments: true,
            },
          })
          if (!current || current.status !== 'pending_payment') {
            throw new ApiError(
              409,
              'INVALID_ORDER_TRANSITION',
              'Order is no longer pending payment',
            )
          }
          for (const item of current.items) {
            if (item.variant.deliveryType === 'physical') {
              await tx.productVariant.update({
                where: { variantId: item.variantId },
                data: { stockQty: { increment: item.quantity } },
              })
            }
          }
          if (current.payments[0]?.status === 'pending') {
            await tx.payment.update({
              where: { paymentId: current.payments[0].paymentId },
              data: { status: 'failed' },
            })
          }
        }
        return tx.order.update({ where: { orderId }, data: { status: req.body.status } })
      },
    )
    res.json({ success: true, data: updated })
  })

  router.post('/orders/:orderId/shipment', shipmentValidation, async (req, res) => {
    const orderId = routeId(req.params.orderId, 'Order')
    try {
      const shipment = await auditAdminMutation(
        prisma,
        req,
        {
          action: 'shipment.create',
          resourceType: 'shipment',
          resourceId: (created) => created.shipmentId,
        },
        async (tx) => {
          const order = await tx.order.findUnique({
            where: { orderId },
            include: {
              items: { include: { variant: { select: { deliveryType: true } } } },
              shipment: true,
            },
          })
          if (!order) throw new ApiError(404, 'NOT_FOUND', 'Order not found')
          if (
            order.status !== 'processing' ||
            !order.items.some((item) => item.variant.deliveryType === 'physical')
          ) {
            throw new ApiError(
              409,
              'INVALID_SHIPMENT',
              'Only processing orders containing physical items can be shipped',
            )
          }
          if (order.shipment) throw new ApiError(409, 'SHIPMENT_EXISTS', 'Shipment already exists')
          const created = await tx.shipment.create({
            data: {
              orderId,
              courier: req.body.courier.trim(),
              serviceType: req.body.serviceType.trim(),
              trackingNumber: req.body.trackingNumber.trim(),
              shippedAt: new Date(),
            },
          })
          await tx.shipmentTrack.create({
            data: {
              shipmentId: created.shipmentId,
              trackingSeq: 1,
              status: 'picked_up',
              eventTime: new Date(),
            },
          })
          await tx.order.update({ where: { orderId }, data: { status: 'shipped' } })
          return created
        },
      )
      res.status(201).json({ success: true, data: shipment })
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error?.code === 'P2002')
        throw new ApiError(409, 'SHIPMENT_EXISTS', 'Shipment already exists')
      throw error
    }
  })

  router.post('/shipments/:shipmentId/tracking', trackingValidation, async (req, res) => {
    const shipmentId = routeId(req.params.shipmentId, 'Shipment')
    const transition = await auditAdminMutation(
      prisma,
      req,
      { action: 'shipment.tracking.create', resourceType: 'shipment', resourceId: shipmentId },
      async (tx) => {
        const shipment = await tx.shipment.findUnique({
          where: { shipmentId },
          include: { tracking: { orderBy: { trackingSeq: 'desc' }, take: 1 } },
        })
        if (!shipment) throw new ApiError(404, 'NOT_FOUND', 'Shipment not found')
        const previous = shipment.tracking[0]
        const allowedNext = {
          picked_up: ['in_transit'],
          in_transit: ['out_for_delivery'],
          out_for_delivery: ['delivered'],
          delivered: [],
        }
        if (previous && !allowedNext[previous.status].includes(req.body.status)) {
          throw new ApiError(
            409,
            'INVALID_TRACKING_TRANSITION',
            'Tracking status transition is invalid',
          )
        }
        const created = await tx.shipmentTrack.create({
          data: {
            shipmentId,
            trackingSeq: (previous?.trackingSeq ?? 0) + 1,
            status: req.body.status,
            eventTime: new Date(),
          },
        })
        if (req.body.status === 'delivered') {
          await tx.order.update({
            where: { orderId: shipment.orderId },
            data: { status: 'completed' },
          })
        }
        return created
      },
    )
    res.status(201).json({ success: true, data: transition })
  })

  return router
}
