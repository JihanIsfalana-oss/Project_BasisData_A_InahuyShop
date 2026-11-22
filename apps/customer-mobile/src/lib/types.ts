export type Customer = {
  customerId?: number
  fullName?: string
  email?: string
  phone?: string | null
}

export type Session = {
  role: 'customer'
  customer: Customer
}

export type CartItem = {
  variantId: number
  variantName: string
  price: string | number
  quantity: number
  deliveryType: 'digital' | 'physical'
  product?: { productId: number; name: string }
}

export type Cart = { items: CartItem[] }

export type Address = {
  addressId: number
  label: string
  city: string
  isDefault?: boolean
}

export type Order = {
  orderId: number
  orderNumber: string
  orderDate: string
  status: string
  grandTotal: string | number
  items: {
    orderItemId: number
    productName: string
    quantity: number
    unitPrice: string | number
    deliveryType?: 'digital' | 'physical'
    digitalDeliveries?: { deliveryId: number; expiresAt: string; downloadCount: number }[]
  }[]
  shipment?: {
    courier?: string
    trackingNumber?: string
    tracking?: { trackingSeq: number; status: string; description?: string }[]
  } | null
}
