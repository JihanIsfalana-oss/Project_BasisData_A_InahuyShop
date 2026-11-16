import assert from 'node:assert/strict'
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { resolvePrivateFile } from '../src/security/private-storage.js'

test('private storage resolves existing files and rejects unavailable or escaping paths', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'inahuyshop-private-storage-'))
  const storageRoot = join(workspace, 'private')
  const filePath = join(storageRoot, 'books', 'ebook.bin')
  const outsidePath = join(workspace, 'outside.bin')

  try {
    await mkdir(join(storageRoot, 'books'), { recursive: true })
    await writeFile(filePath, 'private')
    await writeFile(outsidePath, 'outside')

    const resolved = await resolvePrivateFile(storageRoot, 'books/ebook.bin')
    assert.equal(resolved.filePath, await realpath(filePath))
    assert.equal(resolved.fileInfo.size, 7)

    await assert.rejects(resolvePrivateFile(storageRoot, '../outside.bin'), {
      code: 'INVALID_STORAGE_PATH',
    })
    await assert.rejects(resolvePrivateFile(storageRoot, outsidePath), {
      code: 'INVALID_STORAGE_PATH',
    })
    await assert.rejects(resolvePrivateFile(storageRoot, 'missing.bin'), {
      code: 'FILE_NOT_FOUND',
    })
    await assert.rejects(resolvePrivateFile(join(workspace, 'missing-root'), 'file.bin'), {
      code: 'DIGITAL_STORAGE_UNAVAILABLE',
    })
    await assert.rejects(resolvePrivateFile('', 'file.bin'), {
      code: 'DIGITAL_STORAGE_UNAVAILABLE',
    })
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})
