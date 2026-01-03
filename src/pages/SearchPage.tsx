import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useProducts } from '../context/ProductsContext'
import { ProductGrid } from '../components/ProductGrid'
import { ProductDetailModal } from '../components/ProductDetailModal'
import { useCart } from '../context/CartContext'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { AuthDialog } from '../components/AuthDialog'
import { Snackbar } from '@mui/material'
import { rateLimiter } from '../utils/rateLimiter'
import { useNotification } from '../context/NotificationContext'

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(query)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const { products, loading: productsLoading } = useProducts()
  const { addToCart } = useCart()
  const { user } = useFirebaseAuth()
  const { showNotification } = useNotification()

  // Update search term when URL query changes
  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  // Check rate limit when query changes
  useEffect(() => {
    if (!query.trim()) return

    const rateCheck = rateLimiter.checkLimit('search:query', user?.uid)
    if (!rateCheck.allowed) {
      showNotification(
        `Rate limit exceeded. Please wait ${rateCheck.retryAfter || 0} seconds before trying again.`,
        'warning'
      )
    }
  }, [query, user?.uid, showNotification])

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return []

    // Rate limiting check for search operations
    const rateCheck = rateLimiter.checkLimit('search:query', user?.uid)
    if (!rateCheck.allowed) {
      // Return empty results instead of throwing to avoid breaking UI
      return []
    }

    const searchLower = query.toLowerCase().trim()
    const results = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower)
      const descriptionMatch = product.description.toLowerCase().includes(searchLower)
      const categoryMatch = product.category.toLowerCase().includes(searchLower)
      return nameMatch || descriptionMatch || categoryMatch
    })
    
    // Record successful search
    rateLimiter.recordRequest('search:query', user?.uid)
    
    return results
  }, [products, query, user?.uid])

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setProductModalOpen(true)
  }

  const handleAddToCart = (product: any) => {
    if (!user) {
      setAuthDialogOpen(true)
      return
    }
    addToCart(product)
    setShowCartSuccess(true)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Search Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Search Products
          </Typography>
          <TextField
            fullWidth
            placeholder="Search products by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Loading State */}
        {productsLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Search Query */}
        {!query.trim() && !productsLoading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Search for Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a search term above to find products
            </Typography>
          </Box>
        )}

        {/* Search Results */}
        {query.trim() && !productsLoading && (
          <>
            <Typography variant="h6" color="text.secondary">
              {filteredProducts.length === 0
                ? 'No products found'
                : `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${query}"`}
            </Typography>

            {filteredProducts.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                No products match your search. Try different keywords or browse our categories.
              </Alert>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            )}
          </>
        )}
      </Stack>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          open={productModalOpen}
          product={selectedProduct}
          onClose={() => {
            setProductModalOpen(false)
            setSelectedProduct(null)
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode="signup"
      />

      {/* Success Snackbar */}
      <Snackbar
        open={showCartSuccess}
        autoHideDuration={3000}
        onClose={() => setShowCartSuccess(false)}
        message="Product added to cart!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  )
}

