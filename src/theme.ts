import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles'; 

// AXIS STORE color palette: #E262A2, #FBC817, #2270B0, #25B1BE, #553773, black, white
const primaryBlue = '#2270B0'
const primaryBlueDark = '#1a5a8f'
const primaryBlueLight = '#4a8fc7'
const accentPink = '#E262A2'
const accentYellow = '#FBC817'
const accentCyan = '#25B1BE'
const accentPurple = '#553773'

const commonThemeOptions: ThemeOptions = {
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        rounded: {
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
          },
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: primaryBlue,
      dark: primaryBlueDark,
      light: primaryBlueLight,
    },
    secondary: {
      main: accentPink,
      dark: '#c04d8a',
      light: '#e885b8',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: accentYellow,
    },
    info: {
      main: accentCyan,
    },
    success: {
      main: accentCyan,
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
})

export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: primaryBlue,
      dark: primaryBlueDark,
      light: primaryBlueLight,
    },
    secondary: {
      main: accentPink,
      dark: '#c04d8a',
      light: '#e885b8',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: accentYellow,
    },
    info: {
      main: accentCyan,
    },
    success: {
      main: accentCyan,
    },
    background: {
      default: '#0a0a0f',
      paper: '#151520',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0c0',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  components: {
    ...commonThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #151520 0%, #1a1a2a 100%)',
          border: '1px solid rgba(34, 112, 176, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(15, 15, 25, 0.95) 100%)',
        },
      },
    },
  },
})


