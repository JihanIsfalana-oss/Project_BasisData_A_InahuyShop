export const isDeliveryEligible = ({ deliveryType, hasPhysicalItems, address }) => {
  if (hasPhysicalItems && deliveryType === 'SHIPMENT' && !address) {
    return { eligible: false, reason: 'address-required' }
  }
  if (!hasPhysicalItems && deliveryType === 'SHIPMENT') {
    return { eligible: false, reason: 'physical-items-required' }
  }
  return { eligible: true }
}
