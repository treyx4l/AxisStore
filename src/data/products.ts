export type CategoryId =
  | 'laptops'
  | 'desktops'
  | 'all-in-one'
  | 'others'
  | 'softwares'

export type ProductCondition = 'brand-new' | 'refurbished'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: CategoryId
  image: string // Primary image (for backward compatibility and product cards)
  images?: string[] // Multiple images for product modal
  isSoftware?: boolean
  stock?: number
  condition?: ProductCondition
}

export const categories: { id: CategoryId; label: string }[] = [
  { id: 'laptops', label: 'Laptops' },
  { id: 'desktops', label: 'Desktops' },
  { id: 'all-in-one', label: 'All in One Computers' },
  { id: 'others', label: 'Others' },
  { id: 'softwares', label: 'Softwares' },
]

// Products are now loaded from Firestore via ProductsContext
// This empty array is kept for type compatibility but should not be used
export const products: Product[] = []


