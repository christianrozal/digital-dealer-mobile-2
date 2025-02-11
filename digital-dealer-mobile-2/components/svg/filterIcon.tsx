import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface FilterIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  showCircle?: boolean;
}

const FilterIcon: React.FC<FilterIconProps> = ({
  width = 22,
  height = 22,
  stroke = "black",
  showCircle = false,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
      <Path
        d="M5.79592 11.1827H15.7145M3.5918 6.70557H17.9186M9.10211 15.6598H12.4083"
        stroke={stroke}
        strokeWidth="1.79085"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showCircle && (
        <Circle
          cx="16.978"
          cy="6.70557"
          r="3.42432"
          fill="#3D12FA"
          stroke="white"
        />
      )}
    </Svg>
  );
};

export default FilterIcon;
