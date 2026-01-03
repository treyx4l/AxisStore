import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Alert,
} from '@mui/material'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ordersService, type Order } from '../services/rtdbService'
import { CircularProgress, Button, Link as MuiLink } from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

export const OrdersPage = () => {
  const { user } = useFirebaseAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const ordersData = await ordersService.getByUserId(user.uid)
        // Only show orders with paid status (since orders are only created after successful payment)
        const paidOrders = ordersData.filter((o) => o.paymentStatus === 'paid')
        setOrders(paidOrders)
      } catch (error: any) {
        // Error loading orders - handled silently
        if (error.code === 'PERMISSION_DENIED') {
          // Permission denied - handled silently
        }
      } finally {
        setLoading(false)
      }
    }

    loadOrders()

    // Subscribe to real-time updates
    const unsubscribe = ordersService.subscribe((allOrders) => {
      // Only show orders with paid status
      const userOrders = allOrders.filter((o) => o.userId === user.uid && o.paymentStatus === 'paid')
      setOrders(userOrders)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'processing':
        return 'info'
      case 'shipped':
        return 'primary'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">Please sign in to view your orders.</Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading orders...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      {orders.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start shopping to see your orders here!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Browse Products
          </Button>
        </Box>
      ) : (
        <Stack spacing={3} sx={{ mt: 3 }}>
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Order #{order.orderNumber}</Typography>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    {order.items.map((item, idx) => (
                      <Stack key={idx} direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          {item.productName} x{item.quantity}
                        </Typography>
                        <Typography variant="body2">
                          GH₵{(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2">GH₵{order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Stack>
                    {order.tax && order.tax > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Tax</Typography>
                        <Typography variant="body2">GH₵{order.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Shipping</Typography>
                      <Typography variant="body2">GH₵{order.shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="primary">
                        GH₵{order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Placed on: {formatDate(order.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Payment Method: {order.paymentMethod}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Payment Status: <Chip label={order.paymentStatus} size="small" color={order.paymentStatus === 'paid' ? 'success' : 'default'} sx={{ height: 18, fontSize: '0.65rem' }} />
                    </Typography>
                    {order.trackingNumber && (
                      <Stack spacing={0.5} sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalShippingIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight="bold">
                            Tracking Information
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Carrier: {order.trackingCarrier || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tracking #: {order.trackingNumber}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}

