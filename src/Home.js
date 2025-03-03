// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
// Import Open Sans (using default weight or specify a weight, e.g. 400)
import "@fontsource/open-sans";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  useTheme
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Assessment";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Optional: Access your MUI theme if you need custom palette or breakpoints

  const modules = [
    {
      label: "Data Table",
      icon: <TableChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/table",
    },
    {
      label: "Visualizations",
      icon: <BarChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/chart",
    },
    {
      label: "Email Generator",
      icon: <EmailIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/emails",
    },
    {
      label: "Reports & Insights",
      icon: <ReportIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/reports",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        fontFamily: "Open Sans, sans-serif", // Apply Open Sans
        py: 6, // vertical padding
        px: { xs: 2, sm: 4, md: 8 }, // responsive horizontal padding
        textAlign: "center",
      }}
    >
      {/* Title Section */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1E73BE",
          mb: 1,
        }}
      >
        MRA Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#555", mb: 4 }}>
        A modern, sleek dashboard for data insights
      </Typography>

      {/* Modules Grid */}
      <Grid container spacing={4} justifyContent="center">
        {modules.map((module) => (
          <Grid item key={module.label} xs={12} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                borderRadius: 2, // subtle rounding
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                  backgroundColor: "#fff",
                },
              }}
              onClick={() => navigate(module.path)}
            >
              <IconButton disableRipple sx={{ mb: 1 }}>
                {module.icon}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {module.label}
              </Typography>
              <Typography variant="body2" sx={{ color: "#777" }}>
                {/* You can add a short description or remove this */}
                Click to explore
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Optional Footer */}
      <Box sx={{ mt: 6, color: "#888" }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} MRA Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
