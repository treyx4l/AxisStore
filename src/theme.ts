import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// AXIS STORE - Color palette inspired by axis-tech.vercel.app
// Primary: Deep crimson red
// Background: Near-black / dark
// Accent: Muted gold / white
const crimsonRed = '#C8102E'
const crimsonDark = '#a00e25'
const crimsonLight = '#e03050'

const commonThemeOptions: ThemeOptions = {
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: 'none',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${crimsonRed} 0%, ${crimsonDark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${crimsonLight} 0%, ${crimsonRed} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
}

// Light theme – clean white with red accents (for light mode toggle)
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: crimsonRed,
      dark: crimsonDark,
      light: crimsonLight,
    },
    secondary: {
      main: '#1a1a1a',
      dark: '#000000',
      light: '#333333',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f8f8f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#0a0a0a',
      secondary: '#555555',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  components: {
    ...commonThemeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.96)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
})

// Dark theme – near-black backgrounds with crimson red accent (primary design)
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: crimsonRed,
      dark: crimsonDark,
      light: crimsonLight,
    },
    secondary: {
      main: '#ffffff',
      dark: '#cccccc',
      light: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#080808',
      paper: '#111111',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#9a9a9a',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  components: {
    ...commonThemeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(8,8,8,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(200,16,46,0.15)',
            border: '1px solid rgba(200,16,46,0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#111111',
          borderRadius: 4,
        },
      },
    },
  },
})
