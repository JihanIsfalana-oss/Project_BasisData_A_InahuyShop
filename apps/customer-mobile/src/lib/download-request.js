export function createDownloadRequest(url, sessionToken, downloadToken) {
  return {
    url,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'x-download-token': downloadToken,
    },
  }
}
