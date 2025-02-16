import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  size?: number;
}

const NotificationCheckin = ({ size = 16 }: NotificationIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 11l3 3L20 6M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"
      stroke="#22C55E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default NotificationCheckin; 