import express from 'express'
import { API_HEALTH_MESSAGE } from '@inahuyshop/contracts'
import { ApiError, errorHandler } from './errors.js'
import { authenticate } from './middleware/authenticate.js'
import { requestContext, requestLogger } from './middleware/request-context.js'
import { createAuthRouter } from './routes/auth.js'
import { createAdminRouter } from './routes/admin.js'
import { createCatalogRouter } from './routes/catalog.js'
import { createCommerceRouter } from './routes/commerce.js'
import { createCustomerRouter } from './routes/customer.js'

export function createApp({ checkDatabase, prisma }) {
  if (typeof checkDatabase !== 'function') {
    throw new TypeError('createApp requires a database readiness check')
  }

  const app = express()

  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(requestLogger)
  app.use(express.json({ limit: '1mb' }))

  if (prisma) {
    app.use('/api/v1', createAuthRouter(prisma))
    app.use('/api/v1', createCatalogRouter(prisma))
    app.use(
      '/api/v1/customer',
      authenticate(prisma, ['customer']),
      createCustomerRouter(prisma),
      createCommerceRouter(prisma),
    )
    app.use('/api/v1/admin', createAdminRouter(prisma))
  }

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: API_HEALTH_MESSAGE,
      requestId: req.id,
    })
  })

  app.get('/api/ready', async (req, res) => {
    try {
      await checkDatabase()
    } catch (error) {
      const unavailable = new ApiError(
        503,
        'DEPENDENCY_UNAVAILABLE',
        'A required dependency is unavailable',
      )
      unavailable.cause = error
      throw unavailable
    }

    res.status(200).json({
      success: true,
      data: { status: 'ready' },
      requestId: req.id,
    })
  })

  app.use((req, _res, next) => {
    next(new ApiError(404, 'NOT_FOUND', 'Route not found'))
  })

  app.use(errorHandler)

  return app
}
