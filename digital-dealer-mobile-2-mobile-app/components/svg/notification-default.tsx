import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  size?: number;
}

const NotificationDefault = ({ size = 16 }: NotificationIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 16v-4m0-4h.01"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default NotificationDefault; 