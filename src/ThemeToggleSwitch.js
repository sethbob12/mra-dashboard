// src/ThemeToggleSwitch.js
import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Sun icon
import NightlightRoundIcon from "@mui/icons-material/NightlightRound"; // Moon icon

const ToggleContainer = styled(Box)(({ checked }) => ({
  width: 60,
  height: 30,
  borderRadius: 15,
  backgroundColor: !checked ? "#feedc2" : "#000", // Light mode: warm color, dark mode: black
  position: "relative",
  cursor: "pointer",
  userSelect: "none",
}));

const Thumb = styled(Box)(({ checked }) => ({
  width: 26,
  height: 26,
  borderRadius: "50%",
  backgroundColor: "#fff",
  position: "absolute",
  top: 2,
  left: checked ? 32 : 2,
  transition: "left 0.3s ease",
}));

const IconWrapper = styled(Box)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 27,
});

const ThemeToggleSwitch = ({ checked, onChange }) => {
  return (
    <ToggleContainer onClick={onChange} checked={checked}>
      {/* Moon icon on left */}
      <IconWrapper sx={{ left: 6 }}>
        <NightlightRoundIcon
          sx={{ fontSize: 18, color: checked ? "#fff" : "#555", opacity: 1 }}
        />
      </IconWrapper>
      {/* Sun icon on right */}
      <IconWrapper sx={{ right: 6 }}>
        <WbSunnyIcon
          sx={{ fontSize: 18, color: "#FDB813", opacity: checked ? 0.4 : 1 }}
        />
      </IconWrapper>
      <Thumb checked={checked} />
    </ToggleContainer>
  );
};

export default ThemeToggleSwitch;
