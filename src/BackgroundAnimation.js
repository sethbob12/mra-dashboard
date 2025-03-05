// src/BackgroundAnimation.js
import React from "react";
import { Box } from "@mui/material";
import { motion, useMotionValue, animate } from "framer-motion";

// Bubble component – handles its own hooks and animation pulse.
const Bubble = ({ bubble, reaction }) => {
  // Create a persistent motion value for scale
  const scale = useMotionValue(1);

  // When reaction changes, trigger a pulse animation.
  React.useEffect(() => {
    const pulse = animate(scale, 1.2, { duration: 0.25 }).then(() =>
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
  // Generate bubble data only once using useMemo.
  const bubbles = React.useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      key: i,
      topPosition: 1 + Math.random() * 50,      // between 1% and 51%
      leftPosition: 10 + Math.random() * 70,      // between 10% and 80%
      delay: Math.random() * 2,
      drift: Math.random() * 30 - 15,             // horizontal drift between -15 and +15
      size: Math.random() * 20 + 40,              // size between 40px and 60px
      color: [
        "rgba(30, 115, 190, 0.2)",   // bluish
        "rgba(128, 128, 128, 0.2)",  // gray
        "rgba(192, 192, 192, 0.2)",  // silver
        "rgba(100, 149, 237, 0.2)",  // cornflowerblue
        "rgba(70, 130, 180, 0.2)",   // steelblue
      ][Math.floor(Math.random() * 5)],
    }));
  }, []);

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
