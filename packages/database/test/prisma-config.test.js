import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { buildPrismaDatabaseUrl } from '../src/prisma-config.js'

const require = createRequire(import.meta.url)
const prismaCli = require.resolve('prisma/build/index.js')
const databaseRoot = fileURLToPath(new URL('..', import.meta.url))
const migrationEnvironment = {
  MYSQL_HOST: 'mysql.example.test',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'inahuyshop',
  MYSQL_PASSWORD: 'test-password',
  MYSQL_DATABASE: 'inahuyshop',
}

test('Prisma client generation does not require database credentials', () => {
  const environment = { ...process.env }
  for (const name of Object.keys(environment)) {
    if (name.startsWith('MYSQL_')) delete environment[name]
  }

  const result = spawnSync(process.execPath, [prismaCli, 'generate'], {
    cwd: path.resolve(databaseRoot),
    env: environment,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
})

test('requires a CA file for production migration URLs', () => {
  assert.throws(
    () => buildPrismaDatabaseUrl({ ...migrationEnvironment, NODE_ENV: 'production' }),
    /MYSQL_SSL_CA_FILE is required/,
  )
})

test('uses strict TLS and the configured CA for production migration URLs', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'inahuyshop-prisma-ca-'))
  const caFile = path.join(directory, 'ca.pem')
  writeFileSync(caFile, 'test CA certificate')

  try {
    const url = new URL(
      buildPrismaDatabaseUrl({
        ...migrationEnvironment,
        NODE_ENV: 'production',
        MYSQL_SSL_CA_FILE: caFile,
      }),
    )

    assert.equal(url.searchParams.get('sslaccept'), 'strict')
    assert.equal(url.searchParams.get('sslcert'), caFile)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('surfaces an unreadable CA file for migration URLs', () => {
  assert.throws(
    () =>
      buildPrismaDatabaseUrl({
        ...migrationEnvironment,
        NODE_ENV: 'production',
        MYSQL_SSL_CA_FILE: path.join(os.tmpdir(), 'missing-prisma-ca.pem'),
      }),
    /ENOENT/,
  )
})
