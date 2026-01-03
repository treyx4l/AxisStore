import { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CityIcon from '@mui/icons-material/LocationCity'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useNavigate } from 'react-router-dom'


interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export const UserAccount = () => {
  const { user, userProfile, updateUserProfile, logout } = useFirebaseAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [settingsTab, setSettingsTab] = useState(0)
  
  // Profile fields
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '')
  const [address, setAddress] = useState(userProfile?.address || '')
  
  // Checkout info fields
  const [checkoutFullName, setCheckoutFullName] = useState(userProfile?.checkoutInfo?.fullName || '')
  const [checkoutPhone, setCheckoutPhone] = useState(userProfile?.checkoutInfo?.phone || '')
  const [checkoutAddress, setCheckoutAddress] = useState(userProfile?.checkoutInfo?.address || '')
  const [checkoutRegion, setCheckoutRegion] = useState(userProfile?.checkoutInfo?.region || '')
  const [checkoutGpsCode, setCheckoutGpsCode] = useState(userProfile?.checkoutInfo?.gpsCode || '')

  const ghanaRegions = [
    'Greater Accra',
    'Volta Region',
    'Bono Region',
    'Ashanti Region',
    'Central Region',
  ]
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage(null)
    try {
      await updateUserProfile({
        displayName,
        phoneNumber,
        address,
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCheckoutInfo = async () => {
    setLoading(true)
    setMessage(null)
    try {
      await updateUserProfile({
        checkoutInfo: {
          fullName: checkoutFullName,
          phone: checkoutPhone,
          address: checkoutAddress,
          region: checkoutRegion,
          gpsCode: checkoutGpsCode,
        },
      })
      setMessage({ type: 'success', text: 'Checkout information saved successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save checkout information' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' })
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      // In a real app, you would call a backend API to delete the account
      // For now, we'll just log the request
      // Account deletion requested
      
      // You would typically:
      // 1. Delete user data from Firestore
      // 2. Delete user from Firebase Auth
      // 3. Send confirmation email
      
      setMessage({ 
        type: 'success', 
        text: 'Account deletion request submitted. You will receive a confirmation email shortly.' 
      })
      setDeleteDialogOpen(false)
      setDeleteConfirmText('')
      
      // Logout after deletion request
      setTimeout(() => {
        logout()
        navigate('/')
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit deletion request' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      // Logout error - handled silently
    }
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Please sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You need to be signed in to access your account
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Paper sx={{ p: 3, background: (theme) => theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, rgba(34, 112, 176, 0.1) 0%, rgba(226, 98, 162, 0.08) 50%, rgba(255, 255, 255, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(34, 112, 176, 0.15) 0%, rgba(226, 98, 162, 0.12) 50%, rgba(85, 55, 115, 0.1) 100%)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Avatar
              src={userProfile?.photoURL || user.photoURL || undefined}
              sx={{ width: 80, height: 80, border: '3px solid', borderColor: 'primary.main' }}
            >
              {userProfile?.displayName?.[0] || user.displayName?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {userProfile?.displayName || user.displayName || 'User'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userProfile?.email || user.email}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Paper>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tab} index={0}>
              <Stack spacing={3}>
                <Tabs
                  value={settingsTab}
                  onChange={(_, newValue) => setSettingsTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                >
                  <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
                  <Tab icon={<CreditCardIcon />} iconPosition="start" label="Checkout Info" />
                  <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
                </Tabs>

                {message && (
                  <Alert severity={message.type} onClose={() => setMessage(null)}>
                    {message.text}
                  </Alert>
                )}

                {/* Profile Tab */}
                {settingsTab === 0 && (
                  <Stack spacing={3}>
                    <Typography variant="h6">Profile Information</Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Email"
                          value={userProfile?.email || user.email || ''}
                          fullWidth
                          disabled
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                          helperText="Email cannot be changed (Google account)"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          InputProps={{
                            startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', mt: 1 }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{ minWidth: 150 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* Checkout Info Tab */}
                {settingsTab === 1 && (
                  <Stack spacing={3}>
                    <Typography variant="h6">Checkout Information</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This information will be used for order delivery and billing
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Full Name"
                          value={checkoutFullName}
                          onChange={(e) => setCheckoutFullName(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label="Phone Number"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Street Address"
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', mt: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>Region</InputLabel>
                          <Select
                            value={checkoutRegion}
                            label="Region"
                            onChange={(e) => setCheckoutRegion(e.target.value)}
                            startAdornment={<CityIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                          >
                            {ghanaRegions.map((region) => (
                              <MenuItem key={region} value={region}>
                                {region}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="GPS Code"
                          value={checkoutGpsCode}
                          onChange={(e) => setCheckoutGpsCode(e.target.value)}
                          fullWidth
                          placeholder="e.g., GA-123-4567"
                          helperText="Enter your GPS code for accurate delivery"
                        />
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleSaveCheckoutInfo}
                        disabled={loading}
                        sx={{ minWidth: 150 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Checkout Info'}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {/* Security Tab */}
                {settingsTab === 2 && (
                  <Stack spacing={3}>
                    <Typography variant="h6">Security & Data Management</Typography>
                    
                    <Divider />
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Data Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        You can request to delete your account and all associated data. This action cannot be undone.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Request Account Deletion
                      </Button>
                    </Box>

                    <Divider />

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Stack>

      {/* Account Deletion Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!loading) {
            setDeleteDialogOpen(false)
            setDeleteConfirmText('')
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteForeverIcon color="error" />
            <Typography variant="h6">Delete Account</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              This action will permanently delete your account and all associated data including:
            </DialogContentText>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              <li><Typography variant="body2">Your profile information</Typography></li>
              <li><Typography variant="body2">Order history</Typography></li>
              <li><Typography variant="body2">Cart items</Typography></li>
              <li><Typography variant="body2">All saved preferences</Typography></li>
            </Box>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. Please be certain before proceeding.
            </Alert>
            <TextField
              label="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              helperText="You must type 'DELETE' exactly to confirm"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteConfirmText('')
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading || deleteConfirmText !== 'DELETE'}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteForeverIcon />}
          >
            {loading ? 'Processing...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

// Orders component for the user account page

