// src/BackgroundAnimation.js
import React from "react";
import { Box } from "@mui/material";
import { motion, useMotionValue, animate } from "framer-motion";

// Bubble component – now uses nested motion.div's for interactive hover effect.
const Bubble = ({ bubble, reaction }) => {
  const scale = useMotionValue(1);
  // Outer offsets for hover interactivity
  const xOffset = useMotionValue(0);
  const yOffset = useMotionValue(0);

  React.useEffect(() => {
    const pulse = animate(scale, 1.2, { duration: 0.25 }).then(() =>
      animate(scale, 1, { duration: 0.25 })
    );
    return pulse.stop;
  }, [reaction, scale]);

  // Animate outer offsets on hover
  const handleHoverStart = () => {
    const randomX = Math.random() * 50 - 25; // between -25 and 25
    const randomY = Math.random() * 50 - 25; // between -25 and 25
    animate(xOffset, randomX, { duration: 0.3 });
    animate(yOffset, randomY, { duration: 0.3 });
  };

  const handleHoverEnd = () => {
    animate(xOffset, 0, { duration: 0.3 });
    animate(yOffset, 0, { duration: 0.3 });
  };

  return (
    <motion.div
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        x: xOffset,
        y: yOffset,
        position: "absolute",
        top: `${bubble.topPosition}%`,
        left: `${bubble.leftPosition}%`,
      }}
    >
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{
          x: [0, bubble.drift, 0],
          y: [0, -20, 0],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 6,
          delay: bubble.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          borderRadius: "50%",
          backgroundColor: bubble.color,
          scale,
        }}
      />
    </motion.div>
  );
};

const BackgroundAnimation = ({ reaction }) => {
  const bubbleCount = 15;
  const columns = 5;
  const rows = Math.ceil(bubbleCount / columns);
  const gridWidth = 80;
  const gridHeight = 50;
  const cellWidth = gridWidth / columns;
  const cellHeight = gridHeight / rows;
  const horizontalOffset = 10;
  const marginFactor = 0.1;
  const rangeFactor = 0.8;
  const bubbles = React.useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => {
      const row = Math.floor(i / columns);
      const col = i % columns;
      const offsetX = (Math.random() * (cellWidth * rangeFactor)) + (cellWidth * marginFactor);
      const offsetY = (Math.random() * (cellHeight * rangeFactor)) + (cellHeight * marginFactor);
      return {
        key: i,
        topPosition: row * cellHeight + offsetY,
        leftPosition: horizontalOffset + col * cellWidth + offsetX,
        delay: Math.random() * 2,
        drift: Math.random() * 30 - 15,
        size: Math.random() * 40 + 30,
        color: [
          "rgba(30, 115, 190, 0.20)",   // bluish
          "rgba(128, 128, 128, 0.20)",  // gray
          "rgba(192, 192, 192, 0.20)",  // silver
          "rgba(219, 185, 166, 0.20)",  // muted tone
          "rgba(70, 130, 180, 0.20)",   // steelblue
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
        height: "100vh", // Full viewport height
        overflow: "hidden",
        // Remove pointerEvents so bubbles can respond to mouse events
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
