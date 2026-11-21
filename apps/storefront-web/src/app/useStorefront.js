import { useContext } from 'react'
import { StorefrontContext } from './context.js'

export function useStorefront() {
  const value = useContext(StorefrontContext)
  if (!value) throw new Error('useStorefront must be used inside StorefrontProvider')
  return value
}
