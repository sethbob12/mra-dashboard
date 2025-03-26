// ThemeToggleSwitch.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';

// Default animation properties for dark and light states.
export const defaultProperties = {
  dark: {
    circle: { r: 9 },
    mask: { cx: '50%', cy: '23%' },
    svg: { transform: 'rotate(40deg)' },
    lines: { opacity: 0 },
  },
  light: {
    circle: { r: 5 },
    mask: { cx: '100%', cy: '0%' },
    svg: { transform: 'rotate(90deg)' },
    lines: { opacity: 1 },
  },
  springConfig: { mass: 4, tension: 250, friction: 35 },
};

// Global counter to generate unique mask IDs (if multiple toggles are rendered).
let GLOBAL_ID = 0;

const ThemeToggleSwitch = ({
  onChange,
  checked = false,
  size = 24,
  animationProperties = defaultProperties,
  moonColor = 'white',
  sunColor = 'black',
  style,
  ...rest
}) => {
  const [id, setId] = useState(0);

  useEffect(() => {
    GLOBAL_ID += 1;
    setId(GLOBAL_ID);
  }, []);

  // Merge any custom animation properties with the defaults.
  const properties = useMemo(() => {
    if (animationProperties !== defaultProperties) {
      return Object.assign({}, defaultProperties, animationProperties);
    }
    return animationProperties;
  }, [animationProperties]);

  // Choose properties based on the current mode.
  const { circle, svg, lines, mask } = properties[checked ? 'dark' : 'light'];

  // Create animated values using React Spring.
  const svgContainerProps = useSpring({
    ...svg,
    config: properties.springConfig,
  });
  const centerCircleProps = useSpring({
    ...circle,
    config: properties.springConfig,
  });
  const maskedCircleProps = useSpring({
    ...mask,
    config: properties.springConfig,
  });
  const linesProps = useSpring({
    ...lines,
    config: properties.springConfig,
  });

  const toggle = () => onChange(!checked);
  const uniqueMaskId = `circle-mask-${id}`;

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={checked ? moonColor : sunColor}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      onClick={toggle}
      style={{
        cursor: 'pointer',
        ...svgContainerProps,
        ...style,
      }}
      {...rest}
    >
      <mask id={uniqueMaskId}>
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <animated.circle style={maskedCircleProps} r="9" fill="black" />
      </mask>
      <animated.circle
        cx="12"
        cy="12"
        fill={checked ? moonColor : sunColor}
        style={centerCircleProps}
        mask={`url(#${uniqueMaskId})`}
      />
      <animated.g stroke="currentColor" style={linesProps}>
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </animated.g>
    </animated.svg>
  );
};

export default ThemeToggleSwitch;
