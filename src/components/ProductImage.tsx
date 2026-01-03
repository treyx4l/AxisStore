import { useState, useEffect } from 'react'
import { getProductImage, getProductImageSync } from '../utils/imageUtils'
import type { Product } from '../data/products'

interface ProductImageProps {
  product: Product
  alt?: string
  sx?: any
  [key: string]: any
}

export const ProductImage = ({ product, alt, sx, ...props }: ProductImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(getProductImageSync(product))
  const [loading, setLoading] = useState(product.image.startsWith('rtdb://'))

  useEffect(() => {
    // If image is from RTDB, load it asynchronously
    if (product.image.startsWith('rtdb://')) {
      getProductImage(product)
        .then((image) => {
          setImageSrc(image)
          setLoading(false)
        })
        .catch(() => {
          // Error loading product image - handled silently
          setLoading(false)
        })
    }
  }, [product.id, product.image])

  return (
    <img
      src={imageSrc}
      alt={alt || product.name}
      style={{
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.3s',
        ...sx,
      }}
      {...props}
    />
  )
}

