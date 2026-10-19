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
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
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

// ─── Search Bar ──────────────────────────────────────────────────────────────
const SearchBarSection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <Box
      sx={(t) => ({
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: t.palette.mode === 'dark' ? '#0d0d0d' : '#fafafa',
        py: 1,
        px: { xs: 2, sm: 3, md: 4 },
      })}
    >
      <Container maxWidth="lg">
        <Box
          sx={(t) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            border: '1px solid',
            borderColor: focused
              ? '#C8102E'
              : t.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.12)',
            borderRadius: '6px',
            px: 2,
            py: 0.75,
            transition: 'border-color 0.2s',
            bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff',
          })}
        >
          <SearchIcon
            sx={{ color: focused ? '#C8102E' : 'text.secondary', fontSize: '1.1rem', transition: 'color 0.2s' }}
          />
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            fullWidth
            sx={{ fontSize: '0.875rem' }}
          />
          {searchQuery.trim() && (
            <Button
              size="small"
              onClick={handleSearch}
              sx={{
                minWidth: 0,
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                bgcolor: '#C8102E',
                color: '#fff',
                borderRadius: '4px',
                '&:hover': { bgcolor: '#a00e25' },
              }}
            >
              Search
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const colorMode = useContext(ColorModeContext)
  const { user, logout, loading: authLoading } = useFirebaseAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (user && authDialogOpen) setAuthDialogOpen(false)
  }, [user, authDialogOpen])

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuAnchor(null)
    } catch {
      // silent
    }
  }

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { label: 'Home', to: '/' },
    ...categories.map((c) => ({ label: c.label, to: `/category/${c.id}` })),
  ]

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={(t) => ({
          background:
            t.palette.mode === 'dark'
              ? scrolled
                ? 'rgba(5,5,5,0.98)'
                : 'rgba(8,8,8,0.96)'
              : scrolled
              ? 'rgba(255,255,255,0.99)'
              : 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid' : '1px solid',
          borderColor:
            t.palette.mode === 'dark'
              ? scrolled
                ? 'rgba(200,16,46,0.25)'
                : 'rgba(255,255,255,0.06)'
              : scrolled
              ? 'rgba(200,16,46,0.2)'
              : 'rgba(0,0,0,0.06)',
          transition: 'all 0.25s ease',
          boxShadow: scrolled
            ? t.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.5)'
              : '0 4px 24px rgba(0,0,0,0.08)'
            : 'none',
        })}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 }, gap: 2, minHeight: { xs: 60, md: 68 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', flexShrink: 0 }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="AXIS STORE"
              sx={{ height: { xs: 30, md: 38 }, width: 'auto' }}
            />
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: 800,
                fontSize: { xs: '1rem', md: '1.2rem' },
                letterSpacing: '0.05em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              AXIS{' '}
              <Box component="span" sx={{ color: '#C8102E' }}>
                STORE
              </Box>
            </Typography>
          </Box>

          {/* Desktop nav links */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: 'none', lg: 'flex' }, mx: 'auto' }}
          >
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                sx={(t) => ({
                  color: isActive(link.to) ? '#C8102E' : 'text.primary',
                  fontWeight: isActive(link.to) ? 700 : 500,
                  fontSize: '0.875rem',
                  px: 1.5,
                  py: 0.75,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: `translateX(-50%) scaleX(${isActive(link.to) ? 1 : 0})`,
                    width: '70%',
                    height: '2px',
                    borderRadius: '2px',
                    background: '#C8102E',
                    transition: 'transform 0.2s ease',
                  },
                  '&:hover::after': { transform: 'translateX(-50%) scaleX(1)' },
                  '&:hover': { bgcolor: 'transparent', color: '#C8102E' },
                })}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          {/* Right side actions */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {/* Auth buttons */}
            {!authLoading && user ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AccountCircleIcon />}
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderColor: 'rgba(200,16,46,0.4)',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#C8102E', color: '#C8102E', bgcolor: 'transparent' },
                    fontSize: '0.8rem',
                  }}
                >
                  {user.displayName || user.email?.split('@')[0] || 'Account'}
                </Button>
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ display: { xs: 'flex', sm: 'none' }, color: 'text.primary' }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </>
            ) : !authLoading ? (
              <>
                <Button
                  size="small"
                  startIcon={<LoginIcon />}
                  onClick={() => handleOpenAuth('login')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    color: 'text.primary',
                    '&:hover': { color: '#C8102E', bgcolor: 'transparent' },
                    fontSize: '0.8rem',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenAuth('signup')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    background: 'linear-gradient(135deg, #C8102E 0%, #a00e25 100%)',
                    fontSize: '0.8rem',
                    '&:hover': { background: 'linear-gradient(135deg, #e03050 0%, #C8102E 100%)' },
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : null}

            {/* Dark mode toggle */}
            <IconButton
              onClick={colorMode.toggleColorMode}
              aria-label="Toggle theme"
              sx={{ color: 'text.secondary', '&:hover': { color: '#C8102E' } }}
            >
              {colorMode.mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>

            {/* Cart */}
            <IconButton
              component={Link}
              to="/cart"
              aria-label={`Shopping cart (${totalItems} items)`}
              sx={{ color: 'text.primary', '&:hover': { color: '#C8102E' } }}
            >
              <Badge
                badgeContent={totalItems > 0 ? (totalItems > 9 ? '9+' : totalItems) : undefined}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#C8102E',
                    color: '#fff',
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'flex', lg: 'none' }, color: 'text.primary', ml: 0.5 }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* User account menu */}
      {user && (
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -6,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'rotate(45deg)',
                borderTop: '1px solid',
                borderLeft: '1px solid',
                borderColor: 'divider',
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            component={Link}
            to="/orders"
            onClick={() => setUserMenuAnchor(null)}
            sx={{ gap: 1.5, py: 1.2 }}
          >
            <ShoppingBagIcon fontSize="small" sx={{ color: '#C8102E' }} /> Orders
          </MenuItem>
          <MenuItem
            component={Link}
            to="/settings"
            onClick={() => setUserMenuAnchor(null)}
            sx={{ gap: 1.5, py: 1.2 }}
          >
            <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2, color: '#C8102E' }}>
            <LogoutIcon fontSize="small" /> Sign Out
          </MenuItem>
        </Menu>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 320 },
            bgcolor: 'background.default',
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
            AXIS <Box component="span" sx={{ color: '#C8102E' }}>STORE</Box>
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Mobile Search */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Box
            sx={(t) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid',
              borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
              borderRadius: '6px',
              px: 1.5,
              py: 0.75,
              bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
            })}
          >
            <SearchIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />
            <InputBase
              placeholder="Search products..."
              fullWidth
              sx={{ fontSize: '0.875rem' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (val) {
                    navigate(`/search?q=${encodeURIComponent(val)}`)
                    setDrawerOpen(false)
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Nav links */}
        <List sx={{ px: 1, pt: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                component={Link}
                to={link.to}
                onClick={() => setDrawerOpen(false)}
                selected={isActive(link.to)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'rgba(200,16,46,0.1)', color: '#C8102E' },
                  '&:hover': { bgcolor: 'rgba(200,16,46,0.07)', color: '#C8102E' },
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: isActive(link.to) ? 700 : 500, fontSize: '0.95rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Mobile auth */}
        {!authLoading && !user && (
          <Stack spacing={1} sx={{ px: 2, py: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => { handleOpenAuth('login'); setDrawerOpen(false) }}
              sx={{ borderColor: 'rgba(200,16,46,0.5)', color: 'text.primary', '&:hover': { borderColor: '#C8102E', color: '#C8102E' } }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => { handleOpenAuth('signup'); setDrawerOpen(false) }}
              sx={{ background: 'linear-gradient(135deg, #C8102E 0%, #a00e25 100%)', '&:hover': { background: 'linear-gradient(135deg, #e03050 0%, #C8102E 100%)' } }}
            >
              Sign Up
            </Button>
          </Stack>
        )}

        {!authLoading && user && (
          <Stack spacing={0.5} sx={{ px: 1, py: 1 }}>
            <ListItemButton component={Link} to="/orders" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
              <ShoppingBagIcon fontSize="small" sx={{ mr: 1.5, color: '#C8102E' }} />
              <ListItemText primary="Orders" />
            </ListItemButton>
            <ListItemButton component={Link} to="/settings" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
              <ListItemText primary="Settings" />
            </ListItemButton>
            <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false) }} sx={{ borderRadius: 2, color: '#C8102E' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </Stack>
        )}

        {/* Theme toggle */}
        <Box sx={{ px: 2, py: 1.5, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={colorMode.mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            onClick={() => colorMode.toggleColorMode()}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: '#C8102E', color: '#C8102E' },
            }}
          >
            {colorMode.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </Box>
      </Drawer>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} mode={authMode} />
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ onAboutClick }: { onAboutClick: () => void }) => (
  <Box
    component="footer"
    sx={(t) => ({
      borderTop: '1px solid',
      borderColor: 'divider',
      bgcolor: t.palette.mode === 'dark' ? '#080808' : '#f9f9f9',
      mt: 8,
    })}
  >
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
      >
        {/* Brand */}
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.06em', mb: 0.5 }}>
            AXIS{' '}
            <Box component="span" sx={{ color: '#C8102E' }}>
              STORE
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 260, lineHeight: 1.6 }}>
            Premium PCs &amp; Software — curated for modern creators and professionals.
          </Typography>
        </Box>

        {/* Links */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }}>
          {categories.map((c) => (
            <Button
              key={c.id}
              component={Link}
              to={`/category/${c.id}`}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: '#C8102E' }, minWidth: 0, px: 0 }}
            >
              {c.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} AXIS STORE. All rights reserved.
        </Typography>
        <Button
          size="small"
          onClick={onAboutClick}
          sx={{ color: 'text.secondary', fontSize: '0.8rem', '&:hover': { color: '#C8102E' } }}
        >
          About the Developer
        </Button>
      </Stack>
    </Container>
  </Box>
)

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [aboutModalOpen, setAboutModalOpen] = useState(false)

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
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
          <SearchBarSection />
          <Box component="main">{children}</Box>
          <Footer onAboutClick={() => setAboutModalOpen(true)} />
          <AboutModal open={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
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
