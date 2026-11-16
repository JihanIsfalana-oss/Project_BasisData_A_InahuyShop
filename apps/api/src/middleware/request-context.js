import { randomUUID } from 'node:crypto'

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/

export function requestContext(req, res, next) {
  const suppliedId = req.get('x-request-id')
  req.id = suppliedId && requestIdPattern.test(suppliedId) ? suppliedId : randomUUID()
  res.setHeader('x-request-id', req.id)
  const json = res.json.bind(res)
  res.json = (body) =>
    json(
      body && typeof body === 'object' && !Array.isArray(body)
        ? { ...body, requestId: req.id }
        : body,
    )
  next()
}

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    console.info(
      JSON.stringify({
        level: 'info',
        event: 'request.complete',
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(3)),
      }),
    )
  })

  next()
}
