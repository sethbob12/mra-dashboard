// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, IconButton } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Assessment";

const Home = () => {
  const navigate = useNavigate(); // Enables navigation

  const modules = [
    { label: "Data Table", icon: <TableChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/table" },
    { label: "Visualizations", icon: <BarChartIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/chart" },
    { label: "Email Generator", icon: <EmailIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/emails" },
    { label: "Reports & Insights", icon: <ReportIcon fontSize="large" sx={{ color: "#1E73BE" }} />, path: "/reports" },
  ];

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        MRA Dashboard
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {modules.map((module) => (
          <Grid item key={module.label} xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
              onClick={() => navigate(module.path)} // Click handler for navigation
            >
              <IconButton sx={{ mb: 1 }}>{module.icon}</IconButton> {/* Icon stays blue */}
              <Typography variant="h6">{module.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
