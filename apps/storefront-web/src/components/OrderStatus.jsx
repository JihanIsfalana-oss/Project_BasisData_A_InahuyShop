import { getOrderStatusLabel } from '../app/account.js'

export function OrderStatus({ status }) {
  return <span className={`status status-${status}`}>{getOrderStatusLabel(status)}</span>
}
