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
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import HomeIcon from '@mui/icons-material/Home'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { useNavigate } from 'react-router-dom'

export const UserSettings = () => {
  const { user, userProfile, updateUserProfile, updateUserEmail, updateUserPassword, logout } =
    useFirebaseAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '')
  const [address, setAddress] = useState(userProfile?.address || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )

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

  const handleUpdateEmail = async () => {
    if (!email || email === user?.email) return
    setLoading(true)
    setMessage(null)
    try {
      await updateUserEmail(email)
      setMessage({ type: 'success', text: 'Email updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update email' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await updateUserPassword(newPassword)
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5">Please sign in to access settings</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Account Settings</Typography>

        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={userProfile?.photoURL || user.photoURL || undefined}
                sx={{ width: 64, height: 64 }}
              >
                {userProfile?.displayName?.[0] || user.displayName?.[0] || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {userProfile?.displayName || user.displayName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userProfile?.email || user.email}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Typography variant="h6">Profile Information</Typography>
            <TextField
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
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
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{ alignSelf: 'flex-start' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>

            <Divider />

            <Typography variant="h6">Email</Typography>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="outlined"
              onClick={handleUpdateEmail}
              disabled={loading || email === user.email}
              sx={{ alignSelf: 'flex-start' }}
            >
              Update Email
            </Button>

            <Divider />

            <Typography variant="h6">Change Password</Typography>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={handleUpdatePassword}
              disabled={loading || !newPassword}
              sx={{ alignSelf: 'flex-start' }}
            >
              Update Password
            </Button>

            <Divider />

            <Button variant="outlined" color="error" onClick={handleLogout}>
              Sign Out
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

