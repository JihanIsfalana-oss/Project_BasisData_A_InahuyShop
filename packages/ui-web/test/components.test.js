import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { Button, Card, Input, Badge, PriceText } from '../src/index.js'

test('web primitives render semantic accessible markup', () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Card,
      null,
      React.createElement(Button, { type: 'button' }, 'Buy'),
      React.createElement(Input, { label: 'Email', name: 'email' }),
      React.createElement(Badge, null, 'New'),
      React.createElement(PriceText, { amount: 12500, currency: 'IDR', locale: 'id-ID' }),
    ),
  )
  assert.match(markup, /<button/)
  assert.match(markup, /<label/)
  assert.match(markup, /data-ui="card"/)
  assert.match(markup, /Rp/)
})
