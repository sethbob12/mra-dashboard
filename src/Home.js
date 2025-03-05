// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Assessment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

// Motion variants for the module cards
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Home = () => {
  const navigate = useNavigate();

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
      label: "MRA Reports",
      icon: <ReportIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/reports",
    },
    {
      label: "QA Metrics",
      icon: <ManageAccountsIcon fontSize="large" sx={{ color: "#1E73BE" }} />,
      path: "/qa-metrics",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Subtle diagonal stripe pattern overlay
        background: `
          linear-gradient(
            135deg,
            rgba(245,248,250,0.3) 25%,
            transparent 25%,
            transparent 50%,
            rgba(245,248,250,0.3) 50%,
            rgba(245,248,250,0.3) 75%,
            transparent 75%,
            transparent
          ),
          #f5f8fa
        `,
        backgroundSize: "40px 40px",
        py: 8,
        px: { xs: 2, sm: 4, md: 8 },
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1E73BE",
          mb: 1,
          fontFamily: "Open Sans, sans-serif",
        }}
      >
        MRA Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#555", mb: 4, fontFamily: "Open Sans, sans-serif" }}>
        Manage your reviews, reports, and emails all in one place.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {modules.map((module, index) => (
          <Grid item key={module.label} xs={12} sm={6} md={4} lg={3}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.15 }}
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

      <Box sx={{ mt: 8, color: "#888" }}>
        <Typography variant="caption" sx={{ fontFamily: "Open Sans, sans-serif" }}>
          © {new Date().getFullYear()} MRA Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
