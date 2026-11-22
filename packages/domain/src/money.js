const assertMoney = (value) => {
  if (
    !value ||
    !Number.isInteger(value.amount) ||
    value.amount < 0 ||
    typeof value.currency !== 'string' ||
    value.currency.length !== 3
  ) {
    throw new TypeError('Invalid money value')
  }
}

export const addMoney = (...values) => {
  values.forEach(assertMoney)
  const currencies = new Set(values.map((value) => value.currency))
  if (currencies.size !== 1) throw new RangeError('Currency mismatch')
  return {
    amount: values.reduce((total, value) => total + value.amount, 0),
    currency: values[0].currency,
  }
}

export const multiplyMoney = (value, quantity) => {
  assertMoney(value)
  if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError('Invalid quantity')
  return { amount: value.amount * quantity, currency: value.currency }
}
