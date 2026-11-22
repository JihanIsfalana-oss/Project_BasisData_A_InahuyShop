import assert from 'node:assert/strict'
import test from 'node:test'
import { errorHandler, ApiError } from '../src/errors.js'
import { initializeSentry } from '../src/monitoring/sentry.js'

test('requires a Sentry DSN in production', () => {
  const sentry = { init() {} }

  assert.throws(() => initializeSentry(sentry, 'production', undefined), /SENTRY_DSN is required/)
})

test('removes request and user data before sending errors to Sentry', () => {
  let options
  let captured
  const sentry = {
    init(value) {
      options = value
    },
    captureException(error) {
      captured = error
    },
  }

  const captureException = initializeSentry(sentry, 'production', 'https://example.test/1')
  const event = {
    request: { data: { password: 'secret' }, headers: { authorization: 'Bearer token' } },
    user: { email: 'customer@example.test' },
    extra: { token: 'secret' },
    breadcrumbs: [{ data: { body: 'private' } }],
    exception: {
      values: [{ type: 'Error', value: 'private error message', stacktrace: { frames: [] } }],
    },
  }
  const error = new Error('private error message')
  const filtered = options.beforeSend(event)

  captureException(error)

  assert.equal(options.sendDefaultPii, false)
  assert.equal(filtered.request, undefined)
  assert.equal(filtered.user, undefined)
  assert.equal(filtered.extra, undefined)
  assert.equal(filtered.breadcrumbs, undefined)
  assert.equal(filtered.exception.values[0].value, undefined)
  assert.deepEqual(filtered.exception.values[0].stacktrace, { frames: [] })
  assert.equal(captured, error)
})

test('reports only server errors without passing request data to the reporter', () => {
  const request = { id: 'request-1', body: { password: 'secret' } }
  const responses = []
  const reported = []
  const response = {
    headersSent: false,
    status(status) {
      this.statusCode = status
      return this
    },
    json(body) {
      responses.push(body)
    },
  }
  const captureException = (...args) => reported.push(args)

  errorHandler(new Error('database failure'), request, response, () => {}, captureException)
  errorHandler(
    new ApiError(400, 'INVALID_INPUT', 'Invalid input'),
    request,
    response,
    () => {},
    captureException,
  )

  assert.equal(reported.length, 1)
  assert.equal(reported[0].length, 1)
  assert.equal(reported[0][0].message, 'database failure')
  assert.equal(JSON.stringify(responses).includes('secret'), false)
})
