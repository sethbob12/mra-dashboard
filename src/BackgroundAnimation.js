// src/BackgroundAnimation.js
import React from "react";
import { Box } from "@mui/material";
import { motion, useMotionValue, animate } from "framer-motion";

// Bubble component – handles its own hooks and animation pulse.
const Bubble = ({ bubble, reaction }) => {
  const scale = useMotionValue(1);

  React.useEffect(() => {
    const pulse = animate(scale, 1.4, { duration: 0.25 }).then(() =>
      animate(scale, 1, { duration: 0.25 })
    );
    return pulse.stop;
  }, [reaction, scale]);

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0.3 }}
      animate={{
        x: [0, bubble.drift, 0],
        y: [0, -20, 0],
        opacity: [0.3, 1, 1],
      }}
      transition={{
        duration: 6,
        delay: bubble.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top: `${bubble.topPosition}%`,
        left: `${bubble.leftPosition}%`,
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
        borderRadius: "50%",
        backgroundColor: bubble.color,
        scale, // attach the scale motion value for the pulse
      }}
    />
  );
};

const BackgroundAnimation = ({ reaction }) => {
  const bubbleCount = 15;
  const columns = 5;
  const rows = Math.ceil(bubbleCount / columns);

  // Restrict bubble placement to the upper 50% height and 80% width.
  const gridWidth = 80; // 80% of container width
  const gridHeight = 50; // 50% of container height
  const cellWidth = gridWidth / columns; // Each cell's width (in %)
  const cellHeight = gridHeight / rows;   // Each cell's height (in %)
  const horizontalOffset = 10; // Center grid horizontally (since 100 - 80 = 20, so 10% each side)

  // Adjust margins inside each cell to bring bubbles closer.
  const marginFactor = 0.1; 
  const rangeFactor = 0.8;  

  // Generate bubble data using the grid area.
  const bubbles = React.useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => {
      const row = Math.floor(i / columns);
      const col = i % columns;
      // Randomize position within each cell with a smaller margin.
      const offsetX = (Math.random() * (cellWidth * rangeFactor)) + (cellWidth * marginFactor);
      const offsetY = (Math.random() * (cellHeight * rangeFactor)) + (cellHeight * marginFactor);
      return {
        key: i,
        topPosition: row * cellHeight + offsetY,      // within grid height (0 to 50)
        leftPosition: horizontalOffset + col * cellWidth + offsetX, // grid starts at 10%
        delay: Math.random() * 2,
        drift: Math.random() * 30 - 15,             // horizontal drift between -15 and +15
        // Random sizes between 30px and 70px.
        size: Math.random() * 40 + 30,
        // Colors with slightly more transparency (alpha 0.15).
        color: [
          "rgba(30, 115, 190, 0.15)",   // bluish
          "rgba(128, 128, 128, 0.15)",  // gray
          "rgba(192, 192, 192, 0.15)",  // silver
          "rgba(219, 185, 166, 0.15)",  // muted tone
          "rgba(70, 130, 180, 0.15)",   // steelblue
        ][Math.floor(Math.random() * 5)],
      };
    });
  }, [bubbleCount, columns, cellWidth, cellHeight, horizontalOffset]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none", // Allow clicks to pass through this layer.
        zIndex: 0,
      }}
    >
      {bubbles.map((bubble) => (
        <Bubble key={bubble.key} bubble={bubble} reaction={reaction} />
      ))}
    </Box>
  );
};

export default BackgroundAnimation;
