// components/svg/chevronUp.tsx
import React from "react";

const ChevronUpIcon = ({ width = 24, height = 24, fill = "#6B7280" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
  </svg>
);

export default ChevronUpIcon;
