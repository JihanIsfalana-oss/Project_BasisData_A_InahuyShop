import { Router } from 'express'
import { ApiError } from '../errors.js'

const maxPageSize = 100

function pagination(query) {
  const page = Number(query.page ?? 1)
  const pageSize = Number(query.pageSize ?? 20)
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > maxPageSize
  ) {
    throw new ApiError(400, 'INVALID_PAGINATION', 'page or pageSize is invalid')
  }
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

function productSelect() {
  return {
    productId: true,
    name: true,
    description: true,
    brand: true,
    category: { select: { categoryId: true, name: true, slug: true } },
    images: { orderBy: { sortOrder: 'asc' } },
    variants: {
      where: { product: { isActive: true } },
      orderBy: { variantId: 'asc' },
      select: {
        variantId: true,
        sku: true,
        variantName: true,
        price: true,
        stockQty: true,
        deliveryType: true,
        _count: { select: { digitalAssets: true } },
      },
    },
  }
}

export function createCatalogRouter(prisma) {
  const router = Router()

  router.get('/categories', async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    })
    res.json({ success: true, data: categories })
  })

  router.get('/products', async (req, res) => {
    const { page, pageSize, skip, take } = pagination(req.query)
    const where = {
      isActive: true,
      ...(req.query.category ? { category: { slug: String(req.query.category) } } : {}),
      ...(req.query.q
        ? {
            OR: [
              { name: { contains: String(req.query.q) } },
              { brand: { contains: String(req.query.q) } },
            ],
          }
        : {}),
    }
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: productSelect(),
        orderBy: [{ createdAt: 'desc' }, { productId: 'desc' }],
        skip,
        take,
      }),
    ])
    res.json({
      success: true,
      data: products,
      meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    })
  })

  router.get('/products/:productId', async (req, res) => {
    const productId = Number(req.params.productId)
    if (!Number.isSafeInteger(productId) || productId < 1) {
      throw new ApiError(400, 'INVALID_ID', 'Product ID is invalid')
    }
    const product = await prisma.product.findFirst({
      where: { productId, isActive: true },
      select: {
        ...productSelect(),
        variants: {
          ...productSelect().variants,
        },
      },
    })
    if (!product) throw new ApiError(404, 'NOT_FOUND', 'Product not found')
    const reviewWhere = {
      orderItem: {
        variant: { productId },
        order: { status: { in: ['paid', 'processing', 'shipped', 'completed'] } },
      },
    }
    const [reviews, ratingStats] = await prisma.$transaction([
      prisma.review.findMany({
        where: reviewWhere,
        select: { rating: true, comment: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.review.aggregate({
        where: reviewWhere,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])
    res.json({
      success: true,
      data: {
        ...product,
        variants: product.variants.map(({ _count, ...variant }) => ({
          ...variant,
          hasDigitalAssets:
            variant.deliveryType === 'digital' ? _count.digitalAssets > 0 : undefined,
        })),
        reviews,
        rating: ratingStats._avg.rating,
        reviewCount: ratingStats._count.rating,
      },
    })
  })

  return router
}
