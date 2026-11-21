import { realpath, stat } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { ApiError } from '../errors.js'

export async function resolvePrivateFile(storageRoot, storedPath) {
  if (!storageRoot) {
    throw new ApiError(503, 'DIGITAL_STORAGE_UNAVAILABLE', 'Digital storage is not configured')
  }
  if (
    typeof storedPath !== 'string' ||
    !storedPath ||
    isAbsolute(storedPath) ||
    /^[a-z][a-z0-9+.-]*:/i.test(storedPath)
  ) {
    throw new ApiError(
      400,
      'INVALID_STORAGE_PATH',
      'Asset path must be relative to private storage',
    )
  }

  let root
  try {
    root = await realpath(storageRoot)
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      throw new ApiError(
        503,
        'DIGITAL_STORAGE_UNAVAILABLE',
        'Digital storage directory is unavailable',
      )
    }
    throw error
  }

  const filePath = resolve(root, storedPath)
  const pathFromRoot = relative(root, filePath)
  if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new ApiError(400, 'INVALID_STORAGE_PATH', 'Asset path must remain inside private storage')
  }

  let actualPath
  try {
    actualPath = await realpath(filePath)
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      throw new ApiError(404, 'FILE_NOT_FOUND', 'Digital asset file is unavailable')
    }
    throw error
  }
  const actualRelative = relative(root, actualPath)
  if (
    actualRelative === '..' ||
    actualRelative.startsWith(`..${sep}`) ||
    isAbsolute(actualRelative)
  ) {
    throw new ApiError(400, 'INVALID_STORAGE_PATH', 'Asset path must remain inside private storage')
  }

  let fileInfo
  try {
    fileInfo = await stat(actualPath)
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      throw new ApiError(404, 'FILE_NOT_FOUND', 'Digital asset file is unavailable')
    }
    throw error
  }
  if (!fileInfo.isFile())
    throw new ApiError(404, 'FILE_NOT_FOUND', 'Digital asset file is unavailable')
  return { filePath: actualPath, fileInfo }
}
