import { useParams, Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  Paper,
  Slider,
  Pagination,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { categories, type CategoryId } from '../data/products'
import { useProducts } from '../context/ProductsContext'
import { AuthDialog } from '../components/AuthDialog'
import { useCart } from '../context/CartContext'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { ProductGrid } from '../components/ProductGrid'
import { ProductDetailModal } from '../components/ProductDetailModal'
import { useState, useMemo, useEffect } from 'react'
import type { Product, ProductCondition } from '../data/products'
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox } from '@mui/material'

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: CategoryId }>()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [conditionFilter, setConditionFilter] = useState<ProductCondition | 'all'>('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const { addToCart } = useCart()
  const { user } = useFirebaseAuth()
  const { products, loading: productsLoading } = useProducts()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const productsPerPage = isMobile ? 8 : 12

  const category = categories.find((c) => c.id === categoryId)
  const allCategoryProducts = categoryId
    ? products.filter((p) => p.category === categoryId)
    : []

  // Calculate price range from products
  const priceBounds = useMemo(() => {
    if (allCategoryProducts.length === 0) return [0, 10000]
    const prices = allCategoryProducts.map((p) => p.price)
    if (prices.length === 0) return [0, 10000]
    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))
    return min === max ? [0, Math.max(10000, max)] : [min, max]
  }, [allCategoryProducts])

  // Initialize price range - start with a wide range to show all products initially
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  // Reset filters when category changes
  useEffect(() => {
    setConditionFilter('all')
    setInStockOnly(false)
    setPage(1)
  }, [categoryId])

  // Update price range when category or products change
  useEffect(() => {
    if (allCategoryProducts.length > 0 && !productsLoading) {
      const prices = allCategoryProducts.map((p) => p.price)
      if (prices.length > 0) {
        const min = Math.max(0, Math.floor(Math.min(...prices)))
        const max = Math.ceil(Math.max(...prices))
        // Ensure max is at least min + 1 to avoid slider issues
        const newMax = max <= min ? min + 1000 : max
        const newRange: [number, number] = [min, newMax]
        // Always update to ensure products are visible
        setPriceRange(newRange)
      }
    } else if (allCategoryProducts.length === 0 && !productsLoading) {
      // Reset to default when no products
      setPriceRange([0, 10000])
    }
  }, [categoryId, allCategoryProducts.length, productsLoading])

  // Filter products by price range, condition, and stock
  const filteredProducts = useMemo(() => {
    if (allCategoryProducts.length === 0) return []
    return allCategoryProducts.filter((p) => {
      // Price filter
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1]
      if (!priceMatch) return false

      // Condition filter
      if (conditionFilter !== 'all') {
        if (p.condition !== conditionFilter) return false
      }

      // Stock filter
      if (inStockOnly) {
        if (p.stock === undefined || p.stock === 0) return false
      }

      return true
    })
  }, [allCategoryProducts, priceRange, conditionFilter, inStockOnly])

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, page, productsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Reset to first page when filters change
  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number])
    setPage(1)
  }

  const handleConditionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConditionFilter(event.target.value as ProductCondition | 'all')
    setPage(1)
  }

  const handleInStockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInStockOnly(event.target.checked)
    setPage(1)
  }

  if (!category) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4">Category not found</Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Return to Home
        </Button>
      </Container>
    )
  }

  return (
    <Box>
      <Box
        sx={(theme) => ({
          py: { xs: 3, md: 6 },
          background: theme.palette.mode === 'light'
            ? `radial-gradient(circle at top left, rgba(34, 112, 176, 0.15), transparent 55%), radial-gradient(circle at top right, rgba(226, 98, 162, 0.1), transparent 50%)`
            : `radial-gradient(circle at top left, rgba(34, 112, 176, 0.2), transparent 55%), radial-gradient(circle at top right, rgba(226, 98, 162, 0.15), transparent 50%)`,
        })}
      >
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              {category.label}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        {productsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : allCategoryProducts.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              No products found in this category
            </Typography>
            <Button component={Link} to="/" variant="contained">
              Browse All Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Filters Sidebar */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 0,
                  border: '1px solid #e0e0e0',
                  position: { md: 'sticky' },
                  top: { md: 20 },
                }}
              >
                <Stack spacing={3}>
                  <Typography variant="h6" fontWeight={700}>
                    Filters
                  </Typography>
                  
                  {/* Price Filter */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Price Range
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `GH₵${value.toFixed(2)}`}
                      sx={{ mt: 2 }}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="Min"
                        type="number"
                        size="small"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Math.max(priceBounds[0], Math.min(priceRange[1], Number(e.target.value)))
                          setPriceRange([val, priceRange[1]])
                          setPage(1)
                        }}
                        inputProps={{ min: priceBounds[0], max: priceRange[1] }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Max"
                        type="number"
                        size="small"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Math.min(priceBounds[1], Math.max(priceRange[0], Number(e.target.value)))
                          setPriceRange([priceRange[0], val])
                          setPage(1)
                        }}
                        inputProps={{ min: priceRange[0], max: priceBounds[1] }}
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                  </Box>

                  {/* Condition Filter */}
                  <Box>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                        Condition
                      </FormLabel>
                      <RadioGroup
                        value={conditionFilter}
                        onChange={handleConditionChange}
                      >
                        <FormControlLabel value="all" control={<Radio />} label="All" />
                        <FormControlLabel value="brand-new" control={<Radio />} label="Brand New" />
                        <FormControlLabel value="refurbished" control={<Radio />} label="Refurbished" />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Stock Filter */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={inStockOnly}
                          onChange={handleInStockChange}
                        />
                      }
                      label="Available (In Stock)"
                    />
                  </Box>

                  {/* Results Count */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Showing {paginatedProducts.length} of {filteredProducts.length} products
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Products Grid */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Stack spacing={3}>
                {filteredProducts.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary" mb={2}>
                      No products found matching your filters
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setPriceRange([priceBounds[0], priceBounds[1]])
                        setPage(1)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                ) : (
                  <>
                    <ProductGrid
                      products={paginatedProducts}
                      onProductClick={(product) => {
                        setSelectedProduct(product)
                        setProductModalOpen(true)
                      }}
                      onAddToCart={(product) => {
                        if (!user) {
                          setAuthDialogOpen(true)
                          return
                        }
                        addToCart(product)
                        setShowCartSuccess(true)
                      }}
                    />
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={(_event, value) => setPage(value)}
                          color="primary"
                          size={isMobile ? 'small' : 'medium'}
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>

      <Snackbar
        open={showCartSuccess}
        autoHideDuration={3000}
        onClose={() => setShowCartSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowCartSuccess(false)}>
          Item added to cart!
        </Alert>
      </Snackbar>

      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode="login"
      />

      <ProductDetailModal
        open={productModalOpen}
        product={selectedProduct}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onAddToCart={(product, quantity) => {
          if (!user) {
            setAuthDialogOpen(true)
            setProductModalOpen(false)
            return
          }
          addToCart(product, quantity)
          setShowCartSuccess(true)
        }}
      />
    </Box>
  )
}

