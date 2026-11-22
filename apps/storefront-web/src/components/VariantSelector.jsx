import { PriceText } from '@inahuyshop/ui-web'

export function VariantSelector({ variants, selectedId, onChange }) {
  return (
    <fieldset className="variant-list">
      <legend>Varian</legend>
      {variants.map((variant) => {
        const unavailable =
          variant.stockQty < 1 ||
          (variant.deliveryType === 'digital' && variant.hasDigitalAssets === false)
        return (
          <label
            key={variant.variantId}
            className={unavailable ? 'variant unavailable' : 'variant'}
          >
            <input
              type="radio"
              name="variant"
              value={variant.variantId}
              checked={selectedId === variant.variantId}
              onChange={() => onChange(variant)}
              disabled={unavailable}
            />
            <span>
              <strong>{variant.variantName}</strong>
              <PriceText amount={Number(variant.price)} currency="IDR" />
              <small>
                {variant.deliveryType === 'digital'
                  ? 'Digital'
                  : `Fisik · stok ${variant.stockQty}`}
              </small>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
