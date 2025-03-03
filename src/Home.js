// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Assessment";

// Define motion variants for the card animation
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    { label: "Data Table", icon: <TableChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/table" },
    { label: "Visualizations", icon: <BarChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/chart" },
    { label: "Email Generator", icon: <EmailIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/emails" },
    { label: "Reports & Insights", icon: <ReportIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/reports" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        fontFamily: "Open Sans, sans-serif",
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
        textAlign: "center",
      }}
    >
      {/* Page Title */}
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

      {/* Modules Grid with animation */}
      <Grid container spacing={4} justifyContent="center">
        {modules.map((module, index) => (
          <Grid item key={module.label} xs={12} sm={6} md={3}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.2 }}
            >
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
                  borderRadius: 2,
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
                  Click to explore
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Footer (optional) */}
      <Box sx={{ mt: 6, color: "#888" }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} MRA Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
