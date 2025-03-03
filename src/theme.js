// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // Example brand color
    },
    secondary: {
      main: '#28a745', // Example secondary color
    },
    background: {
      default: '#f8f9fa', // Light gray background
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
});

export default theme;
