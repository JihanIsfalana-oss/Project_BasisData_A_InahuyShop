import { ApiError } from '../errors.js'

export function validateBody(validator) {
  return (req, _res, next) => {
    const issues = validator(req.body)

    if (!Array.isArray(issues)) {
      next(new TypeError('Request body validators must return an array of issues'))
      return
    }

    if (issues.length > 0) {
      next(new ApiError(400, 'VALIDATION_ERROR', 'Request body is invalid', issues))
      return
    }

    next()
  }
}
