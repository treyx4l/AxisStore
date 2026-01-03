import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { Product } from '../data/products';

interface ProductDetailModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal = ({
  open,
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Use multiple images if available, otherwise fall back to single image
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = product.stock !== undefined && product.stock > 0 ? product.stock : 999;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const isOutOfStock = product.stock === undefined || product.stock === 0;
  const maxQuantity = product.stock !== undefined && product.stock > 0 ? product.stock : 999;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700}>
            {product.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
          {/* Image Section */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              position: 'relative',
              minHeight: { xs: 300, md: 400 },
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e0e0e0',
            }}
          >
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/products/placeholder.jpg';
              }}
            />

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePreviousImage}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}

            {/* Image Dots Indicator */}
            {images.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {images.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: 0,
                      bgcolor: index === currentImageIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: index === currentImageIndex ? 'primary.dark' : 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Out of Stock Badge */}
            {isOutOfStock && (
              <Chip
                label="Out of Stock"
                color="error"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                }}
              />
            )}
          </Box>

          {/* Product Details Section */}
          <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2}>
              {/* Price */}
              <Typography variant="h4" fontWeight={700} color="primary.main">
                GH₵{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>

              {/* Condition */}
              {product.condition && (
                <Chip
                  label={product.condition === 'brand-new' ? 'Brand New' : 'Refurbished'}
                  color={product.condition === 'brand-new' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ width: 'fit-content' }}
                />
              )}

              {/* Stock */}
              <Typography variant="body2" color="text.secondary">
                Stock: {product.stock !== undefined ? product.stock : 0} available
              </Typography>

              <Divider />

              {/* Description */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </Typography>
              </Box>

              <Divider />

              {/* Quantity Selector */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Quantity
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    size="small"
                    sx={{ border: '1px solid #e0e0e0' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      handleQuantityChange(val);
                    }}
                    inputProps={{
                      min: 1,
                      max: maxQuantity,
                      style: { textAlign: 'center', width: 80 },
                    }}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                    size="small"
                    sx={{ border: '1px solid #e0e0e0' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0 }}>
          Close
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          disabled={isOutOfStock}
          sx={{ borderRadius: 0 }}
        >
          Add to Cart ({quantity})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

