import React from 'react';

interface CheckIconProps {
  width?: number;
  height?: number;
}

const CheckIcon: React.FC<CheckIconProps> = ({ width = 16, height = 16 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <circle cx={8.22729} cy={8.01343} r={7.50952} fill="#07AA30" />
      <path
        d="M5.22559 8.30475L6.85247 10.2012L11.2286 5.8252"
        stroke="white"
        strokeWidth={1.12199}
      />
    </svg>
  );
};

export default CheckIcon;