// src/LoginPage.js /* No REFACTOR needed, currently just handles authentication locally. Fi need to move authentication to live API endpoint, will need to REFACTOR though */
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

// Container variants for staggering the ripple effect on hover.
const containerVariants = {
  initial: {},
  hover: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Ripple variants for each cell. 
const cellVariants = {
  initial: { borderColor: "transparent" },
  hover: {
    borderColor: ["transparent", "rgba(255, 0, 0, 0.8)", "transparent"],
    transition: { duration: 0.8, ease: "easeInOut" },
  },
};

export default function LoginPage() {
  const [code, setCode] = useState(new Array(5).fill(""));
  const [error, setError] = useState("");
  const [reaction, setReaction] = useState(0);
  const [success, setSuccess] = useState(false);
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

    // Move focus to next input if not the last one
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
      setSuccess(true);
      localStorage.setItem("isAuthenticated", "true");
      // Delay navigation to allow visual success indication
      setTimeout(() => {
        navigate("/");
      }, 300);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Background animation layer */}
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

      {/* Foreground content (login card) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          pt: "10vh",
          height: "100%",
        }}
      >
        <Card sx={{ width: 320, boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
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
            {/* Container for input cells with hover-triggered ripple effect */}
            <motion.div
              variants={containerVariants}
              initial="initial"
              whileHover="hover"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              {code.map((value, index) => (
                <motion.div
                  key={index}
                  variants={cellVariants}
                  style={{
                    display: "inline-block",
                    borderRadius: "8px",
                    border: "2px solid transparent",
                  }}
                >
                  <TextField
                    variant="outlined"
                    value={value}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputProps={{
                      maxLength: 1,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      style: {
                        textAlign: "center",
                        fontSize: "1.5rem",
                        padding: "0.5rem",
                      },
                    }}
                    sx={{
                      width: "3rem",
                      backgroundColor: "transparent",
                      "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                    }}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                  />
                </motion.div>
              ))}
            </motion.div>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleLogin()}
              sx={{
                mt: 3,
                backgroundColor: success ? "green" : "#0C3B70",
                "&:hover": { backgroundColor: success ? "darkgreen" : "#092a55" },
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
