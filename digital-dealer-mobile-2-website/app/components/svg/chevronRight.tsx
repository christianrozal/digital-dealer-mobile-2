// components/svg/chevronRight.tsx
import * as React from "react";

interface ChevronRightProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronRight = ({
  width = 24,
  height = 24,
  color = "#4B5563",
}: ChevronRightProps) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 5l7 7-7 7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ChevronRight;
