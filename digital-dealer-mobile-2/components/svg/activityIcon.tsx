import React from "react";
import Svg, { Path } from "react-native-svg";

interface ActivityIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({
  width = 25,
  height = 25,
  stroke = "#BECAD6",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M4.81055 12.1813H8.81055L10.851 5.51526L15.2487 19.5153L16.8009 12.1813H20.8105"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ActivityIcon;
