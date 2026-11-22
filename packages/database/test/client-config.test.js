import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { buildMySqlOptions } from '../src/config.js'

const baseEnvironment = {
  MYSQL_HOST: 'mysql.example.test',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'inahuyshop',
  MYSQL_PASSWORD: 'test-password',
  MYSQL_DATABASE: 'inahuyshop',
}

test('requires a CA file for production MySQL connections', () => {
  assert.throws(
    () => buildMySqlOptions({ ...baseEnvironment, NODE_ENV: 'production' }),
    /MYSQL_SSL_CA_FILE is required/,
  )
})

test('uses verified TLS when a CA file is configured', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'inahuyshop-mysql-ca-'))
  const caFile = path.join(directory, 'ca.pem')
  const ca = 'test CA certificate'
  writeFileSync(caFile, ca)

  try {
    const options = buildMySqlOptions({
      ...baseEnvironment,
      NODE_ENV: 'production',
      MYSQL_SSL_CA_FILE: caFile,
    })

    assert.deepEqual(options.ssl, {
      ca: readFileSync(caFile),
      rejectUnauthorized: true,
    })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('keeps local MySQL connections unchanged without a CA file', () => {
  const options = buildMySqlOptions({
    ...baseEnvironment,
    NODE_ENV: 'development',
  })

  assert.equal(options.host, 'mysql.example.test')
  assert.equal(options.port, 3306)
  assert.equal('ssl' in options, false)
})

test('surfaces an unreadable configured CA file', () => {
  assert.throws(
    () =>
      buildMySqlOptions({
        ...baseEnvironment,
        NODE_ENV: 'production',
        MYSQL_SSL_CA_FILE: path.join(tmpdir(), 'missing-mysql-ca.pem'),
      }),
    /ENOENT/,
  )
})
