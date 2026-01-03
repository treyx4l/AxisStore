import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  Typography,
  IconButton,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import GoogleIcon from '@mui/icons-material/Google'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useNotification } from '../context/NotificationContext'

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  mode: 'login' | 'signup'
}

export const AuthDialog = ({ open, onClose, mode }: AuthDialogProps) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, user } = useFirebaseAuth()
  const { showNotification } = useNotification()

  // Close dialog when user successfully logs in
  useEffect(() => {
    if (user && open) {
      onClose()
      setError('')
      setLoading(false)
    }
  }, [user, open, onClose])

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // Dialog will close automatically via useEffect when user is set
    } catch (err: any) {
      showNotification('Something went wrong. Please try again later.', 'error')
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <IconButton 
            onClick={handleClose} 
            size="small"
            disabled={loading}
            sx={{ 
              '&:hover': { 
                bgcolor: 'action.hover' 
              } 
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {mode === 'login' 
            ? 'Sign in to continue shopping' 
            : 'Join us to start shopping'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2, mb: 1 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ borderRadius: 0 }}
            >
              {error}
            </Alert>
          )}

          <Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ px: 2 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

