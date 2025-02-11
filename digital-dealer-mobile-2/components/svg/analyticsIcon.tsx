import React from "react";
import Svg, { Path } from "react-native-svg";

interface AnalyticsIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const AnalyticsIcon: React.FC<AnalyticsIconProps> = ({
  width = 17,
  height = 18,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 18" fill="none">
      <Path
        d="M2.11914 2.4823V15.7099H15.3468M5.42605 10.7497L8.3196 7.85611L10.3864 9.92293L14.9334 5.37593M11.8399 4.96248H15.3474V8.46999"
        stroke={stroke}
        strokeWidth="1.37788"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default AnalyticsIcon;
