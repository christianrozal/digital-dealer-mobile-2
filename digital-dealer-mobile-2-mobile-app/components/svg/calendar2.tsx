import React from "react";
import Svg, { Path } from "react-native-svg";

interface Calendar2IconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const Calendar2Icon: React.FC<Calendar2IconProps> = ({
  width = 12,
  height = 11,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 19" fill="none">
      <Path
        d="M6.4196 13.2349V13.1765M9.81401 13.2349V13.1765M9.81401 10.0731V10.0148M12.8313 10.0731V10.0148M4.15666 6.96962H14.717M5.5216 2.50842V3.67236M13.2084 2.50842V3.67221M13.2084 3.67221H5.66528C4.4155 3.67221 3.40234 4.71431 3.40234 5.9998V13.7585C3.40234 15.044 4.4155 16.0861 5.66528 16.0861H13.2084C14.4582 16.0861 15.4714 15.044 15.4714 13.7585L15.4714 5.9998C15.4714 4.71431 14.4582 3.67221 13.2084 3.67221Z"
        stroke={stroke}
        strokeWidth="1.50863"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Calendar2Icon;