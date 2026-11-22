function removeSensitiveContext(event) {
  const sanitized = { ...event }
  delete sanitized.request
  delete sanitized.user
  delete sanitized.extra
  delete sanitized.breadcrumbs

  if (sanitized.contexts) {
    sanitized.contexts = { ...sanitized.contexts }
    delete sanitized.contexts.request
  }

  if (sanitized.exception?.values) {
    sanitized.exception = {
      ...sanitized.exception,
      values: sanitized.exception.values.map((exception) => {
        const sanitizedException = { ...exception }
        delete sanitizedException.value
        return sanitizedException
      }),
    }
  }

  return sanitized
}

export function initializeSentry(sentry, environment, dsn = process.env.SENTRY_DSN) {
  if (!dsn) {
    if (environment === 'production') {
      throw new Error('SENTRY_DSN is required in production')
    }

    return undefined
  }

  sentry.init({
    dsn,
    environment,
    sendDefaultPii: false,
    beforeSend: removeSensitiveContext,
  })

  return (error) => sentry.captureException(error)
}
