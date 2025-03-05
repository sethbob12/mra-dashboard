// src/LoginPage.js
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundAnimation from "./BackgroundAnimation";

export default function LoginPage() {
  const [code, setCode] = useState(new Array(5).fill(""));
  const [error, setError] = useState("");
  const [reaction, setReaction] = useState(0);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Valid 5-digit passwords
  const validPasswords = ["12345", "23456", "34567", "45678", "56789"];

  // Auto-focus the first input on mount.
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (element.value.length > 1) return; // Only allow one character per field
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // Increment reaction when a non-empty digit is entered.
    if (element.value !== "") {
      setReaction((prev) => prev + 1);
    }

    // Move focus to the next input if not the last one
    if (element.value && index < 4) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-trigger login when the last digit is entered and all fields are filled.
    if (index === 4 && newCode.every((val) => val !== "")) {
      handleLogin(newCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleLogin = (currentCode) => {
    const enteredCode = (currentCode || code).join("");
    if (validPasswords.includes(enteredCode)) {
      setError("");
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>
      {/* LEFT PANEL: Full-height image with gradient overlay */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          // A background image from Unsplash. Replace with your own if desired.
          backgroundImage:
            "url('https://images.unsplash.com/photo-1616401785185-6f465ad2e604?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Optional gradient overlay for better text contrast */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(30, 115, 190, 0.6) 0%, rgba(12, 59, 112, 0.6) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              mb: 2,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            MRA Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#fff",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            Welcome to the place where data meets insight.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT PANEL: background animation & login card */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          p: 2,
        }}
      >
        {/* Background animation behind the login card */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <BackgroundAnimation reaction={reaction} />
        </Box>

        {/* Login Card with rounded corners */}
        <Card
          sx={{
            width: 320,
            boxShadow: 4,
            borderRadius: "16px", // more pronounced rounded corners
            zIndex: 1, // ensure card is above the animation
            py: 3,     // extra vertical padding to reduce empty space
          }}
        >
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body2" align="center" gutterBottom>
              Please enter the 5-digit passcode to access the dashboard.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mt: 2,
              }}
            >
              {code.map((value, index) => (
                <TextField
                  key={index}
                  variant="outlined"
                  value={value}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      padding: "0.5rem",
                    },
                  }}
                  sx={{
                    width: "3rem",
                    "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                  }}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleLogin()}
              sx={{
                mt: 3,
                backgroundColor: "#0C3B70",
                "&:hover": { backgroundColor: "#092a55" },
              }}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
