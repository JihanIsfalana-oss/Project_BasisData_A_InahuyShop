import test from 'node:test'
import assert from 'node:assert/strict'

import { createDownloadRequest } from './download-request.js'

test('builds download request with bearer and one-time token headers', () => {
  assert.deepEqual(
    createDownloadRequest('https://api.example.test/download', 'session-token', 'download-token'),
    {
      url: 'https://api.example.test/download',
      headers: {
        Authorization: 'Bearer session-token',
        'x-download-token': 'download-token',
      },
    },
  )
})
