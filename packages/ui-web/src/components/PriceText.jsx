export function PriceText({ amount, currency, locale = 'id-ID' }) {
  return (
    <data value={amount}>
      {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)}
    </data>
  )
}
import React from 'react'
