// src/Navbar.js
import React from "react";
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

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
        {/* Left side: Brand/logo + title */}
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
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="dashboard"
            sx={{ mr: 1 }}
          >
            <DashboardIcon />
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

        {/* Right side: Navigation links + logout */}
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
                transition: "0.3s ease-in-out",
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
              transition: "0.3s ease-in-out",
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
