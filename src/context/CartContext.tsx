import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { cartsService } from '../services/rtdbService'
import { useFirebaseAuth } from './FirebaseAuthContext'
import { useNotification } from './NotificationContext'
import { rateLimiter } from '../utils/rateLimiter'
import type { Product } from '../data/products'

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  loading: boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  loading: false,
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useFirebaseAuth()
  const { showNotification } = useNotification()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from RTDB when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setItems([])
        setLoading(false)
        return
      }

      try {
        const cartItems = await cartsService.get(user.uid)
        setItems(cartItems)
      } catch (error) {
        showNotification('Something went wrong. Please try again later.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to RTDB whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (!user || loading) return

      try {
        await cartsService.save(user.uid, items)
      } catch (error) {
        showNotification('Something went wrong. Please try again later.', 'error')
      }
    }

    saveCart()
  }, [items, user, loading])

  const addToCart = (product: Product, quantity: number = 1) => {
    // Rate limiting check
    const rateCheck = rateLimiter.checkLimit('cart:add', user?.uid)
    if (!rateCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${rateCheck.retryAfter || 0} seconds before trying again.`,
        'warning'
      )
      const error = new Error(
        `Cart operation rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
      ) as any
      error.code = 'RATE_LIMIT_EXCEEDED'
      error.retryAfter = rateCheck.retryAfter
      throw error
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { product, quantity }]
    })
    
    // Record successful request
    rateLimiter.recordRequest('cart:add', user?.uid)
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    // Rate limiting check
    const rateCheck = rateLimiter.checkLimit('cart:update', user?.uid)
    if (!rateCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${rateCheck.retryAfter || 0} seconds before trying again.`,
        'warning'
      )
      const error = new Error(
        `Cart operation rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
      ) as any
      error.code = 'RATE_LIMIT_EXCEEDED'
      error.retryAfter = rateCheck.retryAfter
      throw error
    }

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
    
    // Record successful request
    rateLimiter.recordRequest('cart:update', user?.uid)
  }

  const clearCart = async () => {
    // Rate limiting check
    const rateCheck = rateLimiter.checkLimit('cart:clear', user?.uid)
    if (!rateCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${rateCheck.retryAfter || 0} seconds before trying again.`,
        'warning'
      )
      const error = new Error(
        `Cart operation rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
      ) as any
      error.code = 'RATE_LIMIT_EXCEEDED'
      error.retryAfter = rateCheck.retryAfter
      throw error
    }

    setItems([])
    if (user) {
      try {
        await cartsService.clear(user.uid)
        // Record successful request
        rateLimiter.recordRequest('cart:clear', user?.uid)
      } catch (error) {
        showNotification('Something went wrong. Please try again later.', 'error')
      }
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

