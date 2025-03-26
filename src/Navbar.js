// src/Navbar.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import growthChartGif from "./assets/growth-chart.gif";
import houseChimney from "./assets/house-chimney.png";
import tableGif from "./assets/table.gif";
import threeGif from "./assets/3.gif";
import doveGif from "./assets/dove.gif";
import reportsGif from "./assets/reports.gif";
import oneGif from "./assets/1.gif";
import mraDashboardGif from "./assets/MRADashboard.gif"; // Animated logo GIF

const Navbar = ({ mode, toggleTheme }) => {
  const [logoKey, setLogoKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  // Common style for icon images
  const iconStyle = {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    boxShadow: "0px 3px 6px rgba(0,0,0,0.5)",
  };

  // Helper to return an icon for a given section
  const getSectionIcon = (path) => {
    switch (path) {
      case "/login":
        return <img src={growthChartGif} alt="Growth Chart" style={iconStyle} />;
      case "/table":
        return <img src={tableGif} alt="Data Table" style={iconStyle} />;
      case "/chart":
        return <img src={threeGif} alt="Visualizations" style={iconStyle} />;
      case "/emails":
        return <img src={doveGif} alt="Email Generator" style={iconStyle} />;
      case "/reports":
        return <img src={reportsGif} alt="MRA Reports" style={iconStyle} />;
      case "/qa-metrics":
        return <img src={oneGif} alt="QA Metrics" style={iconStyle} />;
      case "/admin-tools":
        return <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />;
      default:
        return <img src={houseChimney} alt="Dashboard" style={iconStyle} />;
    }
  };

  // Navigation items for full dashboard
  const navItems = [
    { label: "Data Table", path: "/table" },
    { label: "Visualizations", path: "/chart" },
    { label: "Email Generator", path: "/emails" },
    { label: "MRA Reports", path: "/reports" },
    { label: "QA Metrics", path: "/qa-metrics" },
    { label: "Admin Tools", path: "/admin-tools" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(135deg, #1E73BE 0%, #0C3B70 100%)",
        boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1300,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          overflowX: "auto",
          minHeight: 70,
          pt: 1,
          pb: 0,
          px: 3,
          gap: 2,
        }}
      >
        {/* Left side: Home icon and animated logo */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
          <IconButton
            component={NavLink}
            to="/"
            size="large"
            color="inherit"
            aria-label="home"
            sx={{
              mr: 1,
              "&:hover": { transform: "scale(1.07)" },
              transition: "transform 0.3s ease",
            }}
          >
            <HomeIcon sx={{ fontSize: 32 }} />
          </IconButton>

          <Divider
            orientation="vertical"
            sx={{
              borderColor: "black",
              height: 40,
              alignSelf: "center",
              mr: 2,
              opacity: 0.9,
            }}
          />

          {/* Animated logo that replays on click or when route changes */}
          <Box
            component={NavLink}
            to="/"
            onClick={() => setLogoKey(Date.now())}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              textDecoration: "none",
            }}
          >
            <img
              key={location.pathname + "-" + logoKey}
              src={mraDashboardGif}
              alt="MRA Dashboard"
              style={{ height: 60 }}
            />
          </Box>
        </Box>

        {/* Right side: Navigation links and logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          {navItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <Button
                component={NavLink}
                to={item.path}
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontSize: "1rem",
                  transition: "transform 0.3s ease, background-color 0.3s ease",
                  "&.active": { borderBottom: "3px solid white" },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: "scale(1.06)",
                  },
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <Box sx={{ ml: 1 }}>
                    {getSectionIcon(item.path)}
                  </Box>
                )}
              </Button>
              {index < navItems.length - 1 && (
                <Divider
                  orientation="vertical"
                  sx={{ borderColor: "white", height: 24, mx: 0.5, opacity: 0.7 }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Separator divider between navigation items and logout */}
          <Divider
            orientation="vertical"
            sx={{ borderColor: "white", height: 24, mx: 1, opacity: 0.7 }}
          />

          <Button
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            sx={{
              ml: 2.5,
              color: "white",
              backgroundColor: "transparent",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              border: "none",
              borderRadius: 4,
              px: 2,
              py: 0.75,
              position: "relative",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
              "&:after": {
                content: '""',
                position: "absolute",
                width: "0%",
                height: "2px",
                bottom: 0,
                left: "50%",
                backgroundColor: "white",
                transition: "width 0.3s ease-in-out, left 0.3s ease-in-out",
              },
              "&:hover:after": {
                width: "100%",
                left: 0,
              },
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
