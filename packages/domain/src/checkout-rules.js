export const calculateCheckoutTotals = ({ items, discount = 0, shipping = 0 }) => {
  if (
    !Array.isArray(items) ||
    !Number.isInteger(discount) ||
    discount < 0 ||
    !Number.isInteger(shipping) ||
    shipping < 0
  ) {
    throw new TypeError('Invalid checkout totals')
  }
  const subtotal = items.reduce((total, item) => {
    if (
      !Number.isInteger(item.unitPrice) ||
      item.unitPrice < 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 0
    ) {
      throw new TypeError('Invalid checkout item')
    }
    return total + item.unitPrice * item.quantity
  }, 0)
  const appliedDiscount = Math.min(discount, subtotal)
  return {
    subtotal,
    discount: appliedDiscount,
    shipping,
    total: subtotal - appliedDiscount + shipping,
    currency: 'IDR',
  }
}
