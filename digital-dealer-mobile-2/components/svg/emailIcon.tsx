import React from "react";
import Svg, { Path } from "react-native-svg";

interface EmailIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const EmailIcon: React.FC<EmailIconProps> = ({
  width = 12,
  height = 13,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 13" fill="none">
      <Path
        d="M2.68368 4.31986L5.79229 6.55168C5.97178 6.68054 6.2095 6.68054 6.38899 6.55168L9.4976 4.31986M2.94576 10.0272H9.23552C9.81448 10.0272 10.2838 9.54052 10.2838 8.94012V4.59164C10.2838 3.99124 9.81448 3.50452 9.23552 3.50452H2.94576C2.3668 3.50452 1.89746 3.99124 1.89746 4.59164V8.94012C1.89746 9.54052 2.3668 10.0272 2.94576 10.0272Z"
        stroke={stroke}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default EmailIcon;
