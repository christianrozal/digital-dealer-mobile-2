import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface YouTubeIconProps {
  width?: number;
  height?: number;
  bgColor?: string;
  fgColor?: string;
}

const YouTubeIcon: React.FC<YouTubeIconProps> = ({
  width = 26,
  height = 26,
  bgColor = "#3D12FA",
  fgColor = "white",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 26" fill="none">
      <Rect
        x="0.0634766"
        y="-0.00927734"
        width="25.1541"
        height="25.1541"
        rx="12.5771"
        fill={bgColor}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9399 8.66551C18.5201 8.8217 18.9775 9.27914 19.1337 9.85929C19.4238 10.9192 19.4126 13.1283 19.4126 13.1283C19.4126 13.1283 19.4126 15.3262 19.1337 16.3861C18.9775 16.9662 18.5201 17.4237 17.9399 17.5799C16.88 17.8588 12.6404 17.8588 12.6404 17.8588C12.6404 17.8588 8.41194 17.8588 7.34087 17.5687C6.76072 17.4125 6.30328 16.9551 6.14709 16.3749C5.86816 15.3262 5.86816 13.1171 5.86816 13.1171C5.86816 13.1171 5.86816 10.9192 6.14709 9.85929C6.30328 9.27914 6.77187 8.81055 7.34087 8.65435C8.40078 8.37543 12.6404 8.37543 12.6404 8.37543C12.6404 8.37543 16.88 8.37543 17.9399 8.66551ZM14.8162 13.1171L11.2906 15.1477V11.0865L14.8162 13.1171Z"
        fill={fgColor}
      />
    </Svg>
  );
};

export default YouTubeIcon;
