import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface NotificationsIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  hasUnread?: boolean;
}

const NotificationsIcon: React.FC<NotificationsIconProps> = ({
  width = 18,
  height = 18,
  stroke = "#9EA5AD",
  hasUnread = false,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path
        d="M6.9302 14.6702C7.41775 15.0597 8.06158 15.2965 8.76737 15.2965C9.47317 15.2965 10.117 15.0597 10.6045 14.6702M3.60559 12.666C3.31512 12.666 3.15289 12.2097 3.32859 11.9562C3.7363 11.3679 4.12982 10.5051 4.12982 9.46604L4.14663 7.96048C4.14663 5.16324 6.21541 2.89563 8.76737 2.89563C11.3569 2.89563 13.4562 5.19664 13.4562 8.03508L13.4394 9.46604C13.4394 10.5122 13.8193 11.3797 14.2104 11.9683C14.3793 12.2224 14.2167 12.666 13.9298 12.666H3.60559Z"
        stroke={stroke}
        strokeWidth="1.37788"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {hasUnread && <Circle cx="14" cy="4" r="2" fill="red" />}
    </Svg>
  );
};

export default NotificationsIcon;
