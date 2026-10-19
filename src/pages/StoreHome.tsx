import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Alert,
  Snackbar,
  Grid,
  Chip,
} from '@mui/material'
import { categories } from '../data/products'
import type { CategoryId, Product } from '../data/products'
import { BannerSlider } from '../components/BannerSlider'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { AuthDialog } from '../components/AuthDialog'
import { ProductDetailModal } from '../components/ProductDetailModal'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LaptopIcon from '@mui/icons-material/LaptopMac'
import DesktopIcon from '@mui/icons-material/DesktopWindows'
import AllInOneIcon from '@mui/icons-material/Monitor'
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'
import AppShortcutIcon from '@mui/icons-material/AppShortcut'

interface CategorySectionProps {
  category: { id: CategoryId; label: string }
  products: Product[]
  onAddToCart: (product: Product) => void
  onProductClick?: (product: Product) => void
  isSoftware?: boolean
}

// Category icon map
const categoryIconMap: Record<string, React.ReactNode> = {
  laptops: <LaptopIcon fontSize="small" sx={{ color: '#C8102E' }} />,
  desktops: <DesktopIcon fontSize="small" sx={{ color: '#C8102E' }} />,
  'all-in-one': <AllInOneIcon fontSize="small" sx={{ color: '#C8102E' }} />,
  others: <DevicesOtherIcon fontSize="small" sx={{ color: '#C8102E' }} />,
  softwares: <AppShortcutIcon fontSize="small" sx={{ color: '#C8102E' }} />,
}

// ─── Product Image with Name ──────────────────────────────────────────────────
const ProductImageWithName = ({
  product,
  onClick,
}: {
  product: Product
  onClick?: () => void
}) => {
  return (
    <Box
      onClick={onClick}
      sx={(t) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
        bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              borderColor: 'rgba(200,16,46,0.4)',
              bgcolor: t.palette.mode === 'dark' ? 'rgba(200,16,46,0.05)' : 'rgba(200,16,46,0.04)',
              transform: 'translateY(-2px)',
              boxShadow:
                t.palette.mode === 'dark'
                  ? '0 6px 20px rgba(0,0,0,0.4)'
                  : '0 6px 20px rgba(0,0,0,0.1)',
            }
          : {},
      })}
    >
      {/* Image */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 90, sm: 100, md: 110 },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 1,
          mb: 1,
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/products/placeholder.jpg'
          }}
        />
        {(product.stock === undefined || product.stock === 0) && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(200,16,46,0.85)',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              letterSpacing: '0.05em',
            }}
          >
            OUT OF STOCK
          </Box>
        )}
      </Box>

      {/* Name */}
      <Typography
        sx={{
          fontSize: { xs: '0.7rem', md: '0.75rem' },
          fontWeight: 500,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%',
          lineHeight: 1.4,
          color: 'text.primary',
        }}
      >
        {product.name}
      </Typography>
    </Box>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection = ({
  category,
  products,
  onAddToCart: _onAddToCart,
  onProductClick,
  isSoftware = false,
}: CategorySectionProps) => {
  const displayProducts = products.slice(0, isSoftware ? 6 : 4)

  const header = (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 1.5, md: 2 } }}>
      {categoryIconMap[category.id]}
      <Typography
        variant={isSoftware ? 'h5' : 'h6'}
        fontWeight={700}
        sx={{ fontSize: { xs: '1rem', md: isSoftware ? '1.25rem' : '1.05rem' } }}
      >
        {category.label}
      </Typography>
      <Chip
        label={`${products.length}`}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          bgcolor: 'rgba(200,16,46,0.12)',
          color: '#C8102E',
          fontWeight: 700,
          ml: 'auto !important',
        }}
      />
    </Stack>
  )

  if (isSoftware) {
    return (
      <Box
        sx={(t) => ({
          border: '1px solid',
          borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          bgcolor: t.palette.mode === 'dark' ? '#0f0f0f' : '#fff',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'rgba(200,16,46,0.25)' },
        })}
      >
        {header}
        {displayProducts.length > 0 ? (
          <Grid container spacing={{ xs: 1, md: 1.5 }}>
            {displayProducts.map((product) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={product.id}>
                <ProductImageWithName
                  product={product}
                  onClick={onProductClick ? () => onProductClick(product) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No products in this category yet
          </Typography>
        )}
        <Box sx={{ mt: { xs: 2, md: 2.5 }, display: 'flex', justifyContent: 'center' }}>
          <Button
            component={Link}
            to={`/category/${category.id}`}
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderColor: 'rgba(200,16,46,0.45)',
              color: '#C8102E',
              px: { xs: 2, md: 4 },
              '&:hover': { borderColor: '#C8102E', bgcolor: 'rgba(200,16,46,0.06)' },
            }}
          >
            Discover More
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={(t) => ({
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
        borderRadius: 3,
        p: { xs: 1.5, md: 2 },
        bgcolor: t.palette.mode === 'dark' ? '#0f0f0f' : '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: { xs: 'auto', md: 420 },
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(200,16,46,0.25)' },
      })}
    >
      {header}

      <Grid container spacing={1} sx={{ flex: 1 }}>
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <Grid size={{ xs: 6 }} key={product.id}>
              <ProductImageWithName
                product={product}
                onClick={onProductClick ? () => onProductClick(product) : undefined}
              />
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No products yet
            </Typography>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button
          component={Link}
          to={`/category/${category.id}`}
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{
            borderColor: 'rgba(200,16,46,0.45)',
            color: '#C8102E',
            '&:hover': { borderColor: '#C8102E', bgcolor: 'rgba(200,16,46,0.06)' },
          }}
        >
          View All
        </Button>
      </Box>
    </Box>
  )
}

// ─── StoreHome Page ───────────────────────────────────────────────────────────
export const StoreHome = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const { user } = useFirebaseAuth()
  const { addToCart } = useCart()
  const { products, loading: productsLoading, error: productsError } = useProducts()

  const categoryProducts = useMemo(() => {
    const result: Record<CategoryId, Product[]> = {
      laptops: [],
      desktops: [],
      'all-in-one': [],
      others: [],
      softwares: [],
    }
    products.forEach((product) => {
      if (result[product.category]) result[product.category].push(product)
    })
    return result
  }, [products])

  const regularCategories = categories.filter((c) => c.id !== 'softwares')
  const softwareCategory = categories.find((c) => c.id === 'softwares')

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setProductModalOpen(true)
  }

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setAuthDialogOpen(true)
      return
    }
    addToCart(product)
    setShowCartSuccess(true)
  }

  return (
    <Box id="products">
      {/* Banner */}
      <BannerSlider />

      {/* Products */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        {productsError && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {productsError}
          </Alert>
        )}

        {productsLoading ? (
          <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
            {/* Skeleton loading indicator */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '3px solid rgba(200,16,46,0.15)',
                borderTopColor: '#C8102E',
                animation: 'spin 0.8s linear infinite',
                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Loading products...
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={{ xs: 3, md: 4 }}>
            {/* Section header */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Box sx={{ width: 3, height: 24, bgcolor: '#C8102E', borderRadius: 2 }} />
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: '-0.01em', fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                >
                  Shop by Category
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                Browse our curated selection of premium tech products
              </Typography>
            </Box>

            {/* Regular categories grid */}
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              {regularCategories.map((category) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
                  <CategorySection
                    category={category}
                    products={categoryProducts[category.id]}
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Software category */}
            {softwareCategory && (
              <CategorySection
                category={softwareCategory}
                products={categoryProducts.softwares}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                isSoftware
              />
            )}
          </Stack>
        )}
      </Container>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode="signup"
      />

      {/* Cart success snackbar */}
      <Snackbar
        open={showCartSuccess}
        autoHideDuration={3000}
        onClose={() => setShowCartSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setShowCartSuccess(false)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Item added to cart!
        </Alert>
      </Snackbar>

      {/* Product Detail Modal */}
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
