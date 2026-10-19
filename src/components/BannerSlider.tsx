import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, Button, Stack, Chip, useTheme, useMediaQuery } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SpeedIcon from '@mui/icons-material/Speed'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { bannersService, type Banner } from '../services/rtdbService'
import { useNavigate } from 'react-router-dom'

interface SlideItem {
  id: string
  isCustomImage?: boolean
  imageUrl?: string
  linkUrl?: string
  badge?: string
  title: string
  highlight: string
  subtitle: string
  primaryCtaText?: string
  primaryCtaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  imageVisual?: string
  features?: { icon: React.ReactNode; text: string }[]
  accentColor?: string
}

// Built-in modern featured slides when RTDB has no custom banners
const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 'slide-desktops',
    badge: 'NEW ARRIVALS 2026',
    title: 'NEXT-GEN POWER',
    highlight: 'GAMING & WORKSTATIONS',
    subtitle: 'Custom liquid-cooled beasts, RTX 40 & 50 series architectures, and precision airflow engineering for extreme loads.',
    primaryCtaText: 'Shop Desktops',
    primaryCtaLink: '/category/desktops',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/#products',
    imageVisual: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    features: [
      { icon: <SpeedIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'Overclocked Performance' },
      { icon: <VerifiedUserIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: '3-Year Warranty' },
      { icon: <LocalShippingIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'Express Delivery' },
    ],
    accentColor: '#C8102E',
  },
  {
    id: 'slide-laptops',
    badge: 'FLAGSHIP SELECTION',
    title: 'PRO MOBILITY',
    highlight: 'CREATOR ULTRABOOKS',
    subtitle: 'Featherlight aerospace magnesium chassis, color-calibrated OLED panels, and all-day battery built for professionals on the move.',
    primaryCtaText: 'Browse Laptops',
    primaryCtaLink: '/category/laptops',
    secondaryCtaText: 'View All',
    secondaryCtaLink: '/#products',
    imageVisual: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    features: [
      { icon: <SpeedIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'OLED 120Hz Displays' },
      { icon: <VerifiedUserIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: '100% Genuine Tech' },
      { icon: <LocalShippingIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'Free Safe Shipping' },
    ],
    accentColor: '#C8102E',
  },
  {
    id: 'slide-software',
    badge: 'INSTANT ACTIVATION',
    title: 'GENUINE LICENSES',
    highlight: 'SOFTWARE & SECURITY',
    subtitle: 'Direct digital license delivery for Windows, Microsoft Office 365, developer IDEs, and world-class cybersecurity suites.',
    primaryCtaText: 'Get Software',
    primaryCtaLink: '/category/softwares',
    secondaryCtaText: 'All Categories',
    secondaryCtaLink: '/#products',
    imageVisual: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    features: [
      { icon: <SpeedIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'Instant Digital Key' },
      { icon: <VerifiedUserIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: 'Lifetime Guarantee' },
      { icon: <LocalShippingIcon sx={{ fontSize: '1rem', color: '#C8102E' }} />, text: '24/7 Support' },
    ],
    accentColor: '#C8102E',
  },
]

export const BannerSlider = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigateHook = useNavigate()

  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  // Touch / pointer drag state
  const startX = useRef<number | null>(null)
  const currentX = useRef<number | null>(null)
  const isSwiping = useRef(false)

  // Auto-play interval duration
  const SLIDE_DURATION = 5000

  /* ─── Fetch banners from RTDB ────────────────────────────────────── */
  useEffect(() => {
    let isMounted = true

    const loadBanners = async () => {
      try {
        const data = await bannersService.getAll()
        if (isMounted && data && data.length > 0) {
          const mapped: SlideItem[] = data.map((b: Banner, index) => ({
            id: b.id || `custom-${index}`,
            isCustomImage: true,
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl,
            title: 'AXIS STORE',
            highlight: 'SPECIAL OFFER',
            subtitle: 'Exclusive hardware and tech collections curated for enthusiasts.',
          }))
          setSlides(mapped)
        }
      } catch {
        // Fall back to default slides on error / unconfigured RTDB
      }
    }
    loadBanners()

    const unsub = bannersService.subscribe((data) => {
      if (isMounted && data && data.length > 0) {
        const mapped: SlideItem[] = data.map((b: Banner, index) => ({
          id: b.id || `custom-${index}`,
          isCustomImage: true,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl,
          title: 'AXIS STORE',
          highlight: 'SPECIAL OFFER',
          subtitle: 'Exclusive hardware and tech collections curated for enthusiasts.',
        }))
        setSlides(mapped)
        setCurrentIndex(0)
      }
    })

    return () => {
      isMounted = false
      unsub()
    }
  }, [])

  /* ─── Navigation helpers ─────────────────────────────────────────── */
  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setProgressKey((prev) => prev + 1)
  }, [])

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setProgressKey((prev) => prev + 1)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setProgressKey((prev) => prev + 1)
  }, [slides.length])

  /* ─── Auto-play timer ────────────────────────────────────────────── */
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      nextSlide()
    }, SLIDE_DURATION)

    return () => clearInterval(timer)
  }, [slides.length, isPaused, nextSlide])

  /* ─── Touch / Drag handlers ──────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startX.current = clientX
    currentX.current = clientX
    isSwiping.current = true
    setIsPaused(true)
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping.current || startX.current === null) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    currentX.current = clientX
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current || startX.current === null || currentX.current === null) {
      isSwiping.current = false
      setIsPaused(false)
      return
    }

    const deltaX = currentX.current - startX.current
    const SWIPE_THRESHOLD = 45

    if (deltaX < -SWIPE_THRESHOLD) {
      nextSlide()
    } else if (deltaX > SWIPE_THRESHOLD) {
      prevSlide()
    }

    startX.current = null
    currentX.current = null
    isSwiping.current = false
    setIsPaused(false)
  }

  const handleCtaClick = (link?: string) => {
    if (!link) return
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank')
    } else if (link.startsWith('/#')) {
      const id = link.replace('/#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigateHook(link)
    }
  }

  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'pan-y',
        bgcolor: isDark ? '#080808' : '#f8f8f8',
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
      {/* ── Slide Track ── */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        {slides.map((slide, idx) => {
          // If banner is custom image from RTDB
          if (slide.isCustomImage && slide.imageUrl) {
            return (
              <Box
                key={slide.id || idx}
                onClick={() => slide.linkUrl && handleCtaClick(slide.linkUrl)}
                sx={{
                  flex: '0 0 100%',
                  width: '100%',
                  minHeight: { xs: 200, sm: 280, md: 380, lg: 440 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: slide.linkUrl ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={slide.imageUrl}
                  alt={slide.title}
                  draggable={false}
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: { xs: 280, md: 440 },
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            )
          }

          // Modern rich slide layout
          return (
            <Box
              key={slide.id || idx}
              sx={{
                flex: '0 0 100%',
                width: '100%',
                minHeight: { xs: 360, sm: 400, md: 460, lg: 500 },
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                py: { xs: 4, sm: 5, md: 6 },
                px: { xs: 2.5, sm: 4, md: 8, lg: 12 },
                background: isDark
                  ? 'radial-gradient(ellipse at 80% 20%, rgba(200,16,46,0.18) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(200,16,46,0.08) 0%, transparent 60%), #0a0a0a'
                  : 'radial-gradient(ellipse at 80% 20%, rgba(200,16,46,0.12) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(200,16,46,0.05) 0%, transparent 60%), #ffffff',
              }}
            >
              {/* Subtle Tech Grid Lines */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
                  backgroundSize: '48px 48px',
                  pointerEvents: 'none',
                }}
              />

              {/* Ambient Glow */}
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: '-10%', md: '10%' },
                  top: '20%',
                  width: { xs: 200, md: 380 },
                  height: { xs: 200, md: 380 },
                  borderRadius: '50%',
                  background: 'rgba(200,16,46,0.14)',
                  filter: 'blur(80px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Content Container */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  maxWidth: 1240,
                  mx: 'auto',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: { xs: 3, md: 6 },
                }}
              >
                {/* Left Text Column */}
                <Box sx={{ flex: '1 1 55%', maxWidth: { xs: '100%', md: 620 } }}>
                  {slide.badge && (
                    <Chip
                      label={slide.badge}
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(200,16,46,0.15)' : 'rgba(200,16,46,0.1)',
                        color: '#C8102E',
                        fontWeight: 700,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        letterSpacing: '0.12em',
                        border: '1px solid rgba(200,16,46,0.3)',
                        mb: { xs: 1.5, sm: 2 },
                        height: { xs: 24, sm: 28 },
                      }}
                    />
                  )}

                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.2rem' },
                      fontWeight: 800,
                      lineHeight: 1.08,
                      letterSpacing: '-0.025em',
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {slide.title}{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#C8102E',
                        display: 'block',
                        background: 'linear-gradient(135deg, #C8102E 0%, #ff4b68 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {slide.highlight}
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
                      lineHeight: 1.6,
                      maxWidth: 520,
                      mb: { xs: 2.5, sm: 3 },
                    }}
                  >
                    {slide.subtitle}
                  </Typography>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2.5, sm: 3 } }}>
                    {slide.primaryCtaText && (
                      <Button
                        variant="contained"
                        size={isMobile ? 'medium' : 'large'}
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleCtaClick(slide.primaryCtaLink)}
                        sx={{
                          bgcolor: '#C8102E',
                          background: 'linear-gradient(135deg, #C8102E 0%, #a00e25 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          px: { xs: 2.5, sm: 3.5 },
                          py: { xs: 1, sm: 1.4 },
                          fontSize: { xs: '0.825rem', sm: '0.925rem' },
                          borderRadius: 2,
                          boxShadow: '0 4px 18px rgba(200,16,46,0.35)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #e03050 0%, #C8102E 100%)',
                            boxShadow: '0 6px 24px rgba(200,16,46,0.5)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {slide.primaryCtaText}
                      </Button>
                    )}

                    {slide.secondaryCtaText && (
                      <Button
                        variant="outlined"
                        size={isMobile ? 'medium' : 'large'}
                        onClick={() => handleCtaClick(slide.secondaryCtaLink)}
                        sx={{
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)',
                          color: 'text.primary',
                          fontWeight: 600,
                          px: { xs: 2, sm: 3 },
                          py: { xs: 1, sm: 1.4 },
                          fontSize: { xs: '0.825rem', sm: '0.925rem' },
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          '&:hover': {
                            borderColor: '#C8102E',
                            color: '#C8102E',
                            bgcolor: isDark ? 'rgba(200,16,46,0.08)' : 'rgba(200,16,46,0.04)',
                          },
                        }}
                      >
                        {slide.secondaryCtaText}
                      </Button>
                    )}
                  </Stack>

                  {/* Highlights / Features Bar */}
                  {slide.features && (
                    <Stack
                      direction="row"
                      spacing={{ xs: 1.5, sm: 2.5 }}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ pt: 1, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                    >
                      {slide.features.map((feat, fIdx) => (
                        <Box key={fIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {feat.icon}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.78rem' },
                            }}
                          >
                            {feat.text}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Right Image Visual Column */}
                {slide.imageVisual && (
                  <Box
                    sx={{
                      flex: '1 1 45%',
                      width: '100%',
                      maxWidth: { xs: 340, sm: 420, md: 500 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/10',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: isDark
                          ? '0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)'
                          : '0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={slide.imageVisual}
                        alt={slide.title}
                        draggable={false}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {/* Gradient overlay for text contrast */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: isDark
                            ? 'linear-gradient(180deg, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.4) 100%)'
                            : 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.2) 100%)',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* ── Prev / Next Controls ── */}
      {slides.length > 1 && (
        <>
          {/* Previous Button */}
          <Box
            component="button"
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            aria-label="Previous slide"
            sx={{
              position: 'absolute',
              left: { xs: 8, sm: 16, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 34, sm: 42 },
              height: { xs: 34, sm: 42 },
              borderRadius: '50%',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
              bgcolor: isDark ? 'rgba(18,18,18,0.7)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              color: isDark ? '#fff' : '#111',
              cursor: 'pointer',
              p: 0,
              outline: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '&:hover': {
                bgcolor: '#C8102E',
                borderColor: '#C8102E',
                color: '#fff',
                transform: 'translateY(-50%) scale(1.08)',
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </Box>

          {/* Next Button */}
          <Box
            component="button"
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            aria-label="Next slide"
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 34, sm: 42 },
              height: { xs: 34, sm: 42 },
              borderRadius: '50%',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
              bgcolor: isDark ? 'rgba(18,18,18,0.7)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              color: isDark ? '#fff' : '#111',
              cursor: 'pointer',
              p: 0,
              outline: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '&:hover': {
                bgcolor: '#C8102E',
                borderColor: '#C8102E',
                color: '#fff',
                transform: 'translateY(-50%) scale(1.08)',
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </Box>
        </>
      )}

      {/* ── Dot Indicators ── */}
      {slides.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 12, sm: 16 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 10,
            bgcolor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            py: 0.6,
            px: 1.4,
            borderRadius: 6,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          {slides.map((_, i) => {
            const isActive = i === currentIndex
            return (
              <Box
                key={i}
                component="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(i)
                }}
                aria-label={`Slide ${i + 1}`}
                sx={{
                  width: isActive ? 24 : 7,
                  height: 7,
                  borderRadius: isActive ? '4px' : '50%',
                  bgcolor: isActive
                    ? '#C8102E'
                    : isDark
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(0,0,0,0.22)',
                  border: 'none',
                  cursor: 'pointer',
                  p: 0,
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  '&:hover': {
                    bgcolor: isActive
                      ? '#C8102E'
                      : isDark
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(0,0,0,0.5)',
                  },
                }}
              />
            )
          })}
        </Box>
      )}

      {/* ── Auto-Play Animated Progress Bar ── */}
      {slides.length > 1 && !isPaused && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            zIndex: 11,
          }}
        >
          <Box
            key={progressKey}
            sx={{
              height: '100%',
              bgcolor: '#C8102E',
              animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
              '@keyframes slideProgress': {
                '0%': { width: '0%' },
                '100%': { width: '100%' },
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
