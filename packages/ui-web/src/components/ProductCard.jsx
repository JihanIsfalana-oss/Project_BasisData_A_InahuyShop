import React from 'react'
import { Card } from './Card.jsx'
import { PriceText } from './PriceText.jsx'

export function ProductCard({ name, amount, currency = 'IDR', imageUrl }) {
  return (
    <Card>
      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ aspectRatio: '4 / 3', objectFit: 'cover' }} />
      ) : null}
      <h3>{name}</h3>
      <PriceText amount={amount} currency={currency} />
    </Card>
  )
}
