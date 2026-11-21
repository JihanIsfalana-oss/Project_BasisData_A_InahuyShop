import * as SecureStore from 'expo-secure-store'

const SESSION_TOKEN_KEY = 'inahuyshop.customer.session.token'

export { shouldClearSession } from './session-policy.js'

export async function readSessionToken() {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY)
}

export async function saveSessionToken(token: string) {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
}

export async function clearSessionToken() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY)
}
