import test from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import { formatValidationError, validateRequest } from '../src/index.js'

test('validateRequest returns parsed data', () => {
  const schema = z.object({ email: z.string().email() }).strict()
  assert.deepEqual(validateRequest(schema, { email: 'user@example.com' }), {
    email: 'user@example.com',
  })
})

test('formatValidationError returns field issues', () => {
  const schema = z.object({ email: z.string().email() }).strict()
  assert.throws(
    () => validateRequest(schema, { email: 'bad' }),
    (error) => {
      assert.deepEqual(formatValidationError(error), [
        { path: ['email'], code: 'invalid_format', message: 'Invalid email address' },
      ])
      return true
    },
  )
})
