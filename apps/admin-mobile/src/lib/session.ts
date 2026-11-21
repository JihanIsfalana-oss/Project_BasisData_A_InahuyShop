import * as SecureStore from 'expo-secure-store'

const ADMIN_SESSION_TOKEN_KEY = 'inahuyshop.admin.session.token'

export async function readAdminSessionToken() {
  return SecureStore.getItemAsync(ADMIN_SESSION_TOKEN_KEY)
}

export async function saveAdminSessionToken(token: string) {
  await SecureStore.setItemAsync(ADMIN_SESSION_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
}

export async function clearAdminSessionToken() {
  await SecureStore.deleteItemAsync(ADMIN_SESSION_TOKEN_KEY)
}
