import { useState, useEffect } from 'react'
import { Box, IconButton, Stack, Typography, Button } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { bannersService, type Banner } from '../services/rtdbService'

export const BannerSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial banners
    const loadBanners = async () => {
      try {
        const data = await bannersService.getAll()
        setBanners(data)
      } catch (error) {
        // Error loading banners - handled silently
      } finally {
        setLoading(false)
      }
    }

    loadBanners()

    // Subscribe to real-time updates
    const unsubscribe = bannersService.subscribe((data) => {
      setBanners(data)
      // Reset to first banner if current index is out of bounds
      if (currentIndex >= data.length && data.length > 0) {
        setCurrentIndex(0)
      }
    })

    return () => unsubscribe()
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (banners.length === 0) return 0
        return (prev + 1) % banners.length
      })
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading banners...</Typography>
      </Box>
    )
  }

  if (banners.length === 0) {
    // Fallback to default banner if no banners exist
    return (
      <Box
        sx={(theme) => ({
          py: { xs: 4, sm: 5, md: 8 },
          px: { xs: 2, sm: 3 },
          minHeight: { xs: 180, sm: 220, md: 300 },
          display: 'flex',
          alignItems: 'center',
          background: theme.palette.mode === 'light'
            ? `radial-gradient(circle at top left, rgba(34, 112, 176, 0.15), transparent 55%), radial-gradient(circle at top right, rgba(226, 98, 162, 0.15), transparent 55%), radial-gradient(circle at bottom center, rgba(37, 177, 190, 0.1), transparent 50%)`
            : `radial-gradient(circle at top left, rgba(34, 112, 176, 0.2), transparent 55%), radial-gradient(circle at top right, rgba(226, 98, 162, 0.2), transparent 55%), radial-gradient(circle at bottom center, rgba(37, 177, 190, 0.15), transparent 50%)`,
        })}
      >
        <Box sx={{ maxWidth: 'lg', mx: 'auto', width: '100%' }}>
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="center" textAlign="center">
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              Welcome to AXIS STORE
            </Typography>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              Premium PCs & Software in a{' '}
              <Box component="span" color="primary.main">
                single store
              </Box>
              .
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                px: { xs: 1, sm: 0 },
              }}
            >
              Explore laptops, desktops, all in one computers, accessories,
              and essential software – curated for modern creators and
              professionals.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                const productsSection = document.getElementById('products')
                productsSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 1, sm: 1.25, md: 1.5 },
              }}
            >
              Shop Now
            </Button>
          </Stack>
        </Box>
      </Box>
    )
  }

  const currentBanner = banners[currentIndex]

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
        window.open(banner.linkUrl, '_blank')
      } else {
        // Internal route
        window.location.href = banner.linkUrl
      }
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // Mobile: Use actual image dimensions, Desktop: Fixed 1920x300
        height: { 
          xs: 'auto', // Mobile: auto height based on image
          md: 300 // Desktop: fixed 300px (1920x300 aspect ratio)
        },
        minHeight: { xs: 0, md: 300 },
        overflow: 'hidden',
        cursor: currentBanner.linkUrl ? 'pointer' : 'default',
        display: { xs: 'flex', md: 'block' },
        alignItems: { xs: 'center', md: 'stretch' },
        justifyContent: { xs: 'center', md: 'flex-start' },
        bgcolor: { xs: 'background.default', md: 'transparent' },
      }}
      onClick={() => handleBannerClick(currentBanner)}
    >
      {/* Banner Images with Fade Transition */}
      {banners.map((banner, index) => (
        <Box
          key={banner.id}
          component="img"
          src={banner.imageUrl}
          alt={`Banner ${index + 1}`}
          sx={{
            position: { xs: 'relative', md: 'absolute' },
            top: { md: 0 },
            left: { md: 0 },
            width: { xs: '100%', md: '100%' },
            height: { 
              xs: 'auto', // Mobile: natural image height
              md: '100%' // Desktop: fill container (300px)
            },
            maxWidth: { xs: '100%', md: '100%' },
            maxHeight: { xs: 'none', md: '100%' },
            objectFit: { xs: 'contain', md: 'contain' }, // Both mobile and desktop: contain to show full image without cropping
            objectPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: index === currentIndex ? 1 : 0,
            pointerEvents: 'none',
            display: index === currentIndex ? 'block' : 'none', // Only show current image
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            sx={{
              position: 'absolute',
              left: { xs: 8, sm: 12, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              zIndex: 10,
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              },
            }}
            aria-label="Previous banner"
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              zIndex: 10,
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              },
            }}
            aria-label="Next banner"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <Stack
          direction="row"
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{
            position: 'absolute',
            bottom: { xs: 8, sm: 12, md: 16 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleDotClick(index);
              }}
              sx={{
                width: { xs: 8, sm: 9, md: 10 },
                height: { xs: 8, sm: 9, md: 10 },
                borderRadius: 0,
                bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                minWidth: { xs: 8, sm: 9, md: 10 },
                minHeight: { xs: 8, sm: 9, md: 10 },
                '&:hover': {
                  bgcolor: index === currentIndex ? 'primary.dark' : 'rgba(255, 255, 255, 0.7)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                },
              }}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

