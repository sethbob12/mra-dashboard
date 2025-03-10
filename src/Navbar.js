// src/Navbar.js
import React from "react";
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import growthChartGif from "./assets/growth-chart.gif";
import houseChimney from "./assets/house-chimney.png";
import tableGif from "./assets/table.gif";
import threeGif from "./assets/3.gif";
import doveGif from "./assets/dove.gif";
import reportsGif from "./assets/reports.gif";
import oneGif from "./assets/1.gif";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  // Common style for icon images
  const iconStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
  };

  // Determine which logo to show based on the current path.
  let logoElement;
  if (location.pathname === "/login") {
    logoElement = <img src={growthChartGif} alt="Growth Chart" style={iconStyle} />;
  } else if (location.pathname === "/") {
    logoElement = <img src={houseChimney} alt="Home" style={iconStyle} />;
  } else if (location.pathname === "/table") {
    logoElement = <img src={tableGif} alt="Data Table" style={iconStyle} />;
  } else if (location.pathname === "/chart") {
    logoElement = <img src={threeGif} alt="Visualizations" style={iconStyle} />;
  } else if (location.pathname === "/emails") {
    logoElement = <img src={doveGif} alt="Email Generator" style={iconStyle} />;
  } else if (location.pathname === "/reports") {
    logoElement = <img src={reportsGif} alt="MRA Reports" style={iconStyle} />;
  } else if (location.pathname === "/qa-metrics") {
    logoElement = <img src={oneGif} alt="QA Metrics" style={iconStyle} />;
  } else {
    logoElement = <DashboardIcon />;
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        background: "linear-gradient(90deg, #1E73BE 0%, #0C3B70 100%)",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        py: 1,
        px: 2,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Left side: Logo and title */}
        <Box
          component={NavLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "white",
            "&:hover": { opacity: 0.9 },
          }}
        >
          <IconButton size="large" edge="start" color="inherit" aria-label="dashboard" sx={{ mr: 1 }}>
            {logoElement}
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              letterSpacing: ".5px",
              fontFamily: "Open Sans, sans-serif",
            }}
          >
            MRA Dashboard
          </Typography>
        </Box>

        {/* Right side: Navigation links and logout */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {[
            { label: "Data Table", path: "/table" },
            { label: "Visualizations", path: "/chart" },
            { label: "Email Generator", path: "/emails" },
            { label: "MRA Reports", path: "/reports" },
            { label: "QA Metrics", path: "/qa-metrics" },
          ].map((item) => (
            <Button
              key={item.label}
              component={NavLink}
              to={item.path}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 500,
                transition: "transform 0.3s ease, background-color 0.3s ease",
                "&.active": { borderBottom: "3px solid white" },
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            onClick={handleLogout}
            sx={{
              color: "white",
              textTransform: "none",
              fontWeight: 500,
              transition: "transform 0.3s ease, background-color 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "scale(1.05)",
              },
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
