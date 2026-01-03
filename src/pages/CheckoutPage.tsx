import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  TextField,
  Paper,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import { useCart } from '../context/CartContext'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useNotification } from '../context/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { ordersService, type Order } from '../services/rtdbService'
import { initializePaystack, generatePaymentReference } from '../utils/paystack'
import { useStoreSettings } from '../hooks/useStoreSettings'

export const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useFirebaseAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const { settings } = useStoreSettings()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Calculate totals with tax and shipping
  const taxRate = settings.taxRate || 0
  const shippingCost = settings.shippingCost || 15
  const subtotal = totalPrice
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax + shippingCost

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    region: '',
    gpsCode: '',
  })

  const ghanaRegions = [
    'Greater Accra',
    'Volta Region',
    'Bono Region',
    'Ashanti Region',
    'Central Region',
  ]

  const initializePaystackPayment = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    amount: number,
    email: string,
    fullName: string
  ) => {
    try {
      const amountInPesewas = Math.round(amount * 100) // Convert to pesewas

      // Get Paystack public key from environment
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''

      if (!paystackKey) {
        throw new Error('Paystack public key not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to .env file')
      }

      // Generate a temporary reference for the payment
      const tempRef = generatePaymentReference('temp')

      // Initialize Paystack
      initializePaystack({
        key: paystackKey,
        email: email,
        amount: amountInPesewas,
        ref: tempRef,
        currency: 'GHS', // Use Ghanaian Cedi
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: fullName,
            },
          ],
        },
        callback: async (response: any) => {
          // Payment successful - NOW create the order
          try {
            const orderId = await ordersService.create({
              ...orderData,
              paymentReference: response.reference,
              paymentStatus: 'paid',
              status: 'processing',
            })
            await clearCart()
            setSuccess(true)
            setTimeout(() => {
              navigate('/orders')
            }, 2000)
          } catch (err: any) {
            if (err.code === 'RATE_LIMIT_EXCEEDED') {
              showNotification(
                `Rate limit exceeded. Please wait ${err.retryAfter || 0} seconds before trying again. Your payment was successful (Reference: ${response.reference}).`,
                'warning'
              )
              setError(`Order creation rate limit exceeded. Please wait ${err.retryAfter || 0} seconds before trying again. Your payment was successful (Reference: ${response.reference}).`)
            } else {
              showNotification('Something went wrong. Please contact support with your payment reference: ' + response.reference, 'error')
              setError('Payment successful but failed to create order. Please contact support with your payment reference: ' + response.reference)
            }
            setLoading(false)
          }
        },
        onClose: () => {
          setError('Payment was cancelled. No order was created.')
          setLoading(false)
        },
      })
    } catch (err: any) {
      showNotification('Something went wrong. Please try again later.', 'error')
      setError(err.message || 'Failed to initialize payment')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!user) {
        throw new Error('Please sign in to complete your order')
      }

      if (!formData.region) {
        throw new Error('Please select a delivery region')
      }

      if (!formData.gpsCode) {
        throw new Error('Please enter your GPS code')
      }

      const orderData = {
        userId: user.uid,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal: subtotal,
        tax: tax,
        shipping: shippingCost,
        total: total,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          region: formData.region,
          gpsCode: formData.gpsCode,
        },
        paymentMethod: 'paystack', // Always use Paystack
      }

      // Initialize Paystack payment - order will be created only after successful payment
      await initializePaystackPayment(orderData, orderData.total, formData.email, formData.fullName)
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
      setLoading(false)
    }
  }

  if (items.length === 0 && !success) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">Your cart is empty. Redirecting to home...</Alert>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Thank you for your purchase. You will receive a confirmation email shortly.
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/orders')}>
            View Orders
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Shipping Information
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Street Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      fullWidth
                      required
                      multiline
                      rows={2}
                      helperText="Delivery only available in Ghana"
                    />
                    <FormControl fullWidth required>
                      <InputLabel>Region</InputLabel>
                      <Select
                        value={formData.region}
                        label="Region"
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      >
                        {ghanaRegions.map((region) => (
                          <MenuItem key={region} value={region}>
                            {region}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="GPS Code"
                      value={formData.gpsCode}
                      onChange={(e) => setFormData({ ...formData, gpsCode: e.target.value })}
                      fullWidth
                      required
                      placeholder="e.g., GA-123-4567"
                      helperText="Enter your GPS code for accurate delivery"
                    />
                  </Stack>
                </CardContent>
              </Card>

            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 350 } }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {items.map((item) => (
                  <Stack key={item.product.id} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {item.product.name} x{item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      GH₵{(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Stack>
                ))}
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
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
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </Paper>
          </Box>
        </Stack>
      </form>
    </Container>
  )
}

