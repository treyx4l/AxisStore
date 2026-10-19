import { Box, Button, Typography, Chip } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import VisibilityIcon from '@mui/icons-material/Visibility'
import type { Product } from '../data/products'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onProductClick?: (product: Product) => void
}

export const ProductCard = ({ product, onAddToCart, onProductClick }: ProductCardProps) => {
  const isOutOfStock = product.stock === undefined || product.stock === 0

  return (
    <Box
      sx={(t) => ({
        width: '100%',
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: t.palette.mode === 'dark' ? '#111' : '#fff',
        borderRadius: 3,
        cursor: onProductClick ? 'pointer' : 'default',
        transition: 'all 0.22s ease',
        '&:hover': onProductClick
          ? {
              borderColor: 'rgba(200,16,46,0.4)',
              boxShadow:
                t.palette.mode === 'dark'
                  ? '0 8px 32px rgba(200,16,46,0.12)'
                  : '0 8px 32px rgba(0,0,0,0.12)',
              transform: 'translateY(-3px)',
            }
          : {},
      })}
      onClick={() => onProductClick && onProductClick(product)}
    >
      {/* Image */}
      <Box
        sx={(t) => ({
          width: '100%',
          aspectRatio: '4/3',
          overflow: 'hidden',
          bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        })}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            maxWidth: '85%',
            maxHeight: '85%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/products/placeholder.jpg'
          }}
        />
        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(200,16,46,0.9)',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              px: 0.8,
              py: 0.3,
              borderRadius: 1,
              letterSpacing: '0.06em',
              backdropFilter: 'blur(4px)',
            }}
          >
            OUT OF STOCK
          </Box>
        )}
        {!isOutOfStock && product.stock !== undefined && product.stock <= 5 && (
          <Chip
            label={`Only ${product.stock} left`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              height: 20,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: 'rgba(245,158,11,0.9)',
              color: '#000',
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '0.82rem', md: '0.875rem' },
            fontWeight: 600,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {product.name}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 800,
            color: '#C8102E',
            textAlign: 'center',
          }}
        >
          GH₵{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: { xs: 1.5, md: 2 },
          pb: { xs: 1.5, md: 2 },
          display: 'flex',
          gap: 1,
        }}
      >
        {onProductClick && (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation()
              onProductClick(product)
            }}
            sx={{
              minWidth: 0,
              px: 1,
              flexShrink: 0,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: '#C8102E', color: '#C8102E' },
            }}
            aria-label="View details"
          >
            <VisibilityIcon fontSize="small" />
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
          disabled={isOutOfStock}
          fullWidth
          sx={{
            fontSize: { xs: '0.72rem', md: '0.75rem' },
            background: 'linear-gradient(135deg, #C8102E 0%, #a00e25 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #e03050 0%, #C8102E 100%)' },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'text.disabled',
            },
          }}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </Box>
    </Box>
  )
}
