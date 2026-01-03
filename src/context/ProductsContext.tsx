import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { productsService } from '../services/rtdbService'
import type { Product } from '../data/products'

interface ProductsContextType {
  products: Product[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: true,
  error: null,
  refreshProducts: async () => {},
})

export const useProducts = () => useContext(ProductsContext)

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const productsData = await productsService.getAll()
      setProducts(productsData)
    } catch (err: any) {
      // Error loading products - handled silently
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    
    // Subscribe to real-time updates
    const unsubscribe = productsService.subscribe((productsData) => {
      setProducts(productsData)
      setLoading(false)
      setError(null)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: loadProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

