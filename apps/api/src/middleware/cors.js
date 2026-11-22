const allowedMethods = 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS'
const allowedHeaders = 'Authorization,Content-Type,X-Download-Token,X-Request-Id'

export function createCorsMiddleware(allowedOrigins = []) {
  const origins = new Set(allowedOrigins)

  return (req, res, next) => {
    const origin = req.get('Origin')
    if (!origin) return next()

    if (!origins.has(origin)) {
      if (req.method === 'OPTIONS') return res.status(403).end()
      return next()
    }

    res.setHeader('Access-Control-Allow-Origin', origin)
    res.vary('Origin')

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', allowedMethods)
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders)
      res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id')
      return res.status(204).end()
    }

    res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id')
    return next()
  }
}
