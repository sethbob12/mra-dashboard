import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const NewsTicker = ({ messages }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        backgroundColor: isDark ? "#121212" : "#f0f4f8",
        borderRadius: "8px",
        px: 2,
        py: 1,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          display: "inline-block",
          paddingLeft: "100%",
          animation: "scrollText 45s linear infinite",
          fontWeight: 600,
          color: isDark ? "#fff" : "#333",
        }}
      >
        {messages.join("   —   ")}
      </Typography>

      <style>
        {`
          @keyframes scrollText {
            from { transform: translateX(0%); }
            to { transform: translateX(-100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default NewsTicker;
