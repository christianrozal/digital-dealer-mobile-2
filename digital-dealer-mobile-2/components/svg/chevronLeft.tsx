// components/svg/chevronLeft.tsx
import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface ChevronLeftProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronLeft = ({
  width = 24,
  height = 24,
  color = "#4B5563",
}: ChevronLeftProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChevronLeft;
