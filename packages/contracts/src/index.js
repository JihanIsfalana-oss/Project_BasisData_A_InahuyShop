/**
 * @typedef {Object} HealthResponse
 * @property {boolean} success
 * @property {string} message
 */

/** Pesan respons health check API. */
export const API_HEALTH_MESSAGE = 'InahuyShop API is running'

export { OrderStatus } from './enums/order-status.js'
export { DeliveryStatus } from './enums/delivery-status.js'
export { authRequestSchema } from './schemas/auth.schema.js'
export { checkoutRequestSchema } from './schemas/checkout.schema.js'
export { productResponseSchema } from './schemas/product.schema.js'
