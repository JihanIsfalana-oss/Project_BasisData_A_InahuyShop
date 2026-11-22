export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function errorHandler(error, req, res, next, captureException) {
  if (res.headersSent) {
    next(error)
    return
  }

  const status =
    error instanceof ApiError
      ? error.status
      : error?.type === 'entity.too.large'
        ? 413
        : error?.type === 'entity.parse.failed'
          ? 400
          : 500
  const code =
    error instanceof ApiError
      ? error.code
      : error?.type === 'entity.too.large'
        ? 'PAYLOAD_TOO_LARGE'
        : error?.type === 'entity.parse.failed'
          ? 'INVALID_JSON'
          : 'INTERNAL_ERROR'
  const message =
    error instanceof ApiError
      ? error.message
      : error?.type === 'entity.too.large'
        ? 'Request body exceeds the 1 MB limit'
        : error?.type === 'entity.parse.failed'
          ? 'Request body contains invalid JSON'
          : 'An unexpected error occurred'

  if (status >= 500) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'request.error',
        requestId: req.id,
        errorType: error?.cause?.name ?? error?.name ?? 'Error',
      }),
    )
    captureException?.(error)
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
    },
    requestId: req.id,
  })
}
