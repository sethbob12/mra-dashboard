// src/AppWrapper.js
import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MatrixRain from './MatrixRain';

const AppWrapper = ({ children }) => {
  const theme = useTheme();

  useEffect(() => {
    console.log("Theme mode:", theme.palette.mode);
  }, [theme]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Remove dark mode condition temporarily for testing */}
      {<MatrixRain />}
      {children}
    </Box>
  );
};

export default AppWrapper;
