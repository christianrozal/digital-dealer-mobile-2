// components/svg/chevronDown.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

const ChevronDownIcon = ({ width = 24, height = 24, fill = "#6B7280" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
    <Path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

export default ChevronDownIcon;
