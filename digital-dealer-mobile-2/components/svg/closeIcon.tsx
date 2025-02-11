import React from "react";
import Svg, { Path } from "react-native-svg";

interface CloseIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  width = 25,
  height = 25,
  stroke = "black",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M17.1846 7.37866L7.8125 16.7507M17.1846 16.7507L7.8125 7.37866"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default CloseIcon;
