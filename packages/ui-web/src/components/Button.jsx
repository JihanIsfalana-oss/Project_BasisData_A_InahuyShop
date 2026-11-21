export function Button({ children, loading = false, ...props }) {
  return (
    <button {...props} disabled={props.disabled || loading} style={{ minHeight: 44 }}>
      {loading ? 'Loading...' : children}
    </button>
  )
}
import React from 'react'
