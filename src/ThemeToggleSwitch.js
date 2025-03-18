// src/ThemeToggleSwitch.js
import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Tooltip } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Sun icon
import NightlightRoundIcon from "@mui/icons-material/NightlightRound"; // Moon icon

const ToggleContainer = styled(Box)(({ checked }) => ({
  width: 50, // Reduced width
  height: 25, // Reduced height
  borderRadius: 12.5,
  backgroundColor: !checked ? "#feedc2" : "#000", // Light mode: warm color, dark mode: black
  position: "relative",
  cursor: "pointer",
  userSelect: "none",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Constant shadow
}));

const Thumb = styled(Box)(({ checked }) => ({
  width: 25, // Reduced size
  height: 25,
  borderRadius: "50%",
  backgroundColor: "#fff",
  position: "absolute",
  top: 0,
  left: checked ? 26 : 0.1, // Adjusted positions based on reduced width
  transition: "left 0.3s ease",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)", // Constant shadow
}));

const IconWrapper = styled(Box)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 23, // Smaller icon wrapper size
});

const ThemeToggleSwitch = ({ checked, onChange }) => {
  return (
    <Tooltip title={checked ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <ToggleContainer onClick={onChange} checked={checked}>
        {/* Moon icon on left */}
        <IconWrapper sx={{ left: 4 }}>
          <NightlightRoundIcon
            sx={{ fontSize: 16, color: checked ? "#fff" : "#555", opacity: 1 }}
          />
        </IconWrapper>
        {/* Sun icon on right */}
        <IconWrapper sx={{ right: 4 }}>
          <WbSunnyIcon
            sx={{ fontSize: 16, color: "#FDB813", opacity: checked ? 0.4 : 1 }}
          />
        </IconWrapper>
        <Thumb checked={checked} />
      </ToggleContainer>
    </Tooltip>
  );
};

export default ThemeToggleSwitch;
