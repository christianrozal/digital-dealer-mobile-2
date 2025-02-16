import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  size?: number;
}

const NotificationAppointment = ({ size = 16 }: NotificationIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2v3m8-3v3M3.5 9h17M21 8.5v9.786c0 1.497-1.253 2.714-2.786 2.714H5.786C4.253 21 3 19.783 3 18.286V8.5C3 7.003 4.253 5.786 5.786 5.786h12.428C19.747 5.786 21 7.003 21 8.5z"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 15h8"
      stroke="#9333EA"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default NotificationAppointment; 