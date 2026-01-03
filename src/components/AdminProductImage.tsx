import { useState, useEffect } from 'react'
import { imagesService } from '../services/rtdbService'
import type { Product } from '../data/products'

interface AdminProductImageProps {
  product: Product
  alt?: string
  sx?: any
  [key: string]: any
}

export const AdminProductImage = ({ product, alt, sx, ...props }: AdminProductImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      if (product.image.startsWith('rtdb://')) {
        // Load from RTDB
        try {
          const productId = product.image.replace('rtdb://', '')
          const imageData = await imagesService.get(productId)
          if (imageData) {
            setImageSrc(imageData)
          } else {
            setImageSrc('/assets/products/placeholder.jpg')
          }
        } catch (error) {
          // Error loading image from RTDB - handled silently
          setImageSrc('/assets/products/placeholder.jpg')
        }
      } else {
        // Regular URL
        setImageSrc(product.image)
      }
      setLoading(false)
    }

    loadImage()
  }, [product.id, product.image])

  return (
    <img
      src={imageSrc}
      alt={alt || product.name}
      style={{
        opacity: loading ? 0.3 : 1,
        transition: 'opacity 0.3s',
        ...sx,
      }}
      {...props}
    />
  )
}

