import React, { useMemo, useState, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  Container,
  Stack,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useFirebaseAuth } from './context/FirebaseAuthContext'
import { useCart } from './context/CartContext'
import { AuthDialog } from './components/AuthDialog'
import { lightTheme, darkTheme } from './theme'
import { ColorModeContext } from './context/colorMode'
import { StoreHome } from './pages/StoreHome'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLogin } from './pages/AdminLogin'
import { CategoryPage } from './pages/CategoryPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrdersPage } from './pages/OrdersPage'
import { SearchPage } from './pages/SearchPage'
import { categories } from './data/products'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { FirebaseAuthProvider } from './context/FirebaseAuthContext'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import { NotificationProvider } from './context/NotificationContext'
import { UserAccount } from './pages/UserAccount'
import { AboutModal } from './components/AboutModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import logoImage from './assets/logo.png'

const SearchBarSection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1.5,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <TextField
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
              setSearchQuery('')
            }
          }}
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery.trim() ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                      setSearchQuery('')
                    }
                  }}
                  sx={{ p: 0.5 }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Container>
    </Box>
  )
}

const Navbar = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const colorMode = useContext(ColorModeContext)
  const { user, logout, loading: authLoading } = useFirebaseAuth()
  const { totalItems } = useCart()

  // Close auth dialog when user logs in
  useEffect(() => {
    if (user && authDialogOpen) {
      setAuthDialogOpen(false)
    }
  }, [user, authDialogOpen])

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      handleUserMenuClose()
      // Reset auth dialog state after logout
      setAuthDialogOpen(false)
    } catch (error) {
      // Logout error handled silently
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={(t) => ({
        borderBottom: '1px solid',
        borderColor:
          t.palette.mode === 'light'
            ? 'rgba(34, 112, 176, 0.2)'
            : 'rgba(34, 112, 176, 0.3)',
        backdropFilter: 'blur(10px)',
        bgcolor:
          t.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(0, 0, 0, 0.95)',
      })}
    >
      <Toolbar sx={{ position: 'relative' }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Box
            component="img"
            src={logoImage}
            alt="AXIS STORE"
            sx={{
              height: { xs: 32, sm: 40, md: 48 },
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: { xs: '0.875rem', sm: '1.25rem' },
            }}
          >
            AXIS STORE
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: { md: 0 } }} />
        <Stack
          direction="row"
          spacing={1}
          sx={{ 
            display: { xs: 'none', lg: 'flex' },
            flexShrink: 0,
          }}
        >
          <Button
            component={Link}
            to="/"
            color={location.pathname === '/' ? 'primary' : 'inherit'}
            sx={{ fontWeight: location.pathname === '/' ? 600 : 400, minWidth: 'auto', px: 1.5 }}
          >
            Home
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              component={Link}
              to={`/category/${category.id}`}
              color={
                location.pathname === `/category/${category.id}` ? 'primary' : 'inherit'
              }
              sx={{ fontWeight: location.pathname === `/category/${category.id}` ? 600 : 400, minWidth: 'auto', px: 1.5 }}
            >
              {category.label}
            </Button>
          ))}
        </Stack>
        <Box sx={{ flexGrow: 1, minWidth: { md: 0 } }} />
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center"
        >
          {!authLoading && user ? (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AccountCircleIcon />}
                onClick={handleUserMenuOpen}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {user.displayName || user.email?.split('@')[0] || 'Account'}
              </Button>
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                aria-label="User menu"
              >
                <AccountCircleIcon />
              </IconButton>
            </>
          ) : !authLoading ? (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => handleOpenAuth('login')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => handleOpenAuth('signup')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign Up
              </Button>
              <IconButton
                color="inherit"
                onClick={() => handleOpenAuth('login')}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                aria-label="Sign In"
              >
                <LoginIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => handleOpenAuth('signup')}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                aria-label="Sign Up"
              >
                <PersonAddIcon />
              </IconButton>
            </>
          ) : null}
          <IconButton
            color="inherit"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={colorMode.toggleColorMode}
            aria-label="Toggle light/dark mode"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {colorMode.mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <IconButton color="inherit" component={Link} to="/cart" sx={{ position: 'relative' }}>
            <ShoppingCartIcon />
            {totalItems > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {totalItems > 9 ? '9+' : totalItems}
              </Box>
            )}
          </IconButton>
        </Stack>
        {user && (
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem component={Link} to="/orders" onClick={handleUserMenuClose}>
              <ShoppingBagIcon sx={{ mr: 1 }} />
              Orders
            </MenuItem>
            <MenuItem component={Link} to="/settings" onClick={handleUserMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        )}
        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          mode={authMode}
        />
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                  setSearchQuery('')
                  handleMobileMenuClose()
                }
              }}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery.trim() ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (searchQuery.trim()) {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                          setSearchQuery('')
                          handleMobileMenuClose()
                        }
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Box>
          <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
            Home
          </MenuItem>
          {categories.map((category) => (
            <MenuItem
              key={category.id}
              component={Link}
              to={`/category/${category.id}`}
              onClick={handleMobileMenuClose}
            >
              {category.label}
            </MenuItem>
          ))}
          {!authLoading && !user && [
            <MenuItem key="signin" onClick={() => { handleOpenAuth('login'); handleMobileMenuClose() }}>
              Sign In
            </MenuItem>,
            <MenuItem key="signup" onClick={() => { handleOpenAuth('signup'); handleMobileMenuClose() }}>
              Sign Up
            </MenuItem>
          ]}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

const AppShell = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [aboutModalOpen, setAboutModalOpen] = useState(false)

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
      },
      mode,
    }),
    [mode],
  )

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navbar />
          {/* Search Bar Section */}
          <SearchBarSection />
          <Box component="main">{children}</Box>
          <Box
            component="footer"
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              mt: 6,
              py: 3,
            }}
          >
            <Container maxWidth="lg">
              <Stack spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  © {new Date().getFullYear()} AXIS STORE. Premium PCs & Software
                  Solutions.
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setAboutModalOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  About the Developer
                </Button>
              </Stack>
            </Container>
          </Box>
          <AboutModal open={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <FirebaseAuthProvider>
          <ProductsProvider>
            <CartProvider>
              <AuthProvider>
                <BrowserRouter>
                  <AppShell>
                    <ErrorBoundary>
                      <Routes>
                      <Route path="/" element={<StoreHome />} />
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/settings" element={<UserAccount />} />
                <Route path="/account" element={<UserAccount />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin/secret-access-2024"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      </Routes>
                    </ErrorBoundary>
                  </AppShell>
                </BrowserRouter>
              </AuthProvider>
            </CartProvider>
          </ProductsProvider>
        </FirebaseAuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
