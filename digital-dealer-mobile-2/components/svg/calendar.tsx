import React from "react";
import Svg, { Path } from "react-native-svg";

interface CalendarIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({
  width = 12,
  height = 11,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 11" fill="none">
      <Path
        d="M3.01784 4.11906H9.28315M3.82764 1.47229V2.16284M8.38811 1.47229V2.16275M8.38811 2.16275H3.91288C3.1714 2.16275 2.57031 2.78101 2.57031 3.54367V8.14678C2.57031 8.90944 3.1714 9.5277 3.91288 9.5277H8.38811C9.12959 9.5277 9.73067 8.90944 9.73067 8.14678L9.73068 3.54367C9.73068 2.78101 9.12959 2.16275 8.38811 2.16275Z"
        stroke={stroke}
        strokeWidth="0.895045"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.67425 5.5L5.56841 7.61775L4.85059 6.89586"
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CalendarIcon;
