import { ref, set, get, push, remove, update, onValue, off, DataSnapshot } from 'firebase/database'
import { rtdb } from '../FirebaseConfig'
import type { Product } from '../data/products'
import { rateLimiter } from '../utils/rateLimiter'

// Database paths
const DB_PATHS = {
    products: 'products',
    orders: 'orders',
    carts: 'carts',
    users: 'users',
    stats: 'stats',
    categories: 'categories',
    images: 'images',
    banners: 'banners',
    storeSettings: 'storeSettings',
}

// ==================== PRODUCTS ====================
export const productsService = {
    // Get all products
    getAll: async (): Promise<Product[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.products))
        if (!snapshot.exists()) return []

        const products: Product[] = []
        snapshot.forEach((child) => {
            products.push({ id: child.key!, ...child.val() } as Product)
        })

        return products.sort((a, b) => a.name.localeCompare(b.name))
    },

    // Get product by ID
    getById: async (id: string): Promise<Product | null> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, `${DB_PATHS.products}/${id}`))
        if (!snapshot.exists()) return null

        return { id, ...snapshot.val() } as Product
    },

    // Create product
    create: async (product: Omit<Product, 'id'>): Promise<string> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('product:create')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Maximum ${rateCheck.remaining === 0 ? 'requests reached' : `${rateCheck.remaining} requests remaining`}. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) {
            throw new Error('Realtime Database is not configured')
        }

        try {
            const newProductRef = push(ref(rtdb, DB_PATHS.products))
            await set(newProductRef, product)
            const productId = newProductRef.key!
            
            // Record successful request
            rateLimiter.recordRequest('product:create')
            
            return productId
        } catch (error: any) {
            // Provide helpful error messages
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('Permission denied')
            } else if (error.code === 'UNAVAILABLE') {
                throw new Error('Database unavailable')
            } else {
                throw new Error('Failed to create product')
            }
        }
    },

    // Update product
    update: async (id: string, product: Partial<Product>): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('product:update')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) {
            throw new Error('Realtime Database is not configured')
        }

        try {
            const updates: any = {}
            Object.keys(product).forEach((key) => {
                if (key !== 'id' && product[key as keyof Product] !== undefined) {
                    updates[key] = product[key as keyof Product]
                }
            })

            if (Object.keys(updates).length === 0) {
                throw new Error('No fields to update')
            }

            await update(ref(rtdb, `${DB_PATHS.products}/${id}`), updates)
            
            // Record successful request
            rateLimiter.recordRequest('product:update')
            
            // Product updated successfully
        } catch (error: any) {
            // Error updating product
            throw new Error(`Failed to update product: ${error.message || 'Unknown error'}`)
        }
    },

    // Delete product
    delete: async (id: string): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('product:delete')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) throw new Error('Realtime Database is not configured')
        await remove(ref(rtdb, `${DB_PATHS.products}/${id}`))
        
        // Record successful request
        rateLimiter.recordRequest('product:delete')
    },

    // Subscribe to products changes
    subscribe: (callback: (products: Product[]) => void): (() => void) => {
        if (!rtdb) {
            // Realtime Database is not configured
            return () => { }
        }

        const productsRef = ref(rtdb, DB_PATHS.products)

        const handleSnapshot = (snapshot: DataSnapshot) => {
            const products: Product[] = []
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    products.push({ id: child.key!, ...child.val() } as Product)
                })
            }
            callback(products.sort((a, b) => a.name.localeCompare(b.name)))
        }

        onValue(productsRef, handleSnapshot)

        // Return unsubscribe function
        return () => off(productsRef)
    },
}

// ==================== ORDERS ====================
export interface Order {
    id: string
    userId: string
    orderNumber: string
    items: Array<{
        productId: string
        productName: string
        quantity: number
        price: number
    }>
    subtotal: number
    tax?: number
    shipping: number
    total: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    customerInfo: {
        fullName: string
        email: string
        phone: string
        address: string
        region: string
        gpsCode: string
    }
    paymentMethod: string
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
    paymentReference?: string
    trackingNumber?: string
    trackingUrl?: string
    trackingCarrier?: string
    createdAt: number
    updatedAt: number
}

export const ordersService = {
    // Create order
    create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        // Rate limiting check - Very strict for orders
        const rateCheck = rateLimiter.checkLimit('order:create', order.userId)
        if (!rateCheck.allowed) {
            const error = new Error(
                `Order creation rate limit exceeded. Maximum ${rateCheck.remaining === 0 ? 'orders reached' : `${rateCheck.remaining} orders remaining`}. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) throw new Error('Realtime Database is not configured')

        const orderNumber = `ORD-${Date.now()}`
        const now = Date.now()

        const newOrderRef = push(ref(rtdb, DB_PATHS.orders))
        const orderData = {
            ...order,
            orderNumber,
            createdAt: now,
            updatedAt: now,
        }

        await set(newOrderRef, orderData)

        // Reduce stock for each product in the order
        try {
            for (const item of order.items) {
                const productSnapshot = await get(ref(rtdb, `${DB_PATHS.products}/${item.productId}`))
                if (productSnapshot.exists()) {
                    const product = productSnapshot.val() as Product
                    const currentStock = product.stock ?? 0
                    const newStock = Math.max(0, currentStock - item.quantity)
                    
                    await update(ref(rtdb, `${DB_PATHS.products}/${item.productId}`), {
                        stock: newStock,
                    })
                    // Reduced stock for product
                }
            }
        } catch (error: any) {
            // Error reducing stock
            // Don't throw - order is already created, just log the error
        }

        // Update stats
        await statsService.incrementOrderCount()
        await statsService.addRevenue(order.total)

        // Record successful request
        rateLimiter.recordRequest('order:create', order.userId)

        return newOrderRef.key!
    },

    // Get all orders
    getAll: async (): Promise<Order[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.orders))
        if (!snapshot.exists()) return []

        const orders: Order[] = []
        snapshot.forEach((child) => {
            orders.push({ id: child.key!, ...child.val() } as Order)
        })

        return orders.sort((a, b) => b.createdAt - a.createdAt)
    },

    // Get orders by user ID
    getByUserId: async (userId: string): Promise<Order[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.orders))
        if (!snapshot.exists()) return []

        const orders: Order[] = []
        snapshot.forEach((child) => {
            const order = { id: child.key!, ...child.val() } as Order
            if (order.userId === userId) {
                orders.push(order)
            }
        })

        return orders.sort((a, b) => b.createdAt - a.createdAt)
    },

    // Get order by ID
    getById: async (id: string): Promise<Order | null> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, `${DB_PATHS.orders}/${id}`))
        if (!snapshot.exists()) return null

        return { id, ...snapshot.val() } as Order
    },

    // Get order by order number or tracking number
    getByOrderNumberOrTracking: async (searchTerm: string): Promise<Order | null> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.orders))
        if (!snapshot.exists()) return null

        let foundOrder: Order | null = null
        snapshot.forEach((child) => {
            const order = { id: child.key!, ...child.val() } as Order
            // Check if order number or tracking number matches (case-insensitive)
            if (
                order.orderNumber.toLowerCase() === searchTerm.toLowerCase() ||
                (order.trackingNumber && order.trackingNumber.toLowerCase() === searchTerm.toLowerCase())
            ) {
                foundOrder = order
            }
        })

        return foundOrder
    },

    // Update order status
    updateStatus: async (id: string, status: Order['status']): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('order:update')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) throw new Error('Realtime Database is not configured')

        await update(ref(rtdb, `${DB_PATHS.orders}/${id}`), {
            status,
            updatedAt: Date.now(),
        })
        
        // Record successful request
        rateLimiter.recordRequest('order:update')
    },

    // Update order tracking information
    updateTracking: async (id: string, tracking: {
        trackingNumber?: string
        trackingUrl?: string
        trackingCarrier?: string
    }): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        await update(ref(rtdb, `${DB_PATHS.orders}/${id}`), {
            ...tracking,
            updatedAt: Date.now(),
        })
    },

    // Update payment reference
    updatePaymentReference: async (id: string, paymentReference: string): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        await update(ref(rtdb, `${DB_PATHS.orders}/${id}`), {
            paymentReference,
            updatedAt: Date.now(),
        })
    },

    // Update payment status
    updatePaymentStatus: async (id: string, status: 'pending' | 'paid' | 'failed' | 'refunded', reference?: string): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const updates: any = {
            paymentStatus: status,
            updatedAt: Date.now(),
        }

        if (reference) {
            updates.paymentReference = reference
        }

        // If payment is successful, update order status to processing
        if (status === 'paid') {
            updates.status = 'processing'
        }

        await update(ref(rtdb, `${DB_PATHS.orders}/${id}`), updates)
    },

    // Subscribe to orders changes
    subscribe: (callback: (orders: Order[]) => void): (() => void) => {
        if (!rtdb) {
            // Realtime Database is not configured
            return () => { }
        }

        const ordersRef = ref(rtdb, DB_PATHS.orders)

        const handleSnapshot = (snapshot: DataSnapshot) => {
            const orders: Order[] = []
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    orders.push({ id: child.key!, ...child.val() } as Order)
                })
            }
            callback(orders.sort((a, b) => b.createdAt - a.createdAt))
        }

        onValue(ordersRef, handleSnapshot)

        return () => off(ordersRef)
    },
}

// ==================== CARTS ====================
export interface CartItem {
    product: Product
    quantity: number
}

export const cartsService = {
    // Get user cart
    get: async (userId: string): Promise<CartItem[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, `${DB_PATHS.carts}/${userId}`))
        if (!snapshot.exists()) return []

        return snapshot.val() || []
    },

    // Save user cart
    save: async (userId: string, items: CartItem[]): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        await set(ref(rtdb, `${DB_PATHS.carts}/${userId}`), items)
    },

    // Clear user cart
    clear: async (userId: string): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        await remove(ref(rtdb, `${DB_PATHS.carts}/${userId}`))
    },
}

// ==================== STATS ====================
export interface Stats {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
}

export const statsService = {
    // Get stats
    get: async (): Promise<Stats> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.stats))
        if (!snapshot.exists()) {
            // Initialize stats if they don't exist
            const initialStats: Stats = {
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
            }
            await set(ref(rtdb, DB_PATHS.stats), initialStats)
            return initialStats
        }

        return snapshot.val() as Stats
    },

    // Increment order count
    incrementOrderCount: async (): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const stats = await statsService.get()
        await update(ref(rtdb, DB_PATHS.stats), {
            totalOrders: stats.totalOrders + 1,
        })
    },

    // Add revenue
    addRevenue: async (amount: number): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const stats = await statsService.get()
        await update(ref(rtdb, DB_PATHS.stats), {
            totalRevenue: stats.totalRevenue + amount,
        })
    },

    // Update product count
    updateProductCount: async (count: number): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        await update(ref(rtdb, DB_PATHS.stats), {
            totalProducts: count,
        })
    },

    // Reset stats
    reset: async (): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        await set(ref(rtdb, DB_PATHS.stats), {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
        })
    },

    // Subscribe to stats changes
    subscribe: (callback: (stats: Stats) => void): (() => void) => {
        if (!rtdb) {
            // Realtime Database is not configured
            return () => { }
        }

        const statsRef = ref(rtdb, DB_PATHS.stats)

        const handleSnapshot = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as Stats)
            } else {
                callback({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 })
            }
        }

        onValue(statsRef, handleSnapshot)

        return () => off(statsRef)
    },
}

// ==================== IMAGES ====================
export const imagesService = {
    // Convert file to base64
    fileToBase64: (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result as string
                resolve(result)
            }
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
        })
    },

    // Save image to RTDB
    save: async (productId: string, imageData: string): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        
        await set(ref(rtdb, `${DB_PATHS.images}/${productId}`), {
            data: imageData,
            createdAt: Date.now(),
        })
    },

    // Get image from RTDB
    get: async (productId: string): Promise<string | null> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        
        const snapshot = await get(ref(rtdb, `${DB_PATHS.images}/${productId}`))
        if (!snapshot.exists()) return null
        
        const data = snapshot.val()
        return data?.data || null
    },

    // Delete image from RTDB
    delete: async (productId: string): Promise<void> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')
        await remove(ref(rtdb, `${DB_PATHS.images}/${productId}`))
    },
}

// ==================== BANNERS ====================
export interface Banner {
    id: string
    imageUrl: string
    linkUrl?: string
    order: number
    active: boolean
    createdAt: number
}

export const bannersService = {
    // Get all banners
    getAll: async (): Promise<Banner[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.banners))
        if (!snapshot.exists()) return []

        const banners: Banner[] = []
        snapshot.forEach((child) => {
            banners.push({ id: child.key!, ...child.val() } as Banner)
        })

        return banners
            .filter((b) => b.active)
            .sort((a, b) => a.order - b.order)
    },

    // Get all banners (including inactive) for admin
    getAllForAdmin: async (): Promise<Banner[]> => {
        if (!rtdb) throw new Error('Realtime Database is not configured')

        const snapshot = await get(ref(rtdb, DB_PATHS.banners))
        if (!snapshot.exists()) return []

        const banners: Banner[] = []
        snapshot.forEach((child) => {
            banners.push({ id: child.key!, ...child.val() } as Banner)
        })

        return banners.sort((a, b) => a.order - b.order)
    },

    // Create a new banner
    create: async (banner: Omit<Banner, 'id' | 'createdAt'>): Promise<string> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('banner:create')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) {
            throw new Error('Realtime Database is not configured')
        }

        try {
            // Creating banner in RTDB
            const newBannerRef = push(ref(rtdb, DB_PATHS.banners))
            const bannerData = {
                imageUrl: banner.imageUrl,
                order: banner.order,
                active: banner.active,
                createdAt: Date.now(),
            }
            await set(newBannerRef, bannerData)
            const bannerId = newBannerRef.key!
            
            // Record successful request
            rateLimiter.recordRequest('banner:create')
            
            // Banner created successfully
            return bannerId
        } catch (error: any) {
            // Error creating banner

            // Provide helpful error messages
            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('Permission denied. Check Firebase security rules allow writes to /banners')
            } else if (error.code === 'UNAVAILABLE') {
                throw new Error('Database unavailable. Check your internet connection and Firebase project status.')
            } else {
                throw new Error(`Failed to create banner: ${error.message || 'Unknown error'}`)
            }
        }
    },

    // Update a banner
    update: async (id: string, updates: Partial<Banner>): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('banner:update')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) {
            throw new Error('Realtime Database is not configured')
        }

        try {
            const updateData: any = {}
            Object.keys(updates).forEach((key) => {
                if (updates[key as keyof Banner] !== undefined) {
                    updateData[key] = updates[key as keyof Banner]
                }
            })

            if (Object.keys(updateData).length === 0) {
                throw new Error('No fields to update')
            }

            // Updating banner
            await update(ref(rtdb, `${DB_PATHS.banners}/${id}`), updateData)
            
            // Record successful request
            rateLimiter.recordRequest('banner:update')
            
            // Banner updated successfully
        } catch (error: any) {
            // Error updating banner

            if (error.code === 'PERMISSION_DENIED') {
                throw new Error('Permission denied. Check Firebase security rules allow writes to /banners')
            } else if (error.code === 'UNAVAILABLE') {
                throw new Error('Database unavailable. Check your internet connection and Firebase project status.')
            } else {
                throw new Error(`Failed to update banner: ${error.message || 'Unknown error'}`)
            }
        }
    },

    // Delete a banner
    delete: async (id: string): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('banner:delete')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) throw new Error('Realtime Database is not configured')
        await remove(ref(rtdb, `${DB_PATHS.banners}/${id}`))
        
        // Record successful request
        rateLimiter.recordRequest('banner:delete')
    },

    // Subscribe to banners changes
    subscribe: (callback: (banners: Banner[]) => void): (() => void) => {
        if (!rtdb) {
            // Realtime Database is not configured
            return () => {}
        }

        const bannersRef = ref(rtdb, DB_PATHS.banners)
        const listener = (snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                callback([])
                return
            }

            const banners: Banner[] = []
            snapshot.forEach((child) => {
                banners.push({ id: child.key!, ...child.val() } as Banner)
            })

            const activeBanners = banners
                .filter((b) => b.active)
                .sort((a, b) => a.order - b.order)
            callback(activeBanners)
        }

        onValue(bannersRef, listener)
        return () => off(bannersRef, listener)
    },
}

// ==================== STORE SETTINGS ====================
export interface StoreSettings {
    storeName?: string
    storeEmail?: string
    taxRate?: number
    shippingCost?: number
}

export const storeSettingsService = {
    // Get store settings
    get: async (): Promise<StoreSettings> => {
        if (!rtdb) {
            // Realtime Database is not configured, returning default settings
            return {
                storeName: 'AXIS STORE',
                storeEmail: 'admin@axisstore.com',
                taxRate: 0,
                shippingCost: 15,
            }
        }

        try {
            const snapshot = await get(ref(rtdb, DB_PATHS.storeSettings))
            if (!snapshot.exists()) {
                // Return defaults
                return {
                    storeName: 'AXIS STORE',
                    storeEmail: 'admin@axisstore.com',
                    taxRate: 0,
                    shippingCost: 15,
                }
            }

            const data = snapshot.val() as StoreSettings
            return data || {
                storeName: 'AXIS STORE',
                storeEmail: 'admin@axisstore.com',
                taxRate: 0,
                shippingCost: 15,
            }
        } catch (error) {
            // Error getting store settings
            // Return defaults on error
            return {
                storeName: 'AXIS STORE',
                storeEmail: 'admin@axisstore.com',
                taxRate: 0,
                shippingCost: 15,
            }
        }
    },

    // Update store settings
    update: async (settings: Partial<StoreSettings>): Promise<void> => {
        // Rate limiting check
        const rateCheck = rateLimiter.checkLimit('settings:update')
        if (!rateCheck.allowed) {
            const error = new Error(
                `Rate limit exceeded. Please try again in ${rateCheck.retryAfter || 0} seconds.`
            ) as any
            error.code = 'RATE_LIMIT_EXCEEDED'
            error.retryAfter = rateCheck.retryAfter
            throw error
        }

        if (!rtdb) throw new Error('Realtime Database is not configured')

        await update(ref(rtdb, DB_PATHS.storeSettings), {
            ...settings,
            updatedAt: Date.now(),
        })
        
        // Record successful request
        rateLimiter.recordRequest('settings:update')
    },

    // Subscribe to settings changes
    subscribe: (callback: (settings: StoreSettings) => void): (() => void) => {
        if (!rtdb) {
            // Realtime Database is not configured
            return () => {}
        }

        const settingsRef = ref(rtdb, DB_PATHS.storeSettings)

        const listener = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val() as StoreSettings)
            } else {
                // Return defaults if no settings exist
                callback({
                    storeName: 'AXIS STORE',
                    storeEmail: 'admin@axisstore.com',
                    taxRate: 0,
                    shippingCost: 15,
                })
            }
        }

        onValue(settingsRef, listener)
        return () => off(settingsRef, listener)
    },
}

