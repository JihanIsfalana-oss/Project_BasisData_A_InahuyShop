import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const keyLength = 64
const saltLength = 16
const parameters = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const invalidHash = `scrypt$${Buffer.alloc(saltLength).toString('base64url')}$${Buffer.alloc(keyLength).toString('base64url')}`

export async function hashPassword(password) {
  const salt = randomBytes(saltLength)
  const derived = await scrypt(password, salt, keyLength, parameters)
  return `scrypt$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, saltEncoded, hashEncoded, extra] = String(storedHash ?? '').split('$')
  const usable =
    algorithm === 'scrypt' &&
    !extra &&
    /^[A-Za-z0-9_-]+$/.test(saltEncoded ?? '') &&
    /^[A-Za-z0-9_-]+$/.test(hashEncoded ?? '')
  const [salt, expected] = usable
    ? [Buffer.from(saltEncoded, 'base64url'), Buffer.from(hashEncoded, 'base64url')]
    : [
        Buffer.from(invalidHash.split('$')[1], 'base64url'),
        Buffer.from(invalidHash.split('$')[2], 'base64url'),
      ]

  if (salt.length !== saltLength || expected.length !== keyLength) {
    await scrypt(
      password,
      Buffer.from(invalidHash.split('$')[1], 'base64url'),
      keyLength,
      parameters,
    )
    return false
  }

  const derived = Buffer.from(await scrypt(password, salt, keyLength, parameters))
  return usable && timingSafeEqual(derived, expected)
}
