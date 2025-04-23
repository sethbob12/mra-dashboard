// src/Navbar.js
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Button, Box, Divider } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BugReportIcon from "@mui/icons-material/BugReport";
import ReceiptIcon from "@mui/icons-material/Receipt"; // ← Billing Reports icon

import growthChartGif from "./assets/growth-chart.gif";
import houseChimney from "./assets/house-chimney.png";
import tableGif from "./assets/table.gif";
import threeGif from "./assets/3.gif";
import doveGif from "./assets/dove.gif";
import reportsGif from "./assets/reports.gif";
import oneGif from "./assets/1.gif";
import mraDashboardGif from "./assets/MRADashboard.gif";

const Navbar = ({ mode, toggleTheme }) => {
  const [logoKey, setLogoKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLogoKey(Date.now());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const iconStyle = {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    boxShadow: "0px 3px 6px rgba(0,0,0,0.5)",
  };

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
        return <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#FFA726" }} />;
      case "/billing":
        return <ReceiptIcon sx={{ fontSize: 40, color: "#FFD54F" }} />;
      case "/test-live":
        return <BugReportIcon sx={{ fontSize: 40, color: "white" }} />;
      default:
        return <img src={houseChimney} alt="Dashboard" style={iconStyle} />;
    }
  };

  const navItems = [
    { label: "Test Live",        path: "/test-live"    },
    { label: "Data Table",       path: "/table"        },
    { label: "Visualizations",   path: "/chart"        },
    { label: "Email Generator",  path: "/emails"       },
    { label: "MRA Reports",      path: "/reports"      },
    { label: "QA Metrics",       path: "/qa-metrics"   },
    { label: "Billing Reports",  path: "/billing"      }, // ← new entry
    { label: "Admin Tools",      path: "/admin-tools"  },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(135deg, #1E73BE 0%, #0C3B70 100%)",
        boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
        zIndex: 1300,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "center",
          overflowX: "auto",
          minHeight: 70,
          pt: 1,
          pb: 1,
          px: 3,
          gap: 2,
        }}
      >
        {/* Logo/Home Link */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Box
            component={NavLink}
            to="/"
            onClick={() => setLogoKey(Date.now())}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              backgroundColor: "rgba(255,255,255,0.6)",
              padding: 0.5,
              borderRadius: 2,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
              border: "2px solid rgba(0,0,0,0.8)",
              height: "55px",
            }}
          >
            <img
              key={location.pathname + "-" + logoKey}
              src={`${mraDashboardGif}?t=${logoKey}`}
              alt="MRA Dashboard"
              style={{ height: "100%" }}
            />
          </Box>
        </Box>

        {/* Navigation Links */}
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
                  ...(item.path === "/test-live" && {
                    backgroundColor: "#4caf50",
                    fontWeight: "bold",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "#43a047",
                      transform: "scale(1.06)",
                    },
                  }),
                }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <Box sx={{ ml: 1 }}>{getSectionIcon(item.path)}</Box>
                )}
              </Button>
              {index < navItems.length - 1 && (
                <Divider orientation="vertical" sx={{ borderColor: "white", height: 24, mx: 0.5, opacity: 0.7 }} />
              )}
            </React.Fragment>
          ))}

          <Divider orientation="vertical" sx={{ borderColor: "white", height: 24, mx: 1, opacity: 0.7 }} />

          {/* Logout */}
          <Button
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            sx={{
              color: "white",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: 4,
              px: 2,
              py: 0.75,
              position: "relative",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
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
