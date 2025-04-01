import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import ReportIcon from "@mui/icons-material/Assessment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import WorldMap from "./WorldMap";
import AdminFLData from "./AdminFLData";
import NewsTicker from "./NewsTicker";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const modules = [
    {
      label: "Data Table",
      icon: <TableChartIcon fontSize="large" />,
      path: "/table",
      color: "#1E73BE",
      subtitle: "View detailed reviewer data",
    },
    {
      label: "Visualizations",
      icon: <BarChartIcon fontSize="large" />,
      path: "/chart",
      color: "#FF8042",
      subtitle: "Analyze performance trends",
    },
    {
      label: "Email Generator",
      icon: <EmailIcon fontSize="large" />,
      path: "/emails",
      color: "#8A2BE2",
      subtitle: "Create and manage email lists",
    },
    {
      label: "MRA Reports",
      icon: <ReportIcon fontSize="large" />,
      path: "/reports",
      color: "#66BB6A",
      subtitle: "Generate comprehensive reports",
    },
    {
      label: "QA Metrics",
      icon: <ManageAccountsIcon fontSize="large" />,
      path: "/qa-metrics",
      color: "#FF6384",
      subtitle: "Assess QA performance",
    },
    {
      label: "Admin Tools",
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      path: "/admin-tools",
      color: "#F57C00",
      subtitle: "Access admin-specific tools",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #000, #1a1a1a)"
          : "linear-gradient(135deg, #e0efff, #ffffff)",
        py: 6,
        px: { xs: 2, sm: 4, md: 8 },
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: isDark ? "#fff" : "#1E73BE",
          mb: 2,
          fontFamily: "Open Sans, sans-serif",
        }}
      >
        Dashboard Home
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: isDark ? "#ccc" : "#555",
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
                    height: "155px",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    borderRadius: 2,
                    background: isDark
                      ? "linear-gradient(135deg, #000, #1a1a1a)"
                      : "linear-gradient(135deg, #f7f9fc, #ffffff)",
                    border: isDark ? "1px solid #fff" : "1px solid #666",
                    color: isDark ? "#fff" : "inherit",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  onClick={() => navigate(module.path)}
                >
                  <IconButton
                    size="large"
                    sx={{
                      mb: 1,
                      backgroundColor: module.color,
                      borderRadius: "50%",
                      p: 1,
                      "&:hover": { backgroundColor: module.color },
                    }}
                  >
                    {React.cloneElement(module.icon, {
                      sx: { color: "#fff", fontSize: "large" },
                    })}
                  </IconButton>
                  <Typography
  variant="h6"
  sx={{ fontWeight: 600, mb: 1, color: isDark ? "#fff" : "inherit" }}
>
                    {module.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? "#ddd" : "#777" }}>
                    {module.subtitle}
                  </Typography>
                </Paper>
              </Tooltip>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Scrolling News Ticker replacing static heading */}
<Box sx={{ mt: 6 }}>
  <NewsTicker
    messages={[
      "✅ Accomplished: Refactored Email, Table, Global Map components to use the new simplified Master/Transactional schema.",
      "Pending: Update Chart component to derive visualizations from the new data structure.",
      "Pending: Update QAMetrics and Reports to reflect updated metrics.",
      "Pending: Integrate with DB exports in new JSON schema for proof-of-concept.",
    ]}
    sx={{ fontSize: "1.5rem" }}
  />
</Box>

      {/* World Map Section */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ borderRadius: "12px", overflow: "hidden" }}>
          <WorldMap reviewers={AdminFLData} />
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "Open Sans, sans-serif",
            color: isDark ? "#fff !important" : "#888",
          }}
        >
          © {new Date().getFullYear()} MRA Interactive Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
