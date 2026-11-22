import { ApiError } from '../errors.js'
import { hashToken } from '../security/tokens.js'

export function authenticate(prisma, allowedRoles = ['customer', 'admin']) {
  return async (req, _res, next) => {
    try {
      const authorization = req.get('authorization') ?? ''
      const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization)
      if (!match) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required')

      const session = await prisma.authSession.findUnique({
        where: { tokenHash: hashToken(match[1]) },
        include: { customer: true, admin: true },
      })
      if (!session || session.revokedAt || session.expiresAt <= new Date()) {
        throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication is required')
      }

      const principal = session.customer
        ? { role: 'customer', id: session.customer.customerId, account: session.customer }
        : session.admin
          ? { role: 'admin', id: session.admin.adminId, account: session.admin }
          : null
      if (
        !principal ||
        (principal.role === 'customer' && !principal.account.isActive) ||
        !allowedRoles.includes(principal.role)
      ) {
        throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action')
      }

      req.auth = { sessionHash: session.tokenHash, ...principal }
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (req.auth?.role !== role) {
      next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action'))
      return
    }
    next()
  }
}
