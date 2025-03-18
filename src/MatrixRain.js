// src/MatrixRain.js
import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas to fill the window.
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const lettersArr = letters.split('');
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    // Create an array of drops - one per column.
    const drops = Array.from({ length: columns }).fill(1);

    const draw = () => {
      // Fade the canvas slightly to create the trailing effect.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0'; // bright green color
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = lettersArr[Math.floor(Math.random() * lettersArr.length)];
        // Draw the letter at the current drop position.
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        // Reset drop to top randomly after it passes the bottom.
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(draw);
    };

    draw();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: 0.01, // Adjust for desired faintness
      }}
    />
  );
};

export default MatrixRain;
