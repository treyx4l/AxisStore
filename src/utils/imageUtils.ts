import { imagesService } from '../services/rtdbService'

// Cache for RTDB images to avoid repeated fetches
const imageCache = new Map<string, string>()

/**
 * Get the image URL/data for a product
 * If the image is stored in RTDB (starts with "rtdb://"), fetch it from RTDB
 * Otherwise, return the image URL as-is
 */
export const getProductImage = async (product: { id: string; image: string }): Promise<string> => {
  // If image is a regular URL, return it
  if (!product.image.startsWith('rtdb://')) {
    return product.image
  }

  // Check cache first
  if (imageCache.has(product.id)) {
    return imageCache.get(product.id)!
  }

  // Extract product ID from rtdb:// reference
  const productId = product.image.replace('rtdb://', '')
  
  try {
    // Fetch image from RTDB
    const imageData = await imagesService.get(productId)
    if (imageData) {
      // Cache the image
      imageCache.set(product.id, imageData)
      return imageData
    }
  } catch (error) {
    // Error loading image from RTDB - handled silently
  }

  // Fallback to a placeholder if image not found
  return '/assets/products/placeholder.jpg'
}

/**
 * Get product image synchronously (returns URL if not RTDB, or placeholder)
 * Use this for initial render, then use getProductImage for RTDB images
 */
export const getProductImageSync = (product: { id: string; image: string }): string => {
  if (!product.image.startsWith('rtdb://')) {
    return product.image
  }
  
  // Check cache
  if (imageCache.has(product.id)) {
    return imageCache.get(product.id)!
  }
  
  // Return placeholder for RTDB images until async load completes
  return '/assets/products/placeholder.jpg'
}

/**
 * Clear image cache (useful when updating products)
 */
export const clearImageCache = (productId?: string) => {
  if (productId) {
    imageCache.delete(productId)
  } else {
    imageCache.clear()
  }
}

