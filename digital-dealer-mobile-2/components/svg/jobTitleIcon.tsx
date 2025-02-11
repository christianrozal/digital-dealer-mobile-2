import React from "react";
import Svg, { Path } from "react-native-svg";

interface JobTitleIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const JobTitleIcon: React.FC<JobTitleIconProps> = ({
  width = 18,
  height = 19,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 19" fill="none">
      <Path
        d="M6.13328 6.45898V4.80639C6.13328 4.35005 6.51974 3.9801 6.99646 3.9801H10.0176C10.4943 3.9801 10.8808 4.35005 10.8808 4.80639V6.45898M3.54374 14.7219H13.9019C14.8553 14.7219 15.6283 13.982 15.6283 13.0693V8.11156C15.6283 7.19886 14.8553 6.45898 13.9019 6.45898H3.54374C2.5903 6.45898 1.81738 7.19886 1.81738 8.11156V13.0693C1.81738 13.982 2.5903 14.7219 3.54374 14.7219Z"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default JobTitleIcon;
