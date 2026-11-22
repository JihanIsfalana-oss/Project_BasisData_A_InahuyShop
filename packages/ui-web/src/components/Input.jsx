export function Input({ label, id, ...props }) {
  const inputId = id ?? props.name
  return (
    <label htmlFor={inputId}>
      {label}
      <input id={inputId} {...props} style={{ minHeight: 44 }} />
    </label>
  )
}
import React from 'react'
