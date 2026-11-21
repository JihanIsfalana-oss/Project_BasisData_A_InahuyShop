import { File, Paths } from 'expo-file-system'

import { API_BASE_URL } from './api'
import { createDownloadRequest } from './download-request.js'

export async function downloadDigitalAsset(
  downloadPath: string,
  sessionToken: string,
  downloadToken: string,
  fileName: string,
) {
  const request = createDownloadRequest(
    new URL(downloadPath, API_BASE_URL).toString(),
    sessionToken,
    downloadToken,
  )
  const response = await fetch(request.url, { headers: request.headers })
  if (!response.ok) throw new Error('Download tidak tersedia.')
  const file = new File(Paths.cache, fileName.replace(/[^A-Za-z0-9._-]/g, '_'))
  await file.write(new Uint8Array(await response.arrayBuffer()))
  await file.preview()
}
