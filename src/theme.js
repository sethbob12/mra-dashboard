// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // Brand (primary) color
    },
    secondary: {
      main: '#28a745', // Secondary color
    },
    background: {
      default: '#f0f0f0', // A warmer, subdued light gray
    },
    text: {
      primary: '#333',
    },
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: '0.5px',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // Keeps Paper white for contrast
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
        },
      },
    },
  },
});

export default theme;
