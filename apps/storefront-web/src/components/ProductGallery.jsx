export function ProductGallery({ images = [], name }) {
  if (!images.length)
    return <div className="product-placeholder" aria-label={`${name} tanpa gambar`} />
  return (
    <div className="product-gallery">
      {images.map((image, index) => (
        <img
          key={image.imageId ?? image.url ?? index}
          src={image.imageUrl ?? image.url}
          alt={`${name} gambar ${index + 1}`}
        />
      ))}
    </div>
  )
}
