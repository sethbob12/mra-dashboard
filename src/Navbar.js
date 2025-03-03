import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#1E73BE",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        py: 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          component={NavLink}
          to="/"
          sx={{
            fontWeight: "bold",
            letterSpacing: ".5px",
            color: "white",
            textDecoration: "none",
            fontFamily: "Open Sans, sans-serif",
          }}
        >
          MRA Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {[
            { label: "Data Table", path: "/table" },
            { label: "Visualizations", path: "/chart" },
            { label: "Email Generator", path: "/emails" },
            { label: "Reports & Insights", path: "/reports" },
          ].map((item) => (
            <Button
              key={item.label}
              component={NavLink}
              to={item.path}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 500,
                px: 2,
                py: 1,
                transition: "0.3s ease-in-out",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                "&.active": { borderBottom: "3px solid white" },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
