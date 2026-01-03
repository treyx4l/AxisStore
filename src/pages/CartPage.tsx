import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Button,
  IconButton,
  TextField,
  Paper,
  Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { AuthDialog } from '../components/AuthDialog'
import { useState } from 'react'
import { useStoreSettings } from '../hooks/useStoreSettings'

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()
  const { user } = useFirebaseAuth()
  const navigate = useNavigate()
  const { settings } = useStoreSettings()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  // Calculate totals with tax and shipping
  const taxRate = settings.taxRate || 0
  const shippingCost = settings.shippingCost || 15
  const subtotal = totalPrice
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax + shippingCost

  const handleCheckout = () => {
    if (!user) {
      setAuthDialogOpen(true)
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center">
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add some products to get started!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            {items.map((item) => (
              <Card key={item.product.id}>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <CardMedia
                      component="img"
                      image={item.product.image}
                      alt={item.product.name}
                      sx={{ width: { xs: '100%', sm: 120 }, height: 120, objectFit: 'cover', borderRadius: 0 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/products/placeholder.jpg'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.product.description}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1
                              updateQuantity(item.product.id, qty)
                            }}
                            inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                            type="number"
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                        <Typography variant="h6" color="primary" sx={{ flex: 1, textAlign: 'right' }}>
                          GH₵{(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 350 } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Subtotal ({totalItems} items)</Typography>
                <Typography>GH₵{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Stack>
              {tax > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Tax ({taxRate}%)</Typography>
                  <Typography>GH₵{tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between">
                <Typography>Shipping</Typography>
                <Typography>GH₵{shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  GH₵{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
            </Stack>
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Box>
      </Stack>
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode="login"
      />
    </Container>
  )
}

