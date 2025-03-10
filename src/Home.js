// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, IconButton, Tooltip } from "@mui/material";
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
      icon: <TableChartIcon fontSize="large" />,
      path: "/table",
      color: "#1E73BE", // Blue
      subtitle: "View detailed reviewer data",
    },
    {
      label: "Visualizations",
      icon: <BarChartIcon fontSize="large" />,
      path: "/chart",
      color: "#FF8042", // Orange
      subtitle: "Analyze performance trends",
    },
    {
      label: "Email Generator",
      icon: <EmailIcon fontSize="large" />,
      path: "/emails",
      color: "#8A2BE2", // Violet
      subtitle: "Create and manage email lists",
    },
    {
      label: "MRA Reports",
      icon: <ReportIcon fontSize="large" />,
      path: "/reports",
      color: "#66BB6A", // Green
      subtitle: "Generate comprehensive reports",
    },
    {
      label: "QA Metrics",
      icon: <ManageAccountsIcon fontSize="large" />,
      path: "/qa-metrics",
      color: "#FF6384", // Pinkish Red
      subtitle: "Assess QA performance",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0efff, #ffffff)",
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "#1E73BE",
          mb: 2,
          fontFamily: "Open Sans, sans-serif",
        }}
      >
        Dashboard Home
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: "#555",
          mb: 4,
          fontFamily: "Open Sans, sans-serif",
        }}
      >
        Actionable insights to drive quality forward.
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
              <Tooltip title={`Go to ${module.label}`} arrow>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f7f9fc, #ffffff)",
                    border: "1px solid #666",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  onClick={() => navigate(module.path)}
                >
                  <IconButton
                    disableRipple
                    sx={{
                      mb: 1,
                      backgroundColor: module.color,
                      borderRadius: "50%",
                      p: 1,
                      "&:hover": { backgroundColor: module.color },
                    }}
                  >
                    {React.cloneElement(module.icon, { sx: { color: "#fff", fontSize: "large" } })}
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {module.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#777" }}>
                    {module.subtitle}
                  </Typography>
                </Paper>
              </Tooltip>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, color: "#888" }}>
        <Typography variant="caption" sx={{ fontFamily: "Open Sans, sans-serif" }}>
          © {new Date().getFullYear()} MRA Interactive Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
