import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  size?: number;
}

const NotificationScan = ({ size = 16 }: NotificationIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8 7h8v8H8z"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default NotificationScan; 